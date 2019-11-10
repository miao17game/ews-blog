import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonsModule } from "./commons.module";

const routes: Routes = [
  // { path: "", redirectTo: "/main", pathMatch: "full" },
  { path: "", redirectTo: "/portal", pathMatch: "full" },
  {
    path: "main",
    loadChildren: () => import("../pages/main/main.module").then(mod => mod.MainModule),
  },
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
