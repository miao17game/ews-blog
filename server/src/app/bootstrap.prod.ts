import * as path from "path";
import * as nunjucks from "nunjucks";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { IConfigs } from "../configs/config";
import { ConfigService } from "../services/config.service";

const buildPath = path.join(__dirname, "..", "..", "build");
const assetsPath = path.join(__dirname, "..", "assets");

export async function bootstrap(configs: IConfigs) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.get(ConfigService).setConfig(configs);
  app.useStaticAssets(buildPath);
  const environment = nunjucks.configure([buildPath, assetsPath], {
    autoescape: true,
    noCache: true,
    express: app,
  });
  app.engine("html", environment.render);
  app.setViewEngine("html");
  await app.listen(3000);
}
