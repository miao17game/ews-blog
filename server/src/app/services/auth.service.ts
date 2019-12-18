import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export abstract class AuthService {
  public abstract hasAccess(roles: string[]): boolean | Promise<boolean> | Observable<boolean>;
}

// tslint:disable-next-line: max-classes-per-file
@Injectable()
export class FakeAuthService extends AuthService {
  public hasAccess(roles: string[]): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
