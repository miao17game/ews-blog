import { NgModule } from "@angular/core";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { JsonStringifyPipe } from "./pipes/json.pipe";

@NgModule({
  declarations: [JsonStringifyPipe],
  exports: [CommonModule, FormsModule, NgZorroAntdModule, JsonStringifyPipe],
})
export class CommonsModule {}
