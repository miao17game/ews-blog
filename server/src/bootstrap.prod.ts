import * as path from "path";
import * as nunjucks from "nunjucks";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@global/services/config.service";
import { MainModule } from "./main.module";
import { IConfigs } from "./configs/config";
import { Worker } from "./clusters";

export const BUILD_ROOT = path.join(__dirname, "..", "build");
export const ASSETS_ROOT = path.join(__dirname, "assets");
const noopPromise = (app: any) => Promise.resolve(app);

type OnInitHook<T> = (app: T) => void | Promise<void>;

export interface IBootstrapOptions {
  configs: IConfigs;
  ewsEnvs: { [prop: string]: string };
  staticOptions: import("@nestjs/platform-express/interfaces/serve-static-options.interface").ServeStaticOptions;
  beforeListen: OnInitHook<NestExpressApplication>;
}

export async function bootstrap({
  configs,
  ewsEnvs = {},
  beforeListen: onInit = noopPromise,
  staticOptions = {},
}: Partial<IBootstrapOptions> = {}) {
  const app = await NestFactory.create<NestExpressApplication>(MainModule);
  app
    .get(ConfigService)
    .setConfig(configs)
    .setEnv(ewsEnvs);
  app.useStaticAssets(BUILD_ROOT, { maxAge: 3600000, ...staticOptions });
  app.engine("html", useNunjucks(app, { noCache: true }).render);
  app.setViewEngine("html");
  await onInit(app);
  const worker = Worker.Create();
  // worker
  //   .registerTask("demo-task", {})
  //   .then(() => console.log("success"))
  //   .catch(() => console.log("existed"));
  await app.listen(3000);
}

export function useNunjucks(app: NestExpressApplication, { noCache = false }: { noCache?: boolean } = {}) {
  return nunjucks.configure([BUILD_ROOT, ASSETS_ROOT], {
    autoescape: true,
    express: app,
    noCache,
  });
}
