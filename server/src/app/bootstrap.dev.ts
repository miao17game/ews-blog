import * as chokidar from "chokidar";
import { bootstrap as base } from "./bootstrap.prod";
import { IConfigs } from "../configs/config";

export async function bootstrap(configs: IConfigs) {
  console.log(chokidar);
  return base(configs);
}
