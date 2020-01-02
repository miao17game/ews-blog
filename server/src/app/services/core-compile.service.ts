import * as path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import uuid from "uuid/v4";
import { cloneDeep } from "lodash";
import { Injectable } from "@nestjs/common";
import { Factory, GlobalMap, IGlobalMap, IPageCreateOptions } from "@amoebajs/builder";
import { CompileService } from "@global/services/compile.service";

export enum CompileTaskStatus {
  Pending,
  Running,
  Failed,
  Done,
}

export interface ICompileTask {
  id: string;
  name: string;
  status: CompileTaskStatus;
  configs: IPageCreateOptions;
  errorMsg?: string;
}

export interface IWebsitePageHash {
  [name: string]: {
    latest: string;
    files: {
      [key: string]: string;
    };
  };
}

const ASSETS_DIR = path.resolve(__dirname, "..", "..", "assets");
const INTERVAL = 1000;

@Injectable()
export class CoreCompiler implements CompileService<ICompileTask> {
  private _factory = new Factory();
  private _tasks: ICompileTask[] = [];
  private _hash: IWebsitePageHash = {};
  private _mapCache!: IGlobalMap;

  private get builder() {
    return this._factory.builder;
  }

  private get running() {
    return this._tasks.findIndex(i => i.status === CompileTaskStatus.Running) >= 0;
  }

  constructor() {
    this.autoWatch(INTERVAL);
  }

  public getTemplateGroup(): IGlobalMap {
    return this._mapCache || (this._mapCache = cloneDeep(this._factory.builder.get(GlobalMap).maps));
  }

  public queryPageUri(name: string) {
    const hash = this._hash[name];
    return !hash ? null : `website/${name}.${hash.latest}.html`;
  }

  public createtask(name: string, configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: createTaskID(),
      name,
      status: CompileTaskStatus.Pending,
      configs,
    };
    this._tasks.push(task);
    return task.id;
  }

  public queryTask(id: string): ICompileTask | null {
    const target = this._tasks.find(i => i.id === id);
    if (!target) {
      return null;
    }
    return cloneDeep(target);
  }

  public async createSourceString(configs: IPageCreateOptions): Promise<string> {
    return new Promise(async (resolve, reject) => {
      this.builder.createSource({ onEmit: resolve, configs }).catch(reject);
    });
  }

  protected async findAndStartTask() {
    if (this.running) {
      return;
    }
    const firstPending = this._tasks.findIndex(i => i.status === CompileTaskStatus.Pending);
    // no work to do
    if (firstPending < 0) {
      return;
    }
    const task = this._tasks[firstPending];
    task.status = CompileTaskStatus.Running;
    const tempSrcDir = getSrcDir(task.id);
    const tempBuildDir = getBuildDir(task.id);
    fs.pathExists(tempSrcDir).then(async exist => {
      if (!exist) {
        fs.mkdirSync(tempSrcDir, { recursive: true });
      }
      await this.startWork(task, tempSrcDir, tempBuildDir);
    });
  }

  protected async startWork(task: ICompileTask, srcDir: string, buildDir: string) {
    const stamp = new Date().getTime();
    const filehash = (this._hash[task.name] = this._hash[task.name] || { latest: "", files: {} });
    try {
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] is now running.`));
      await this.builder.createSource({
        outDir: srcDir,
        fileName: "app-component",
        configs: task.configs,
      });
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] compile successfully.`));
      await this.builder.buildSource({
        template: { title: "测试" },
        entry: { app: path.join(srcDir, "main.tsx") },
        output: { path: buildDir, filename: "[name].[hash].js" },
        plugins: [this.builder.webpackPlugins.createProgressPlugin()],
        typescript: { tsconfig: getTsconfigFile() },
        sandbox: {
          rootPath: getNpmSandbox(),
          dependencies: {
            react: "^16.12.0",
            zent: "^7.1.0",
            "react-dom": "^16.12.0",
          },
        },
      });
      let shouldMoveBundle = true;
      await this.builder.htmlBundle.build({
        path: path.join(buildDir, "index.html"),
        outPath: path.join(buildDir, "index.bundle.html"),
        scripts: [
          { match: /app\.[a-z0-9]+\.js/, path: n => path.join(buildDir, n) },
          { match: /vendor\.[a-z0-9]+\.js/, path: n => path.join(buildDir, n) },
        ],
        checkUnchange: (match, value) => {
          if (filehash.files[match as string] === value) {
            return true;
          }
          filehash.files[match as string] = value;
          console.log(`[COMPILE-TASK] task[${task.id}] find a change changed --> [${value}]`);
          return false;
        },
        shouldBundle: ps => {
          if (ps.length > 0) {
            return true;
          }
          console.log(`[COMPILE-TASK] task[${task.id}] find no file changed.`);
          return (shouldMoveBundle = false);
        },
      });
      filehash.latest = task.id;
      if (shouldMoveBundle) {
        await this.moveHtmlBundle(task.name, task.id, buildDir);
      }
      task.status = CompileTaskStatus.Done;

      console.log(JSON.stringify(filehash, null, "  "));

      const cost = this.getSecondsCost(stamp);
      console.log(chalk.green(`[COMPILE-TASK] task[${task.id}] end with status [${task.status}] in ${cost}s`));
    } catch (error) {
      console.log(error);
      try {
        if (error && error.message) {
          task.errorMsg = String(error.message);
        } else {
          task.errorMsg = JSON.stringify(error);
        }
      } catch (error02) {
        task.errorMsg = String(error02);
      }
      task.status = CompileTaskStatus.Failed;

      const cost = this.getSecondsCost(stamp);
      console.log(chalk.red(`[COMPILE-TASK] task[${task.id}] end with status [${task.status}]  in ${cost}s`));
      console.log(chalk.yellow(`[COMPILE-TASK] task[${task.id}] failed.`));
    }
  }

  protected autoWatch(time: number) {
    setInterval(() => this.findAndStartTask(), time);
  }

  protected getSecondsCost(stamp: number) {
    return (new Date().getTime() - stamp) / 1000;
  }

  protected async moveHtmlBundle(name: string, id: string, buildDir: string) {
    return fs.copy(path.join(buildDir, "index.bundle.html"), path.join(ASSETS_DIR, "website", `${name}.${id}.html`), {
      overwrite: true,
    });
  }
}

function createTaskID(): string {
  return new Date().getTime() + "-" + uuid().slice(0, 6);
}

function getNpmSandbox() {
  return path.resolve(__dirname, "..", "..", "temp");
}

function getTsconfigFile() {
  return path.resolve(__dirname, "..", "..", "tsconfig.jsx.json");
}

function getSrcDir(id: string) {
  return path.resolve(getNpmSandbox(), id, "src");
}

function getBuildDir(id: string) {
  return path.resolve(getNpmSandbox(), id, "build");
}
