import { Module, Global } from "@nestjs/common";
import { AuthService } from "@global/services/auth.service";
import { FakeAuthService } from "@app/services/auth.service";
import { AppModule } from "@app/app.module";

@Global()
@Module({
  imports: [AppModule],
  controllers: [],
  providers: [{ provide: AuthService, useClass: FakeAuthService }],
  exports: [AppModule, AuthService],
})
export class GlobalModule {}
