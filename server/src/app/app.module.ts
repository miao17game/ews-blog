import { Module } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { ApiController } from "../controllers/api.controller";
import { SiteController } from "../controllers/site.controller";
import { PortalController } from "../controllers/portal.controller";
import { CompileService } from "../services/compile.service";
import { AuthService, FakeAuthService } from "../services/auth.service";
import { RolesGuard } from "../guards/roles.guard";

@Module({
  imports: [],
  controllers: [ApiController, SiteController, PortalController],
  providers: [ConfigService, CompileService, RolesGuard, { provide: AuthService, useClass: FakeAuthService }],
})
export class AppModule {}
