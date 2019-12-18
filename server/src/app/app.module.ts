import { Module, Global } from "@nestjs/common";
import { ApiController } from "./controllers/api.controller";
import { SiteController } from "./controllers/site.controller";
import { PortalController } from "./controllers/portal.controller";
import { ConfigService } from "./services/config.service";
import { CompileService } from "./services/compile.service";
import { RolesGuard } from "./guards/roles.guard";
import { AuthService, FakeAuthService } from "./services/auth.service";

@Global()
@Module({
  imports: [],
  controllers: [ApiController, SiteController, PortalController],
  providers: [ConfigService, CompileService, RolesGuard, { provide: AuthService, useClass: FakeAuthService }],
})
export class AppModule {}
