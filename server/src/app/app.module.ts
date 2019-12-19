import { Module } from "@nestjs/common";
import { ApiController } from "./controllers/api.controller";
import { SiteController } from "./controllers/site.controller";
import { PortalController } from "./controllers/portal.controller";

@Module({
  imports: [],
  controllers: [ApiController, SiteController, PortalController],
  providers: [],
  exports: [],
})
export class AppModule {}
