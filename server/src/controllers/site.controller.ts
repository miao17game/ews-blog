import { Response as Resp } from "express";
import { Controller, Get, Param, Response } from "@nestjs/common";
import { ConfigService } from "../services/config.service";

@Controller("site")
export class SiteController {
  constructor(private readonly appService: ConfigService) {}

  @Get("/:templateName")
  getIndexHtml(@Param("templateName") name: string, @Response() resp: Resp) {
    return resp.render(`website/${name}`);
  }
}
