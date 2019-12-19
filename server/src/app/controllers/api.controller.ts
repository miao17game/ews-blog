import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { CompileService } from "@global/services/compile.service";
import { UseRolesAuthentication, SetRoles } from "@utils/roles";
import { ICompileTask } from "../services/core-compile.service";

@Controller("api")
@UseRolesAuthentication({ roles: ["admin"] })
export class ApiController {
  constructor(private readonly compiler: CompileService<ICompileTask>) {}

  @Get("templates")
  @SetRoles("admin")
  public queryTemplateGroup() {
    return {
      code: 0,
      data: this.compiler.getTemplateGroup(),
    };
  }

  @Post("task")
  @SetRoles("super-admin")
  public createtask(@Body() data: any) {
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
  @SetRoles("admin")
  public gettask(@Query("id") id: string) {
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
