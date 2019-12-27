// import * as chokidar from "chokidar";
// import * as path from "path";
import { bootstrap as base, useNunjucks, IBootstrapOptions } from "./bootstrap.prod";

// const serverRoot = path.resolve(__dirname, "..", "..", "src");
// const assetsRoot = path.resolve(serverRoot, "assets", "**", "*");
// const appRoot = path.resolve(serverRoot, "app", "**", "*");
// const configsRoot = path.resolve(serverRoot, "configs", "**", "*");
// const controllersRoot = path.resolve(serverRoot, "controllers", "**", "*");
// const servicesRoot = path.resolve(serverRoot, "services", "**", "*");

export async function bootstrap(options: Partial<IBootstrapOptions> = {}) {
  // chokidar.watch([assetsRoot, appRoot, configsRoot, controllersRoot, servicesRoot]).on("change", pathname => {
  //   console.log("file changed --> " + pathname);
  // });
  return base({
    ...options,
    staticOptions: { maxAge: 0 },
    beforeListen: app => {
      app.engine("html", useNunjucks(app, { noCache: false }).render);
      app.enableCors({ origin: "*" });
    },
  });
}
