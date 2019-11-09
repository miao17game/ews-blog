import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  { path: "", redirectTo: "/main", pathMatch: "full" },
  {
    path: "main",
    loadChildren: () => import("../pages/main/main.module").then(mod => mod.MainModule),
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
