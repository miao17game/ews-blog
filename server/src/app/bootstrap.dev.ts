// import * as chokidar from "chokidar";
// import * as path from "path";
import { bootstrap as base } from "./bootstrap.prod";
import { IConfigs } from "../configs/config";

// const serverRoot = path.resolve(__dirname, "..", "..", "src");
// const assetsRoot = path.resolve(serverRoot, "assets", "**", "*");
// const appRoot = path.resolve(serverRoot, "app", "**", "*");
// const configsRoot = path.resolve(serverRoot, "configs", "**", "*");
// const controllersRoot = path.resolve(serverRoot, "controllers", "**", "*");
// const servicesRoot = path.resolve(serverRoot, "services", "**", "*");

export async function bootstrap(configs: IConfigs) {
  // chokidar.watch([assetsRoot, appRoot, configsRoot, controllersRoot, servicesRoot]).on("change", pathname => {
  //   console.log("file changed --> " + pathname);
  // });
  return base(configs);
}
