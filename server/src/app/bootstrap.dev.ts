import * as chokidar from "chokidar";
import * as path from "path";
import { bootstrap as base } from "./bootstrap.prod";
import { IConfigs } from "../configs/config";

const serverRoot = path.resolve(__dirname, "..", "..", "src");
const assetsRoot = path.resolve(serverRoot, "assets", "**", "*");
const appRoot = path.resolve(serverRoot, "app", "**", "*");
const configsRoot = path.resolve(serverRoot, "configs", "**", "*");

export async function bootstrap(configs: IConfigs) {
  chokidar.watch([assetsRoot, appRoot, configsRoot]).on("change", pathname => {
    console.log("file changed --> " + pathname);
  });
  return base(configs);
}
