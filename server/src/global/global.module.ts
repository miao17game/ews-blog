import { Module, Global } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { FakeAuthService } from "../app/services/auth.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [{ provide: AuthService, useClass: FakeAuthService }],
  exports: [AuthService],
})
export class GlobalModule {}
