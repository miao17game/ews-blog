import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "@global/services/auth.service";
import { UserService, getUserDelegate } from "@global/services/user.service";

@Injectable()
export class FakeAuthService extends AuthService<string> {
  constructor(private readonly user: UserService<number, string, {}>) {
    super();
  }

  public hasAccess(roles: string[]): boolean | Promise<boolean> | Observable<boolean> {
    getUserDelegate(this.user)
      .setLogined(true)
      .setUserId(123456)
      .setUserName("fakeUser")
      .setUserAccount("fakeUserAccount")
      .setUserRoles(roles)
      .setExtendInfos({});
    return true;
  }
}
