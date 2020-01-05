export interface ITaskSnapshot<T extends { [prop: string]: any } = {}> {
  id: string;
  locked: boolean;
  creator: number;
  operator: number;
  storage: T;
}

export class Task {
  static Create(id: string, creator: number) {
    return new Task(id, creator);
  }

  private _locked: boolean = false;
  private _operator: number = -1;
  private _finished: boolean = false;
  private _storage!: string | undefined;

  public get locked() {
    return this._locked;
  }

  public get finished() {
    return this._finished;
  }

  public get hasStorage() {
    return this._storage !== void 0;
  }

  public get autoReset() {
    return this._autoReset;
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

  public get storageName() {
    return this._storage;
  }

  constructor(private taskid: string, private _creator: number, private _autoReset = false) {}

  public reset(operator?: number) {
    this._operator = operator === void 0 ? -1 : operator;
    this._finished = false;
    this._locked = false;
  }

  public setStorage(name: string) {
    this._storage = name;
  }

  public getTaskSnapshot(): ITaskSnapshot<{}> {
    return {
      id: this.taskid,
      locked: this._locked,
      creator: this._creator,
      operator: this._operator,
      storage: {},
    };
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
        this._finished = !this._autoReset;
        return true;
      }
      return false;
    } else {
      this._finished = !this._autoReset;
      return true;
    }
  }
}
