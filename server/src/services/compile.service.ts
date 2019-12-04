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

const assestDir = path.resolve(__dirname, "..", "assets");
const tempDir = path.resolve(__dirname, "..", "temp");
const tempSrcDir = path.resolve(tempDir, "src");
const tempOutputDir = path.resolve(tempDir, "build");

const INTERVAL = 1000;

@Injectable()
export class CompileService {
  private tasks: ICompileTask[] = [];

  private get running() {
    return this.tasks.findIndex(i => i.status === CompileTaskStatus.Running) >= 0;
  }

  constructor() {
    this.autoWatch(INTERVAL);
  }

  public createtask(name: string, configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: uuid().slice(0, 8),
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
    fs.pathExists(tempSrcDir).then(async exist => {
      if (!exist) {
        fs.mkdirSync(tempSrcDir, { recursive: true });
      }
      await this.startWork(task);
    });
  }

  private async startWork(task: ICompileTask) {
    const stamp = new Date().getTime();
    try {
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] is now running.`));
      await createSource(tempSrcDir, "app-component", task.configs);
      console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] compile successfully.`));
      await buildSource({
        template: { title: "测试" },
        entry: { app: path.join(tempSrcDir, "main.tsx") },
        output: { path: tempOutputDir },
        plugins: [createProgressPlugin()],
        typescript: {
          tsconfig: path.resolve(__dirname, "..", "tsconfig.jsx.json"),
        },
      });
      await buildHtmlBundle(path.join(tempOutputDir, "index.html"), [
        { match: "app.js", path: path.join(tempOutputDir, "app.js") },
        { match: "vendor.js", path: path.join(tempOutputDir, "vendor.js") },
      ]);
      await this.moveHtmlBundle(task.name);
      task.status = CompileTaskStatus.Done;

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

  private async moveHtmlBundle(name: string) {
    return fs.move(path.join(tempOutputDir, "index.html"), path.join(assestDir, "website", `${name}.html`), {
      overwrite: true,
    });
  }
}
