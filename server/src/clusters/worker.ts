import { ITaskSnapshot } from "./task";

/**
 * ## Worker 执行节点
 */
export class Worker {
  public static Create() {
    return new Worker();
  }

  private target = process;
  private parent: number = -1;
  private init: boolean = false;
  private onActiveEn: () => void = () => {};
  private registerList: [string, (exist: boolean) => void][] = [];
  private queryList: [string, (exist: boolean, snapshot: ITaskSnapshot<any>) => void][] = [];

  public get isActive() {
    return this.init;
  }

  constructor() {
    this.initWorker();
  }

  protected initWorker() {
    this.onMessageReceived();
    this.target.send(<IWorkerInitSendMsg>{ type: "init" });
  }

  protected onMessageReceived() {
    this.target.on("message", (data: any = {}) => this.listenMessage(data));
  }

  public onActive(onActive: () => void) {
    this.onActiveEn = onActive;
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

  private listenMessage(data: IWorkerReceiveMsg) {
    switch (data.type) {
      case "active":
        this.resolveOnActive(data);
        break;
      case "register-completed":
        this.resolveTaskRegister(data);
        break;
      case "query-task-result":
        this.resolveQueryTask(data);
        break;
      default:
        break;
    }
  }

  private resolveOnActive(data: IWorkActiveReceiveMsg) {
    this.parent = data.master;
    this.onActiveEn();
  }

  private resolveQueryTask(data: IWorkQueryTaskReceiveMsg) {
    this.queryList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist, data.snapshot));
  }

  private resolveTaskRegister(data: IWorkRegisterTaskCompletedReceiveMsg) {
    this.registerList.filter(i => i[0] === data.taskid).forEach(task => task[1](data.exist));
  }
}

//#region receive msgs
export interface IWorkActiveReceiveMsg {
  type: "active";
  master: number;
}

export interface IWorkRegisterTaskCompletedReceiveMsg {
  type: "register-completed";
  exist: boolean;
  taskid: string;
}

export interface IWorkQueryTaskReceiveMsg {
  type: "query-task-result";
  exist: boolean;
  snapshot: any;
  taskid: string;
}

export type IWorkerReceiveMsg = IWorkActiveReceiveMsg | IWorkRegisterTaskCompletedReceiveMsg | IWorkQueryTaskReceiveMsg;
//#endregion

//#region send msgs
export interface IWorkerInitSendMsg {
  type: "init";
}

export interface IWorkerRegisterTaskSendMsg {
  type: "register-task";
  taskid: string;
  infos: any;
}

export interface IWorkerQueryTaskSendMsg {
  type: "query-task";
  taskid: string;
}

export type IWorkerSendMsg = IWorkerInitSendMsg | IWorkerRegisterTaskSendMsg | IWorkerQueryTaskSendMsg;
//#endregion
