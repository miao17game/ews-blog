import { ITaskSnapshot } from "./task";
import {
  IWorkerQueryTaskReceiveMsg,
  IWorkerInitSendMsg,
  IWorkerRegisterTaskSendMsg,
  IWorkerQueryTaskSendMsg,
  IWorkerReceiveMsg,
  IWorkActiveReceiveMsg,
  IWorkRegisterTaskCompletedReceiveMsg,
  IWorkerRunTaskSendMsg,
  IWorkerFinishTaskSendMsg,
  IWorkerRunTaskReceiveMsg,
  IWorkerFinishTaskReceiveMsg,
} from "./message";

/**
 * ## Worker 执行节点
 */
export class Worker<T extends IWorkerReceiveMsg = IWorkerReceiveMsg> {
  public static Create() {
    return new Worker();
  }

  private _target = process;
  private _parent: number = -1;
  private _init: boolean = false;
  private _onActiveFn: () => void = () => {};
  private _registerList: [string, (exist: boolean) => void][] = [];
  private _queryList: [string, (exist: boolean, snapshot: ITaskSnapshot<any>) => void][] = [];
  private _runList: [string, (sucess: boolean, control: boolean) => void][] = [];
  private _finishList: [string, (sucess: boolean) => void][] = [];

  public get isActive() {
    return this._init;
  }

  constructor() {
    this.initWorker();
  }

  protected initWorker() {
    this.onWorkerMessageReceived();
    this.send<IWorkerInitSendMsg>({ type: "init" });
  }

  protected onWorkerMessageReceived() {
    this._target.on("message", (data: any = {}) => this.onMessageReceived(data));
  }

  public onActive(onActive: () => void) {
    this._onActiveFn = onActive;
  }

  public registerTask(taskid: string, infos: any = {}) {
    this.send<IWorkerRegisterTaskSendMsg>({ type: "register-task", taskid, infos });
    return new Promise<void>((resolve, reject) => {
      this._registerList.push([taskid, exist => (exist ? reject() : resolve())]);
    });
  }

  public queryTaskStatus<T = any>(taskid: string) {
    this.send<IWorkerQueryTaskSendMsg>({ type: "query-task", taskid });
    return new Promise<ITaskSnapshot<T>>((resolve, reject) => {
      this._queryList.push([taskid, (exist, snapshot) => (exist ? resolve(snapshot) : reject())]);
    });
  }

  public runTask(taskid: string) {
    this._target.send(<IWorkerRunTaskSendMsg>{ type: "run-task", taskid });
    return new Promise<boolean>((resolve, reject) => {
      this._runList.push([taskid, (success, control) => (success ? resolve(control) : reject())]);
    });
  }

  public finishTask(taskid: string) {
    this.send<IWorkerFinishTaskSendMsg>({ type: "finish-task", taskid });
    return new Promise<void>((resolve, reject) => {
      this._finishList.push([taskid, success => (success ? resolve() : reject())]);
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
      case "run-task-result":
        this.resolveRunTask(message);
        break;
      case "finish-task-result":
        this.resolveFinishTask(message);
        break;
      default:
        break;
    }
  }

  protected send<D>(data: D) {
    return this._target.send(data);
  }

  private resolveOnActive(data: IWorkActiveReceiveMsg) {
    this._parent = data.master;
    this._onActiveFn();
  }

  private resolveQueryTask(data: IWorkerQueryTaskReceiveMsg) {
    this._queryList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist, data.snapshot));
  }

  private resolveTaskRegister(data: IWorkRegisterTaskCompletedReceiveMsg) {
    this._registerList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist));
  }

  private resolveRunTask(data: IWorkerRunTaskReceiveMsg) {
    this._runList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.success, data.control));
  }

  private resolveFinishTask(data: IWorkerFinishTaskReceiveMsg) {
    this._finishList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.success));
  }
}
