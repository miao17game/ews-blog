import { SetMetadata, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../guards/roles.guard";

export const ROLES_GUARD__ROLES = "RolesGuard::roles";

export const Roles = (...roles: string[]) => SetMetadata(ROLES_GUARD__ROLES, roles);
export const UseRoles = () => UseGuards(RolesGuard);
