import { Injectable, Scope } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable({ scope: Scope.REQUEST })
export abstract class AuthService<R extends any = string> {
  public abstract hasAccess(roles: R[]): boolean | Promise<boolean> | Observable<boolean>;
}
