import { Module } from "@nestjs/common";
import { GlobalModule } from "@global/global.module";
import { ApiController } from "./controllers/api.controller";
import { SiteController } from "./controllers/site.controller";
import { PortalController } from "./controllers/portal.controller";

@Module({
  imports: [GlobalModule],
  controllers: [ApiController, SiteController, PortalController],
  providers: [],
  exports: [GlobalModule],
})
export class AppModule {}
