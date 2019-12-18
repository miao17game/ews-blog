import { Module } from "@nestjs/common";
import { GlobalModule } from "@global/global.module";
import { ApiController } from "./controllers/api.controller";
import { SiteController } from "./controllers/site.controller";
import { PortalController } from "./controllers/portal.controller";
import { ConfigService } from "./services/config.service";
import { CompileService } from "./services/compile.service";

@Module({
  imports: [GlobalModule],
  controllers: [ApiController, SiteController, PortalController],
  providers: [ConfigService, CompileService],
  exports: [GlobalModule, ConfigService, CompileService],
})
export class AppModule {}
