import LOCALES_EN from "@angular/common/locales/en";
import { NgModule } from "@angular/core";
import { registerLocaleData, CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import { CoreService } from "../services/core.service";
import { HttpService } from "../services/http.service";
import { CommonsModule } from "../shared/commons.module";
import { RoutesModule } from "../shared/routes.module";
import { AppComponent } from "./app.component";

registerLocaleData(LOCALES_EN);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonsModule,
    RoutesModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, CoreService, HttpService],
  bootstrap: [AppComponent],
})
export class AppModule {}
