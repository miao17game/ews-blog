import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "../services/config.service";

@Controller("api")
export class ApiController {
  constructor(private readonly appService: ConfigService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
