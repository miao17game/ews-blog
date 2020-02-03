import * as BuilderSdk from "@amoebajs/builder/index.websdk";
import * as BuilderUtils from "@amoebajs/builder/utils";

export class BuilderFactory extends BuilderSdk.Factory {}

interface EwsWindow extends Window {
  AmoebajsBuilderSdk: typeof BuilderSdk;
  AmoebajsBuilderUtils: typeof BuilderUtils;
  EwsBuilderFactory: typeof BuilderFactory;
}

declare const window: EwsWindow;

window.AmoebajsBuilderSdk = BuilderSdk;
window.AmoebajsBuilderUtils = BuilderUtils;
window.EwsBuilderFactory = BuilderFactory;
