import * as path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import { cloneDeep } from "lodash";
import { Injectable } from "@nestjs/common";
import { buildSource, createSource, IPageCreateOptions } from "@amoebajs/builder";
import uuid from "uuid/v4";

export enum CompileTaskStatus {
  Pending,
  Running,
  Failed,
  Done,
}

export interface ICompileTask {
  id: string;
  status: CompileTaskStatus;
  configs: IPageCreateOptions;
  errorMsg?: string;
}

const tempDir = path.resolve(__dirname, "..", "temp");
const tempDistDir = path.resolve(__dirname, "..", "build");

@Injectable()
export class CompileService {
  private tasks: ICompileTask[] = [];

  private get alldone() {
    return this.tasks.every(i => i.status === CompileTaskStatus.Done);
  }

  public createtask(configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: uuid().slice(0, 8),
      status: CompileTaskStatus.Pending,
      configs,
    };
    this.tasks.push(task);
    this.startTask();
    return task.id;
  }

  public queryTask(id: string): ICompileTask | null {
    const target = this.tasks.find(i => i.id === id);
    if (!target) {
      return null;
    }
    return cloneDeep(target);
  }

  private async sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  private async startTask() {
    const firstRunning = this.tasks.findIndex(i => i.status === CompileTaskStatus.Running);
    if (firstRunning >= 0) {
      await this.sleep(2000);
      this.startTask();
      return;
    }
    const firstPending = this.tasks.findIndex(i => i.status === CompileTaskStatus.Pending);
    if (firstPending < 0) {
      // quit
      return;
    } else {
      const task = this.tasks[firstPending];
      task.status = CompileTaskStatus.Running;
      fs.pathExists(tempDir).then(async exist => {
        if (!exist) {
          fs.mkdirSync(tempDir);
        }
        const stamp = new Date().getTime();
        try {
          console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] is now running.`));
          await createSource(tempDir, "app-component", task.configs);
          console.log(chalk.blue(`[COMPILE-TASK] task[${task.id}] compile successfully.`));
          await buildSource({
            template: { title: "测试" },
            entry: { app: path.join(tempDir, "main.tsx") },
            output: { path: tempDistDir },
            showProgress: true,
            tsconfig: path.resolve(__dirname, "..", "tsconfig.jsx.json"),
          });
          task.status = CompileTaskStatus.Done;
          const cost = (new Date().getTime() - stamp) / 1000;
          console.log(chalk.green(`[COMPILE-TASK] task[${task.id}] end with status [${task.status}] in ${cost}s`));
        } catch (error) {
          console.log(error);
          task.status = CompileTaskStatus.Failed;
          try {
            if (error && error.message) {
              task.errorMsg = String(error.message);
            } else {
              task.errorMsg = JSON.stringify(error);
            }
          } catch (error02) {
            task.errorMsg = String(error02);
          }
          const cost = (new Date().getTime() - stamp) / 1000;
          console.log(chalk.red(`[COMPILE-TASK] task[${task.id}] end with status [${task.status}]  in ${cost}s`));
          console.log(chalk.yellow(`[COMPILE-TASK] task[${task.id}] failed.`));
        } finally {
          this.sleep(2000).then(() => this.startTask());
        }
      });
    }
  }
}
