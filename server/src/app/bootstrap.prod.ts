import * as path from "path";
import * as nunjucks from "nunjucks";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { IConfigs } from "../configs/config";
import { ConfigService } from "../services/config.service";

// tslint:disable: no-unused-expression

export const BUILD_ROOT = path.join(__dirname, "..", "..", "build");
export const ASSETS_ROOT = path.join(__dirname, "..", "assets");
const noopPromise = (app: any) => Promise.resolve(app);

type OnInitHook<T> = (app: T) => void | Promise<void>;

export async function bootstrap(configs: IConfigs, onInit: OnInitHook<NestExpressApplication> = noopPromise) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.get(ConfigService).setConfig(configs);
  const environment = nunjucks.configure([BUILD_ROOT, ASSETS_ROOT], {
    autoescape: true,
    noCache: true,
    express: app,
  });
  app.engine("html", environment.render);
  app.setViewEngine("html");
  await onInit(app);
  await app.listen(3000);
}
