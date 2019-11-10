import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PortalRootComponent } from "./root/root.component";
import { PortalLayoutComponent } from "./layout/layout.component";
import { CommonsModule } from "../../shared/commons.module";
import { PortalService } from "./services/portal.service";
import { PortalSettingComponent } from "./setting/setting.component";

const routes: Routes = [
  { path: "", component: PortalRootComponent, data: { title: "Portal" } },
  { path: "settings", component: PortalSettingComponent, data: { title: "Settings" } },
];

@NgModule({
  declarations: [PortalLayoutComponent, PortalRootComponent, PortalSettingComponent],
  imports: [CommonsModule, RouterModule.forChild(routes)],
  providers: [PortalService],
})
export class PortalModule {}
