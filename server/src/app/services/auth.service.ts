import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "../../global/services/auth.service";

@Injectable()
export class FakeAuthService extends AuthService {
  public hasAccess(roles: string[]): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
