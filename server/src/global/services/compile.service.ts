import { Injectable } from "@nestjs/common";
import { IGlobalMap, IPageCreateOptions } from "@amoebajs/builder";

@Injectable()
export abstract class CompileService<T> {
  public abstract getTemplateGroup(): IGlobalMap;
  public abstract queryPageUri(name: string): string | null;
  public abstract createTask(name: string, configs: IPageCreateOptions): Promise<string>;
  public abstract createSourceString(configs: IPageCreateOptions): Promise<string>;
  public abstract queryTask(id: string): Promise<T | null>;
}
