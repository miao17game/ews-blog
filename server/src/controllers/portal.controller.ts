import { Response as Resp } from "express";
import { Controller, Get, Response } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { UseRoles, Roles } from "../utils/roles";

@Controller("portal")
@UseRoles()
export class PortalController {
  constructor(private readonly configs: ConfigService) {}

  @Get(["", "/*", "/**/*"])
  @Roles("admin")
  getIndex(@Response() resp: Resp) {
    const config = this.configs.getConfig();
    if (config.portal.type === "redirect") {
      return resp.redirect(config.portal.uri);
    }
    return resp.render(config.portal.uri);
  }
}
