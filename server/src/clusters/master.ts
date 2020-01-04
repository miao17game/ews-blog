import cluster from "cluster";
import os from "os";
import { IWorkerSendMsg, IWorkRegisterTaskCompletedReceiveMsg, IWorkQueryTaskReceiveMsg } from "./worker";
import { Task } from "./task";

export * from "./task";

export interface IMasterOptions {
  maxWorker?: number;
}

/**
 * ## Master 执行机
 */
export class Master {
  public static Create(god: typeof cluster, options: IMasterOptions = {}) {
    return new Master(god, options);
  }

  private target = process;
  private maxNum = os.cpus().length;
  private workers: number[] = [];
  private tasks: Task[] = [];

  constructor(private god: typeof cluster, options: IMasterOptions = {}) {
    this.init(options);
  }

  protected init(options: IMasterOptions) {
    this.initOptions(options);
    this.initWorkers();
    this.onWorkerListening();
    this.onWorkerExit();
    this.onWorkerMessagereceived();
  }

  protected initWorkers() {
    for (var i = 0; i < this.maxNum; i++) {
      this.god.fork();
    }
  }

  protected initOptions(options: IMasterOptions) {
    if (options.maxWorker !== void 0) {
      this.maxNum = options.maxWorker;
    }
  }

  protected onWorkerMessagereceived() {
    this.god.on("message", (worker, message: any = {}) => {
      this.receiveMessage(message, worker);
    });
  }

  protected onWorkerExit() {
    this.god.on("exit", (worker, code, signal) => {
      console.log("exit worker " + worker.process.pid + " died");
      this.removeWorker(worker);
      this.god.fork();
    });
  }

  protected onWorkerListening() {
    this.god.on("listening", (worker, address) => {
      console.log("listening: worker " + worker.process.pid);
    });
  }

  private receiveMessage(message: IWorkerSendMsg, worker: cluster.Worker) {
    switch (message.type) {
      case "init":
        this.addWorker(worker);
        break;
      case "register-task":
        this.createTask(message.taskid, message.infos, worker);
        break;
      case "query-task":
        this.queryTask(message.taskid, worker);
        break;
      default:
        break;
    }
  }

  private createTask(id: string, infos: string, worker: cluster.Worker) {
    let exist = this.tasks.find(i => i.taskId === id);
    let existed = true;
    if (!exist) {
      existed = false;
      exist = new Task(id, worker.process.pid).setTaskInfos(infos);
      this.tasks.push(exist);
    }
    worker.send(<IWorkRegisterTaskCompletedReceiveMsg>{ type: "register-completed", exist: existed, taskid: id });
  }

  private queryTask(id: string, worker: cluster.Worker) {
    const exist = this.tasks.find(i => i.taskId === id);
    worker.send(<IWorkQueryTaskReceiveMsg>{
      type: "query-task-result",
      exist: !!exist,
      snapshot: exist?.getTaskSnapshot(),
      taskid: id,
    });
  }

  private addWorker(worker: cluster.Worker) {
    this.workers.push(worker.process.pid);
    worker.send({ type: "active", master: this.target.pid });
  }

  private removeWorker(worker: cluster.Worker) {
    this.workers = this.workers.filter(i => i !== worker.process.pid);
  }
}
