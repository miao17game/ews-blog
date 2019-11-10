import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Error404Component } from "./404/404.component";
import { Error500Component } from "./500/500.component";
import { CommonsModule } from "../../shared/commons.module";

const routes: Routes = [
  { path: "404", component: Error404Component, data: { title: "Not Found" } },
  { path: "500", component: Error500Component, data: { title: "Internal Server Error" } },
];

@NgModule({
  declarations: [Error404Component, Error500Component],
  imports: [CommonsModule, RouterModule.forChild(routes)],
  providers: [],
})
export class ErrorsModule {}
