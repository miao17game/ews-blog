import { Module } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { ApiController } from "../controllers/api.controller";
import { SiteController } from "../controllers/site.controller";
import { PortalController } from "../controllers/portal.controller";

@Module({
  imports: [],
  controllers: [ApiController, SiteController, PortalController],
  providers: [ConfigService],
})
export class AppModule {}
