import { Injectable } from "@angular/core";

declare global {
  interface BuilderSdk {
    [name: string]: any;
  }

  interface BuilderSdkUtils {
    createEntityId(): string;
    [name: string]: any;
  }

  interface BuilderFactory {
    [prop: string]: any;
  }

  interface IConstructor<T> {
    new (...args: any[]): T;
  }

  interface IEwsWindow {
    AmoebajsBuilderSdk: BuilderSdk;
    AmoebajsBuilderUtils: BuilderSdkUtils;
    EwsBuilderFactory: IConstructor<BuilderFactory>;
  }

  interface Window extends IEwsWindow {}
}

export interface IDirectiveDefine {
  module: string;
  name: string;
  id: string;
  version: string | number;
}

export interface IComponentDefine extends IDirectiveDefine {}

export interface IDirectiveChildDefine {
  ref: string;
  id: string;
  input?: { [name: string]: any };
}

export interface IComponentChildDefine extends IDirectiveChildDefine {
  children?: IComponentChildDefine[];
  directives?: IDirectiveChildDefine[];
  attach?: { [name: string]: any };
  props?: { [name: string]: any };
}

export interface IPageDefine extends IComponentChildDefine {
  slot?: string;
}

export interface ICompileContext {
  provider: "react";
  components?: IComponentDefine[];
  directives?: IDirectiveDefine[];
  page?: IPageDefine;
}

export interface ISourceModule {
  name: string;
  displayName: string | null;
  value: Function;
  provider: "react";
  metadata: { entity: IEntityDefine };
  components: Record<string, IImportDeclaration>;
  directives: Record<string, IImportDeclaration>;
}

export interface ICompileModule extends Omit<ISourceModule, "components" | "directives"> {
  components: IImportDeclaration[];
  directives: IImportDeclaration[];
}

export type ICompileTypeMeta = "string" | "number" | "map" | "enums" | "onject";

export interface IInputDefine {
  realName: string;
  name: {
    value: string;
    displayValue: string;
    i18n: Record<string, string>;
  };
  group: string | null;
  description: string | null;
  type: {
    meta: ICompileTypeMeta;
    enumsInfo: (string | number)[] | null;
    mapInfo: { key: any[] | Function; value: any } | null;
  };
}

export interface IGroupDefine {
  name: {
    value: string;
    displayValue: string | null;
    i18n: Record<string, string>;
  };
  description: {
    value: string | null;
    i18n: Record<string, string>;
  };
}

export interface IEntityDefine {
  name: string;
  version: string | number;
  displayName: string;
  dependencies: Record<string, string>;
  description: string | null;
}

export interface IImportDeclaration {
  name: string;
  displayName: string;
  moduleName: string;
  value: Function;
  provider: "react";
  metadata: {
    entity: IEntityDefine;
    groups: Record<string, IGroupDefine>;
    inputs: Record<string, IInputDefine>;
    attaches: Record<string, IInputDefine>;
    props: Record<string, any>;
    entityExtensions: Record<string, any>;
  };
}

@Injectable()
export class Builder {
  private factory = new window.EwsBuilderFactory().parse();

  public SDK = window.AmoebajsBuilderSdk;
  public Utils = window.AmoebajsBuilderUtils;

  public builder = this.factory.builder;
  public moduleList: ICompileModule[] = [];

  constructor() {
    const modules = this.builder.globalMap.maps.modules;
    Object.entries<ISourceModule>(modules).forEach(([name, md]) => {
      const components = Object.entries(md.components).map(([, cp]) => cp);
      const directives = Object.entries(md.directives).map(([, cp]) => cp);
      this.moduleList.push({ ...md, components, directives });
    });
  }

  public getComponent(module: string, name: string): IImportDeclaration {
    return this.builder.globalMap.getComponent(module, name);
  }

  public getDirective(module: string, name: string): IImportDeclaration {
    return this.builder.globalMap.getDirective(module, name);
  }
}
