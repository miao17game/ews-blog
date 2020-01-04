export interface ITaskSnapshot<T extends { [prop: string]: any } = {}> {
  taskId: string;
  locked: boolean;
  creator: number;
  operator: number;
  infos: T;
}

export class Task<T extends { [prop: string]: any } = {}> {
  static Create(id: string, creator?: number) {
    return new Task(id, creator);
  }

  private locked: boolean = false;
  private operator: number = -1;
  private creator: number = -1;
  private infos: T = <T>{};

  public get isLocked() {
    return this.locked;
  }

  public get taskId() {
    return this.taskid;
  }

  constructor(private taskid: string, creator?: number) {
    if (creator !== void 0) {
      this.creator = creator;
    }
  }

  public getTaskSnapshot(): ITaskSnapshot<T> {
    return {
      taskId: this.taskid,
      locked: this.locked,
      creator: this.creator,
      operator: this.operator,
      infos: { ...this.infos },
    };
  }

  public setTaskInfos(infos: Partial<T>) {
    this.infos = {
      ...this.infos,
      ...infos,
    };
    return this;
  }

  public lockTask(operator: number) {
    if (!this.locked) {
      this.locked = true;
      this.operator = operator;
    }
  }
}
