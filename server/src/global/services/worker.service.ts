import { Injectable } from "@nestjs/common";
import { Worker } from "../../clusters";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ClusterWorker extends Worker {
  private __init = false;
  public readonly ACTIVE = new BehaviorSubject(false);

  constructor() {
    super();
    this.onActive(() => this.ACTIVE.next(true));
    this.__init = true;
  }

  public onActive(fn: () => void) {
    if (!this.__init) {
      super.onActive(fn);
    }
  }
}
