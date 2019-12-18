import { Module, Global } from "@nestjs/common";
import { AuthService } from "@global/services/auth.service";
import { FakeAuthService } from "@app/services/auth.service";
import { UserService } from "./services/user.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [UserService, { provide: AuthService, useClass: FakeAuthService }],
  exports: [AuthService, UserService],
})
export class GlobalModule {}
