import { Response as Resp } from "express";
import { Controller, Get, Param, Response } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { CompileService } from "../services/compile.service";

@Controller("site")
export class SiteController {
  constructor(private readonly appService: ConfigService, private readonly compiler: CompileService) {}

  @Get("/:templateName")
  getIndexHtml(@Param("templateName") name: string, @Response() resp: Resp) {
    const template = this.compiler.getPageTemplate(name);
    if (!template) {
      throw new Error(`page[${name}] is not found`);
    }
    return resp.render(template);
  }
}
