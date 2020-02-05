import * as BuilderSdk from "@amoebajs/builder/index.websdk";
import * as BuilderUtils from "@amoebajs/builder/utils";
import { CommonModule, LayoutModule, ZentModule } from "@amoebajs/basic-modules";
import { BuilderFactory } from "./index";

interface EwsWindow extends Window {
  AmoebajsBuilderSdk: typeof BuilderSdk;
  AmoebajsBuilderUtils: typeof BuilderUtils;
  EwsBuilderFactory: typeof BuilderFactory;
  EwsModules: {
    CommonModule: typeof CommonModule;
    LayoutModule: typeof LayoutModule;
    ZentModule: typeof ZentModule;
  };
}

declare const window: EwsWindow;

window.AmoebajsBuilderSdk = BuilderSdk;
window.AmoebajsBuilderUtils = BuilderUtils;
window.EwsBuilderFactory = BuilderFactory;
window.EwsModules = {
  CommonModule,
  LayoutModule,
  ZentModule,
};
