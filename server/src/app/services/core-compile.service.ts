import * as path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import uuid from "uuid/v4";
import { cloneDeep } from "lodash";
import { Injectable } from "@nestjs/common";
import { Factory, IPageCreateOptions } from "@amoebajs/builder";
import { CompileService } from "@global/services/compile.service";

// tslint:disable: object-literal-key-quotes

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

@Injectable()
export class CoreCompiler implements CompileService<ICompileTask> {
  private factory = new Factory();
  private tasks: ICompileTask[] = [];
  private hash: IWebsitePageHash = {};

  private get builder() {
    return this.factory.builder;
  }

  private get running() {
    return this.tasks.findIndex(i => i.status === CompileTaskStatus.Running) >= 0;
  }

  constructor() {
    this.autoWatch(INTERVAL);
  }

  public getPageTemplate(name: string) {
    const hash = this.hash[name];
    return !hash ? null : `website/${name}.${hash.latest}.html`;
  }

  public createtask(name: string, configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: new Date().getTime() + "-" + uuid().slice(0, 6),
      name,
      status: CompileTaskStatus.Pending,
      configs,
    };
    this.tasks.push(task);
    return task.id;
  }

  public queryTask(id: string): ICompileTask | null {
    const target = this.tasks.find(i => i.id === id);
    if (!target) {
      return null;
    }
    return cloneDeep(target);
  }

  protected async findAndStartTask() {
    if (this.running) {
      return;
    }
    const firstPending = this.tasks.findIndex(i => i.status === CompileTaskStatus.Pending);
    // no work to do
    if (firstPending < 0) {
      return;
    }
    const task = this.tasks[firstPending];
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
    const filehash = (this.hash[task.name] = this.hash[task.name] || { latest: "", files: {} });
    try {
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] is now running.`));
      await this.builder.createSource(srcDir, "app-component", task.configs);
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
