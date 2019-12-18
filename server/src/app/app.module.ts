import { Module, Global } from "@nestjs/common";
import { ApiController } from "./controllers/api.controller";
import { SiteController } from "./controllers/site.controller";
import { PortalController } from "./controllers/portal.controller";
import { ConfigService } from "./services/config.service";
import { CompileService } from "./services/compile.service";

@Global()
@Module({
  imports: [],
  controllers: [ApiController, SiteController, PortalController],
  providers: [ConfigService, CompileService],
  exports: [ConfigService, CompileService],
})
export class AppModule {}
