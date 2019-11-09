import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";

const routes: Routes = [{ path: "**", component: DashboardComponent, data: { title: "Dashboard" } }];

@NgModule({
  declarations: [DashboardComponent],
  imports: [RouterModule.forChild(routes)],
  providers: [],
})
export class MainModule {}
