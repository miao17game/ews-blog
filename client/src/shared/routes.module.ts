import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CommonsModule } from "./commons.module";

const routes: Routes = [
  { path: "", redirectTo: "/portal", pathMatch: "full" },
  {
    path: "portal",
    loadChildren: () => import("../pages/portal/portal.module").then(mod => mod.PortalModule),
  },
  {
    path: "errors",
    loadChildren: () => import("../pages/errors/errors.module").then(mod => mod.ErrorsModule),
  },
  {
    path: "**",
    redirectTo: "/errors/404",
  },
];

@NgModule({
  imports: [CommonsModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RoutesModule {}
