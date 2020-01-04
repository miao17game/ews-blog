import cluster from "cluster";
import { IWorkerSendMsg, IWorkRegisterTaskCompletedReceiveMsg, IWorkQueryTaskReceiveMsg } from "./worker";
import { Task } from "./task";

export * from "./task";

export class Cluster {
  static Create() {
    return new Cluster();
  }

  private target = process;
  private workers: number[] = [];
  private tasks: Task[] = [];

  public addWorker(worker: cluster.Worker) {
    this.workers.push(worker.process.pid);
    worker.send({ type: "active", master: this.target.pid });
  }

  public removeWorker(worker: cluster.Worker) {
    this.workers = this.workers.filter(i => i !== worker.process.pid);
  }

  public receiveMessage(message: IWorkerSendMsg, worker: cluster.Worker) {
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
}
