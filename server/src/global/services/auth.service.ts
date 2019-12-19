import { Injectable, Scope } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { Observable } from "rxjs";

@Injectable({ scope: Scope.REQUEST })
export abstract class AuthService<R extends any = string> {
  /** @override to check if the user is authenticated. */
  public abstract hasAccess(host: HttpArgumentsHost, roles: R[]): boolean | Promise<boolean> | Observable<boolean>;
  /** @override if you want to handle the next when authentication is failed. */
  public handleWhenUnauthentication?(host: HttpArgumentsHost): void;
}
