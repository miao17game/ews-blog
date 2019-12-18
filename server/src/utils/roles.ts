import { SetMetadata, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../app/guards/roles.guard";

export const ROLES_GUARD__ROLES = "RolesGuard::roles";
export const ROLES_GUARD__CLASS_ROLES = "RolesGuard::classRoles";

export interface IRolesOptions<T> {
  roles: T[];
}

export function SetRoles<T>(...roles: T[]) {
  return SetMetadata(ROLES_GUARD__ROLES, roles);
}

export function UseRolesAuthentication<T = any>(options: Partial<IRolesOptions<T>> = {}) {
  return function auth(target: any) {
    if (options.roles) {
      SetMetadata(ROLES_GUARD__CLASS_ROLES, options.roles)(target);
    }
    return UseGuards(RolesGuard)(target);
  };
}
