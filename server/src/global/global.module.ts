import { Module, Global } from "@nestjs/common";
import { AuthService } from "@global/services/auth.service";
import { FakeAuthService } from "@app/services/fake-auth.service";
import { UserService } from "@global/services/user.service";
import { CompileService } from "@global/services/compile.service";
import { CoreCompiler } from "@app/services/core-compile.service";
import { ConfigService } from "@global/services/config.service";
import { AppModule } from "@app/app.module";

@Global()
@Module({
  imports: [AppModule],
  controllers: [],
  providers: [
    ConfigService,
    UserService,
    { provide: AuthService, useClass: FakeAuthService },
    { provide: CompileService, useClass: CoreCompiler },
  ],
  exports: [ConfigService, AuthService, UserService, CompileService],
})
export class GlobalModule {}
