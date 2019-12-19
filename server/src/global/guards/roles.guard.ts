import { Injectable, CanActivate, ExecutionContext, Scope } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_GUARD__ROLES, ROLES_GUARD__CLASS_ROLES } from "@utils/roles";
import { AuthService } from "../services/auth.service";

@Injectable({ scope: Scope.REQUEST })
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<any[]>(ROLES_GUARD__ROLES, context.getHandler());
    const classRoles = this.reflector.get<any[]>(ROLES_GUARD__CLASS_ROLES, context.getClass());
    const hasAccess = this.auth.hasAccess(context.switchToHttp(), classRoles || roles || []);
    return typeof hasAccess === "boolean"
      ? Promise.resolve(hasAccess)
      : hasAccess instanceof Observable
      ? hasAccess.toPromise()
      : hasAccess;
  }
}
