import * as path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import uuid from "uuid/v4";
import { cloneDeep } from "lodash";
import { Injectable } from "@nestjs/common";
import {
  buildSource,
  createSource,
  IPageCreateOptions,
  createProgressPlugin,
  buildHtmlBundle,
} from "@amoebajs/builder";

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

const ASSETS_DIR = path.resolve(__dirname, "..", "assets");
const INTERVAL = 1000;

function getSrcDir(id: string) {
  return path.resolve(__dirname, "..", "temp", id, "src");
}

function getBuildDir(id: string) {
  return path.resolve(__dirname, "..", "temp", id, "build");
}

@Injectable()
export class CompileService {
  private tasks: ICompileTask[] = [];
  private hash: IWebsitePageHash = {};

  private get running() {
    return this.tasks.findIndex(i => i.status === CompileTaskStatus.Running) >= 0;
  }

  constructor() {
    this.autoWatch(INTERVAL);
  }

  public getPageTemplate(name: string) {
    const hash = this.hash[name];
    return !hash ? null : `website/${name}.${hash}.html`;
  }

  public createtask(name: string, configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: uuid()
        .split("-")
        .join(""),
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

  private async findAndStartTask() {
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

  private async startWork(task: ICompileTask, srcDir: string, buildDir: string) {
    const stamp = new Date().getTime();
    const filehash = (this.hash[task.name] = this.hash[task.name] || { latest: "", files: {} });
    try {
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] is now running.`));
      await createSource(srcDir, "app-component", task.configs);
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] compile successfully.`));
      await buildSource({
        template: { title: "测试" },
        entry: { app: path.join(srcDir, "main.tsx") },
        output: { path: buildDir, filename: "[name].[hash].js" },
        plugins: [createProgressPlugin()],
        typescript: {
          tsconfig: path.resolve(__dirname, "..", "tsconfig.jsx.json"),
        },
      });
      await buildHtmlBundle({
        path: path.join(buildDir, "index.html"),
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
          return false;
        },
      });
      filehash.latest = task.id;
      await this.moveHtmlBundle(task.name, task.id, buildDir);
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

  private autoWatch(time: number) {
    setInterval(() => this.findAndStartTask(), time);
  }

  private getSecondsCost(stamp: number) {
    return (new Date().getTime() - stamp) / 1000;
  }

  private async moveHtmlBundle(name: string, id: string, buildDir: string) {
    return fs.copy(path.join(buildDir, "index.html"), path.join(ASSETS_DIR, "website", `${name}.${id}.html`), {
      overwrite: true,
    });
  }
}
