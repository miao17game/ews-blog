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

export interface IWorkerQueryTaskReceiveMsg {
  type: "query-task-result";
  exist: boolean;
  snapshot: any;
  taskid: string;
}

export type IWorkerReceiveMsg =
  | IWorkActiveReceiveMsg
  | IWorkRegisterTaskCompletedReceiveMsg
  | IWorkerQueryTaskReceiveMsg;

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
