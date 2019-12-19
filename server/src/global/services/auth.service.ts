import { Injectable, Scope } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable({ scope: Scope.REQUEST })
export abstract class AuthService<R extends any = string> {
  /** @override to check if the user is authenticated. */
  public abstract hasAccess(roles: R[]): boolean | Promise<boolean> | Observable<boolean>;
  /** @override if you want to handle the next when authentication is failed. */
  public handleWhenUnauthentication?(): void;
}
