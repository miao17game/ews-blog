import * as path from "path";
import * as nunjucks from "nunjucks";
import compression from "compression";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ServeStaticOptions } from "@nestjs/platform-express/interfaces/serve-static-options.interface";
import { ConfigService, IServerConfigs } from "#global/services/config.service";
import { ClusterWorker } from "#global/services/worker.service";
import { MainModule } from "./main.module";

export const BUILD_ROOT = path.join(__dirname, "..", "build");
export const ASSETS_ROOT = path.join(__dirname, "assets");
const noopPromise = (app: any) => Promise.resolve(app);

type OnInitHook<T> = (app: T) => void | Promise<void>;

export interface IBootstrapOptions {
  configs: IServerConfigs;
  ewsEnvs: { [prop: string]: string };
  staticOptions: ServeStaticOptions;
  beforeListen: OnInitHook<NestExpressApplication>;
}

export async function bootstrap({
  configs,
  ewsEnvs = {},
  beforeListen: onInit = noopPromise,
  staticOptions = {},
}: Partial<IBootstrapOptions> = {}) {
  const app = await NestFactory.create<NestExpressApplication>(MainModule);
  app.get(ClusterWorker);
  app
    .get(ConfigService)
    .setConfig(configs)
    .setEnv(ewsEnvs);
  useStaticAssets(app, staticOptions);
  useGzip(app, configs);
  useTemplateEngine(app);
  await onInit(app);
  await app.listen(3000);
}

export function useTemplateEngine(app: NestExpressApplication) {
  app.engine("html", useNunjucks(app, { noCache: false }).render);
  app.setViewEngine("html");
}

export function useStaticAssets(app: NestExpressApplication, options: ServeStaticOptions) {
  app.useStaticAssets(BUILD_ROOT, { maxAge: 3600000, ...options });
}

export function useGzip(app: NestExpressApplication, configs: IServerConfigs) {
  const { enabled: useGizp, options: gzipOptions } = configs.gzip;
  if (useGizp) {
    app.use(compression(gzipOptions));
  }
}

export function useNunjucks(app: NestExpressApplication, { noCache = false }: { noCache?: boolean } = {}) {
  return nunjucks.configure([BUILD_ROOT, ASSETS_ROOT], {
    autoescape: true,
    express: app,
    noCache,
  });
}
