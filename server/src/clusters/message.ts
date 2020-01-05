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

export interface IWorkerRunTaskReceiveMsg {
  type: "run-task-result";
  success: boolean;
  control: boolean;
  taskid: string;
}

export interface IWorkerFinishTaskReceiveMsg {
  type: "finish-task-result";
  success: boolean;
  taskid: string;
}

export type IWorkerReceiveMsg =
  | IWorkActiveReceiveMsg
  | IWorkRegisterTaskCompletedReceiveMsg
  | IWorkerQueryTaskReceiveMsg
  | IWorkerRunTaskReceiveMsg
  | IWorkerFinishTaskReceiveMsg;

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

export interface IWorkerRunTaskSendMsg {
  type: "run-task";
  taskid: string;
}

export interface IWorkerFinishTaskSendMsg {
  type: "finish-task";
  taskid: string;
}

export type IWorkerSendMsg =
  | IWorkerInitSendMsg
  | IWorkerRegisterTaskSendMsg
  | IWorkerQueryTaskSendMsg
  | IWorkerRunTaskSendMsg
  | IWorkerFinishTaskSendMsg;

//#endregion
