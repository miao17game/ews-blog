import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { CompileService } from "../services/compile.service";

@Controller("api")
export class ApiController {
  constructor(private readonly appService: ConfigService, private readonly compiler: CompileService) {}

  @Post("page")
  createtask(@Body() data: any) {
    console.log("create task ==> ");
    console.log(data);
    const id = this.compiler.createtask(data);
    return { result: id };
  }

  @Get("page")
  gettask(@Query("id") id: string) {
    console.log("query task ==> " + id);
    const result = this.compiler.queryTask(id);
    console.log(result);
    return { result };
  }
}
