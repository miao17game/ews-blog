import { Injectable } from "@nestjs/common";
import { IGlobalMap, IPageCreateOptions, ISourceCreateTranspileOptions } from "@amoebajs/builder";

export enum TaskType {
  CommonPageBuild = 1,
  PreviewEnvironBuild = 2,
}

export interface ICommonBuildConfigs {
  name: string;
  options: IPageCreateOptions;
}

@Injectable()
export abstract class CompileService<T> {
  public abstract getTemplateGroup(): IGlobalMap;
  public abstract queryPageUri(name: string): string | null;
  public abstract createTask(type: TaskType.PreviewEnvironBuild, configs: {}): Promise<string>;
  public abstract createTask(type: TaskType.CommonPageBuild, configs: ICommonBuildConfigs): Promise<string>;
  public abstract createSourceString(
    configs: IPageCreateOptions,
    transpile?: Partial<ISourceCreateTranspileOptions>,
  ): Promise<string>;
  public abstract queryTask(id: string): Promise<T | null>;
}
