import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, from, Subject } from "rxjs";
import { ROLES_GUARD__ROLES } from "../utils/roles";
import { AuthService } from "../services/auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_GUARD__ROLES, context.getHandler());
    console.log(roles);
    if (!roles) {
      return true;
    }
    const hasAccess = this.auth.hasAccess(roles);
    return typeof hasAccess === "boolean"
      ? Promise.resolve(hasAccess)
      : hasAccess instanceof Observable
      ? hasAccess.toPromise()
      : hasAccess;
  }
}
