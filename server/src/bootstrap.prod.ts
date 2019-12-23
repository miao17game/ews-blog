import * as path from "path";
import * as nunjucks from "nunjucks";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@global/services/config.service";
import { MainModule } from "./main.module";
import { IConfigs } from "./configs/config";

// tslint:disable: no-unused-expression

export const BUILD_ROOT = path.join(__dirname, "..", "build");
export const ASSETS_ROOT = path.join(__dirname, "assets");
const noopPromise = (app: any) => Promise.resolve(app);

type OnInitHook<T> = (app: T) => void | Promise<void>;

export interface IBootstrapOptions {
  env: { [prop: string]: string };
  onInit: OnInitHook<NestExpressApplication>;
}

export async function bootstrap(
  configs: IConfigs,
  { env = {}, onInit = noopPromise }: Partial<IBootstrapOptions> = {},
) {
  const app = await NestFactory.create<NestExpressApplication>(MainModule);
  app
    .get(ConfigService)
    .setConfig(configs)
    .setEnv(env);
  app.enableCors({ origin: "*" });
  app.useStaticAssets(BUILD_ROOT);
  app.engine("html", useNunjucks(app, { noCache: true }).render);
  app.setViewEngine("html");
  await onInit(app);
  await app.listen(3000);
}

export function useNunjucks(app: NestExpressApplication, { noCache = false }: { noCache?: boolean } = {}) {
  return nunjucks.configure([BUILD_ROOT, ASSETS_ROOT], {
    autoescape: true,
    express: app,
    noCache,
  });
}
