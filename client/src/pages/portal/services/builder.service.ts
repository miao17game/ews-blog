import { Injectable } from "@angular/core";

declare global {
  interface BuilderSdk {
    [name: string]: any;
  }

  interface BuilderSdkUtils {
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
  directives?: IComponentChildDefine[];
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

@Injectable()
export class Builder {
  private factory = new window.EwsBuilderFactory().parse();

  public SDK = window.AmoebajsBuilderSdk;
  public Utils = window.AmoebajsBuilderUtils;

  public builder = this.factory.builder;
  public moduleList: any[] = [];

  constructor() {
    const modules = this.builder.globalMap.maps.modules;
    Object.entries<any>(modules).forEach(([name, md]) => {
      const components: any[] = Object.entries(md.components).map(([, cp]) => cp);
      const directives: any[] = Object.entries(md.directives).map(([, cp]) => cp);
      this.moduleList.push({ ...md, components, directives });
    });
  }
}
