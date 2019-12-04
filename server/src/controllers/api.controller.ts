import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { CompileService } from "../services/compile.service";

@Controller("api")
export class ApiController {
  constructor(private readonly appService: ConfigService, private readonly compiler: CompileService) {}

  @Post("task")
  createtask(@Body() data: any) {
    console.log("create task ==> ");
    console.log(data);
    const { name, ...others } = data;
    const id = this.compiler.createtask(name, others);
    return {
      code: 0,
      data: {
        id,
        configs: data,
      },
    };
  }

  @Get("task")
  gettask(@Query("id") id: string) {
    console.log("query task ==> " + id);
    const result = this.compiler.queryTask(id);
    console.log(result);
    if (!result) {
      return {
        code: 404,
        data: {
          id: -1,
          errorMsg: `task[${id}] not found`,
        },
      };
    }
    return { code: 0, data: result };
  }
}
