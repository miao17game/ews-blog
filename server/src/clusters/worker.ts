import { ITaskSnapshot } from "./task";
import {
  IWorkerQueryTaskReceiveMsg,
  IWorkerInitSendMsg,
  IWorkerRegisterTaskSendMsg,
  IWorkerQueryTaskSendMsg,
  IWorkerReceiveMsg,
  IWorkActiveReceiveMsg,
  IWorkRegisterTaskCompletedReceiveMsg,
} from "./message";

/**
 * ## Worker 执行节点
 */
export class Worker<T extends IWorkerReceiveMsg = IWorkerReceiveMsg> {
  public static Create() {
    return new Worker();
  }

  private target = process;
  private parent: number = -1;
  private init: boolean = false;
  private onActiveFn: () => void = () => {};
  private registerList: [string, (exist: boolean) => void][] = [];
  private queryList: [string, (exist: boolean, snapshot: ITaskSnapshot<any>) => void][] = [];

  public get isActive() {
    return this.init;
  }

  constructor() {
    this.initWorker();
  }

  protected initWorker() {
    this.onWorkerMessageReceived();
    this.target.send(<IWorkerInitSendMsg>{ type: "init" });
  }

  protected onWorkerMessageReceived() {
    this.target.on("message", (data: any = {}) => this.onMessageReceived(data));
  }

  public onActive(onActive: () => void) {
    this.onActiveFn = onActive;
  }

  public registerTask(taskid: string, infos: any = {}) {
    this.target.send(<IWorkerRegisterTaskSendMsg>{ type: "register-task", taskid, infos });
    return new Promise<void>((resolve, reject) => {
      this.registerList.push([taskid, exist => (exist ? reject() : resolve())]);
    });
  }

  public queryTaskStatus<T = any>(taskid: string) {
    this.target.send(<IWorkerQueryTaskSendMsg>{ type: "query-task", taskid });
    return new Promise<ITaskSnapshot<T>>((resolve, reject) => {
      this.queryList.push([taskid, (exist, snapshot) => (exist ? resolve(snapshot) : reject())]);
    });
  }

  protected onMessageReceived(data: T) {
    const message: IWorkerReceiveMsg = data;
    switch (message.type) {
      case "active":
        this.resolveOnActive(message);
        break;
      case "register-completed":
        this.resolveTaskRegister(message);
        break;
      case "query-task-result":
        this.resolveQueryTask(message);
        break;
      default:
        break;
    }
  }

  private resolveOnActive(data: IWorkActiveReceiveMsg) {
    this.parent = data.master;
    this.onActiveFn();
  }

  private resolveQueryTask(data: IWorkerQueryTaskReceiveMsg) {
    this.queryList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist, data.snapshot));
  }

  private resolveTaskRegister(data: IWorkRegisterTaskCompletedReceiveMsg) {
    this.registerList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist));
  }
}
