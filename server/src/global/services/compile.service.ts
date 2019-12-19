import { Injectable } from "@nestjs/common";
import { IPageCreateOptions, IGlobalMap } from "@amoebajs/builder";

@Injectable()
export abstract class CompileService<T> {
  public abstract getTemplateGroup(): IGlobalMap;
  public abstract queryPageUri(name: string): string | null;
  public abstract createtask(name: string, configs: IPageCreateOptions): string;
  public abstract queryTask(id: string): T | null;
}
