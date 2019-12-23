import { Injectable } from "@nestjs/common";
import { cloneDeep } from "lodash";
import { IConfigs } from "../../configs/config";

// tslint:disable: variable-name

@Injectable()
export class ConfigService {
  private _config!: IConfigs;
  private _env: { [prop: string]: string } = {};

  public setConfig(config: IConfigs) {
    this._config = config;
    return this;
  }

  public setEnv(env: { [prop: string]: string }) {
    this._env = env;
    return this;
  }

  public getConfig() {
    return cloneDeep(this._config);
  }

  public getEnv() {
    return cloneDeep(this._env);
  }
}
