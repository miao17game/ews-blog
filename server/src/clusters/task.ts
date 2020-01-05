export interface ITaskSnapshot<T extends { [prop: string]: any } = {}> {
  id: string;
  locked: boolean;
  creator: number;
  operator: number;
  infos: T;
}

export class Task<T extends { [prop: string]: any } = {}> {
  static Create(id: string, creator?: number) {
    return new Task(id, creator);
  }

  private _locked: boolean = false;
  private _operator: number = -1;
  private _creator: number = -1;
  private _finished: boolean = false;
  private _infos: T = <T>{};

  public get locked() {
    return this._locked;
  }

  public get finished() {
    return this._finished;
  }

  public get id() {
    return this.taskid;
  }

  public get creator() {
    return this._creator;
  }

  public get operator() {
    return this._operator;
  }

  constructor(private taskid: string, creator?: number) {
    if (creator !== void 0) {
      this._creator = creator;
    }
  }

  public getTaskSnapshot(): ITaskSnapshot<T> {
    return {
      id: this.taskid,
      locked: this._locked,
      creator: this._creator,
      operator: this._operator,
      infos: { ...this._infos },
    };
  }

  public setTaskInfos(infos: Partial<T>) {
    this._infos = {
      ...this._infos,
      ...infos,
    };
    return this;
  }

  public lockTask(operator: number) {
    if (!this._locked) {
      this._locked = true;
      this._operator = operator;
    }
  }

  public finishTask(operator: number) {
    if (this._locked) {
      if (this._operator === operator) {
        this._finished = true;
        return true;
      }
      return false;
    } else {
      this._finished = true;
      return true;
    }
  }
}
