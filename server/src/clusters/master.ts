import cluster from "cluster";
import os from "os";
import {
  IWorkerSendMsg,
  IWorkRegisterTaskCompletedReceiveMsg,
  IWorkerQueryTaskReceiveMsg,
  IWorkActiveReceiveMsg,
  IWorkerRunTaskReceiveMsg,
  IWorkerFinishTaskReceiveMsg,
  IWorkerUpdateTaskReceiveMsg,
  IWorkerUpdateTaskSendMsg,
} from "./message";
import { Task } from "./task";
import { ClusterStorage } from "./storage";

export interface IMasterOptions {
  maxWorker?: number;
}

/**
 * ## Master 主机
 */
export class Master<T extends IWorkerSendMsg = IWorkerSendMsg> {
  public static Create(god: typeof cluster, options: IMasterOptions = {}) {
    return new Master(god, options);
  }

  private _target = process;
  private _maxNum = os.cpus().length;
  private _workers: number[] = [];
  private _storages: Map<string, ClusterStorage<any>> = new Map();
  private _tasks: Map<string, Task> = new Map();
  private _finished_tasks: Task[] = [];

  constructor(private _god: typeof cluster, options: IMasterOptions = {}) {
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
    for (var i = 0; i < this._maxNum; i++) {
      this._god.fork();
    }
  }

  protected initOptions(options: IMasterOptions) {
    if (options.maxWorker !== void 0) {
      this._maxNum = options.maxWorker;
    }
  }

  protected onWorkerMessagereceived() {
    this._god.on("message", (worker, message: any = {}) => {
      this.onMessageReceived(message, worker);
    });
  }

  protected onWorkerExit() {
    this._god.on("exit", (worker, code, signal) => {
      const workerId = worker.process.pid;
      console.log("exit worker " + workerId + " died");
      this._removeWorker(worker);
      this._clearTasksForCurrentWorker(workerId);
      this._god.fork();
    });
  }

  protected onWorkerListening() {
    this._god.on("listening", (worker, address) => {
      console.log("listening: worker " + worker.process.pid);
    });
  }

  protected onMessageReceived(data: T, worker: cluster.Worker) {
    const message: IWorkerSendMsg = data;
    switch (message.type) {
      case "init":
        this._addWorker(worker);
        break;
      case "register-task":
        this._createTask(message.taskid, message.infos, message.autoreset, message.storage, worker);
        break;
      case "query-task":
        this._queryTask(message.taskid, worker);
        break;
      case "run-task":
        this._runTask(message.taskid, worker);
        break;
      case "finish-task":
        this._finishTask(message.taskid, worker);
        break;
      case "update-task":
        this._updateTask(message.taskid, message.changes, worker);
        break;
      default:
        break;
    }
  }

  protected send<D>(worker: cluster.Worker, data: D) {
    return worker.send(data);
  }

  private _addWorker(worker: cluster.Worker) {
    this._workers.push(worker.process.pid);
    this.send<IWorkActiveReceiveMsg>(worker, {
      type: "active",
      master: this._target.pid,
    });
  }

  private _removeWorker(worker: cluster.Worker) {
    this._workers = this._workers.filter(i => i !== worker.process.pid);
  }

  private _createTask(id: string, infos: any, autorestart: boolean, storage: string | false, worker: cluster.Worker) {
    let exist = this._tasks.get(id);
    let existed = true;
    if (!exist) {
      existed = false;
      exist = new Task(id, worker.process.pid, autorestart);
      if (storage !== false) {
        exist.setStorage(storage);
        const existSto = this._storages.get(storage);
        if (existSto) {
          existSto.updateStorage(infos);
        } else {
          this._storages.set(storage, new ClusterStorage(storage).updateStorage(infos));
        }
      }
      this._tasks.set(id, exist);
    }
    this.send<IWorkRegisterTaskCompletedReceiveMsg>(worker, {
      type: "register-completed",
      exist: existed,
      taskid: id,
    });
  }

  private _queryTask(id: string, worker: cluster.Worker) {
    const exist = this._tasks.get(id);
    let storage: any = {};
    if (exist) {
      const sto = this._storages.get(exist.storageName);
      storage = sto?.data || {};
    }
    this.send<IWorkerQueryTaskReceiveMsg>(worker, {
      type: "query-task-result",
      exist: !!exist,
      snapshot: { ...(exist?.getTaskSnapshot() || {}), storage },
      taskid: id,
    });
  }

  private _runTask(taskid: string, worker: cluster.Worker) {
    const task = this._tasks.get(taskid);
    let hasControl = false;
    let success = false;
    if (task) {
      success = true;
      if (!task.locked) {
        task.lockTask(worker.process.pid);
        hasControl = true;
      }
    }
    this.send<IWorkerRunTaskReceiveMsg>(worker, {
      type: "run-task-result",
      control: hasControl,
      success,
      taskid,
    });
  }

  private _updateTask(taskid: string, changes: IWorkerUpdateTaskSendMsg["changes"], worker: cluster.Worker) {
    const task = this._tasks.get(taskid);
    let success = false;
    if (task) {
      const existSto = this._storages.get(task.storageName);
      if (existSto) {
        const newData = existSto.data;
        for (const iterator of changes.insert) {
          newData[iterator[0]] = iterator[1];
        }
        for (const iterator of changes.update) {
          newData[iterator[0]] = iterator[1];
        }
        for (const iterator of changes.delete) {
          delete newData[iterator];
        }
        existSto.updateStorage(newData, true);
        success = true;
      }
    }
    this.send<IWorkerUpdateTaskReceiveMsg>(worker, {
      type: "update-task-result",
      success,
      taskid,
    });
  }

  private _finishTask(taskid: string, worker: cluster.Worker) {
    const task = this._tasks.get(taskid);
    let success = false;
    if (task) {
      success = task.finishTask(worker.process.pid);
      this._clearFinishedTask(task);
    }
    this.send<IWorkerFinishTaskReceiveMsg>(worker, {
      type: "finish-task-result",
      success,
      taskid,
    });
  }

  private _clearTasksForCurrentWorker(workerId: number) {
    Array.from(this._tasks.values())
      .filter(i => i.operator === workerId)
      .forEach(task => {
        task.finishTask(task.operator);
        this._clearFinishedTask(task);
      });
  }

  private _clearFinishedTask(task: Task) {
    if (!task.autoReset) {
      this._finished_tasks.push(task);
      this._tasks.delete(task.id);
    } else {
      // 随机重新分配执行节点
      const random = Math.floor(Math.random() * 1000);
      const index = random % this._maxNum;
      task.reset(this._workers[index]);
    }
  }
}
