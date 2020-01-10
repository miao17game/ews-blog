import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CompileService, TaskType } from "@global/services/compile.service";
import { UserService } from "@global/services/user.service";
import { SetRoles, UseRolesAuthentication } from "@utils/roles";
import { ICompileTask } from "../services/core-compile.service";

@Controller("api")
@UseRolesAuthentication({ roles: ["admin"] })
export class ApiController {
  constructor(private readonly compiler: CompileService<ICompileTask>, private readonly user: UserService) {}

  @Get("user")
  @SetRoles("admin")
  public getUserInfos() {
    return {
      code: 0,
      data: this.user.infos,
    };
  }

  @Get("templates")
  @SetRoles("admin")
  public queryTemplateGroup() {
    return {
      code: 0,
      data: this.compiler.getTemplateGroup(),
    };
  }

  @Post("preview")
  @SetRoles("super-admin")
  public async createSourcePreview(@Body() data: any) {
    console.log("create preview ==> ");
    console.log(data);
    const { configs: others } = data;
    const source = await this.compiler.createSourceString(others, {
      enabled: true,
      jsx: "react",
      target: "es2015",
      module: "es2015",
    });
    return {
      code: 0,
      data: {
        source,
        configs: data,
      },
    };
  }

  @Post("task")
  @SetRoles("super-admin")
  public async createtask(@Body() data: any) {
    console.log("create task ==> ");
    console.log(data);
    const { name, ...options } = data;
    const id = await this.compiler.createTask(TaskType.CommonPageBuild, { name, options });
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
  public async gettask(@Query("id") id: string) {
    console.log("query task ==> " + id);
    const result = await this.compiler.queryTask(id);
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
