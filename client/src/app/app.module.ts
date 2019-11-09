import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { ErrorsModule } from "../pages/errors/errors.module";
import { AppRoutingModule } from "../shared/router.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ErrorsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
