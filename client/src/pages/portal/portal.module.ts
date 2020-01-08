import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PortalRootComponent } from "./root/root.component";
import { PortalLayoutComponent } from "./layout/layout.component";
import { CommonsModule } from "../../shared/commons.module";
import { PortalService } from "./services/portal.service";
import { PortalSettingComponent } from "./setting/setting.component";
import { PortalPreviewComponent } from "./preview/preview.component";

const routes: Routes = [
  { path: "", component: PortalRootComponent, data: { title: "Portal" } },
  { path: "preview", component: PortalPreviewComponent, data: { title: "Preview" } },
  { path: "settings", component: PortalSettingComponent, data: { title: "Settings" } },
];

@NgModule({
  declarations: [PortalLayoutComponent, PortalRootComponent, PortalSettingComponent, PortalPreviewComponent],
  imports: [CommonsModule, RouterModule.forChild(routes)],
  providers: [PortalService],
})
export class PortalModule {}
