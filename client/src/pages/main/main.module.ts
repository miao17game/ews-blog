import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { CommonsModule } from "../../shared/commons.module";

const routes: Routes = [{ path: "", component: DashboardComponent, data: { title: "Dashboard" } }];

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonsModule, RouterModule.forChild(routes)],
  providers: [],
})
export class MainModule {}
