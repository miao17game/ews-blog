import { Injectable } from "@nestjs/common";
import { cloneDeep } from "lodash";
import { CompressionOptions } from "compression";

export interface IServerConfigs {
  name: string;
  uriGroup: {
    portal: { uri: string; token: string; type: string };
    site: { uri: string; token: string; type: string };
    api: { uri: string; token: string; type: string };
  };
  redis: { enabled: boolean; host: string; port: number };
  cluster: { enabled: boolean; maxCpuNum: number | null };
  gzip: { enabled: boolean; options?: Partial<CompressionOptions> };
}

@Injectable()
export class ConfigService {
  private _config!: IServerConfigs;
  private _env: { [prop: string]: string } = {};

  public setConfig(config: IServerConfigs) {
    this._config = cloneDeep(config);
    return this;
  }

  public setEnv(env: { [prop: string]: string }) {
    this._env = env;
    return this;
  }

  public getConfig() {
    return this._config;
  }

  public getEnv() {
    return this._env;
  }
}
