import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
// import { BuilderSdk } from "@amoebajs/builder-websdk";

import { AppModule } from "./app/app.module";
import { ENV } from "./env";

// console.log(BuilderSdk.Factory);

if (ENV.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
