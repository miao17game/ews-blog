// import * as chokidar from "chokidar";
// import * as path from "path";
import * as nunjucks from "nunjucks";
import { bootstrap as base, BUILD_ROOT, ASSETS_ROOT } from "./bootstrap.prod";
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
  return base(configs, app => {
    const environment = nunjucks.configure([BUILD_ROOT, ASSETS_ROOT], {
      autoescape: true,
      // use cache
      noCache: false,
      express: app,
    });
    app.engine("html", environment.render);
  });
}
