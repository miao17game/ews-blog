import { Injectable } from "@nestjs/common";
import { cloneDeep } from "lodash";
import { IConfigs } from "../../configs/config";

@Injectable()
export class ConfigService {
  private config!: IConfigs;

  setConfig(config: IConfigs) {
    this.config = config;
  }

  getConfig() {
    return cloneDeep(this.config);
  }

  getHello(): string {
    return "Hello World!";
  }
}
