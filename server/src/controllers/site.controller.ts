import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "../services/config.service";

@Controller("site")
export class SiteController {
  constructor(private readonly appService: ConfigService) {}

  @Get()
  getIndexHtml(): string {
    return this.appService.getHello();
  }
}
