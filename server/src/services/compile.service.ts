import * as path from "path";
import * as fs from "fs-extra";
import { cloneDeep } from "lodash";
import { Injectable } from "@nestjs/common";
import { buildSource, createSource, IPageCreateOptions } from "@amoebajs/builder";
import uuid from "uuid/v4";

export interface ICompileTask {
  id: string;
  status: "running" | "done" | "pending" | "fail";
  configs: IPageCreateOptions;
  errorMsg?: string;
}

const tempDir = path.resolve(__dirname, "..", "temp");
const tempDistDir = path.resolve(__dirname, "..", "build");

@Injectable()
export class CompileService {
  private tasks: ICompileTask[] = [];

  private get alldone() {
    return this.tasks.every(i => i.status === "done");
  }

  public createtask(configs: IPageCreateOptions): string {
    const task: ICompileTask = {
      id: uuid().slice(0, 8),
      status: "pending",
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
    const firstRunning = this.tasks.findIndex(i => i.status === "running");
    if (firstRunning >= 0) {
      await this.sleep(2000);
      this.startTask();
      return;
    }
    const firstPending = this.tasks.findIndex(i => i.status === "pending");
    if (firstPending < 0) {
      // quit
      return;
    } else {
      const task = this.tasks[firstPending];
      task.status = "running";
      fs.pathExists(tempDir).then(async exist => {
        if (!exist) {
          fs.mkdirSync(tempDir);
        }
        try {
          await createSource(tempDir, "app-component", task.configs);
          await buildSource({
            template: { title: "测试" },
            entry: { app: path.join(tempDir, "main.tsx") },
            output: { path: tempDistDir },
            tsconfig: path.resolve(__dirname, "..", "tsconfig.jsx.json"),
          });
          task.status = "done";
        } catch (error) {
          task.status = "fail";
          try {
            task.errorMsg = JSON.stringify(error);
          } catch (error02) {
            task.errorMsg = String(error02);
          }
        } finally {
          this.sleep(2000).then(() => this.startTask());
        }
      });
    }
  }
}
