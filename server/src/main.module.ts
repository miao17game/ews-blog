import { Module } from "@nestjs/common";
import { AppModule } from "./app/app.module";
import { AuthService, FakeAuthService } from "./app/services/auth.service";

@Module({
  imports: [AppModule],
  controllers: [],
  providers: [{ provide: AuthService, useClass: FakeAuthService }],
})
export class MainModule {}
