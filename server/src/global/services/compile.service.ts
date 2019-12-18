import { Injectable } from "@nestjs/common";
import { IPageCreateOptions } from "@amoebajs/builder";

@Injectable()
export abstract class CompileService<T> {
  public abstract getPageTemplate(name: string): string | null;
  public abstract createtask(name: string, configs: IPageCreateOptions): string;
  public abstract queryTask(id: string): T | null;
}
