import LOCALES_EN from "@angular/common/locales/en";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import { NgZorroAntdModule, NZ_I18N, en_US } from "ng-zorro-antd";
import { ErrorsModule } from "../pages/errors/errors.module";
import { AppRoutingModule } from "../shared/router.module";
import { AppComponent } from "./app.component";

registerLocaleData(LOCALES_EN);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgZorroAntdModule, ErrorsModule, AppRoutingModule],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
