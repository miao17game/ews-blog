import { Component, OnDestroy, OnInit, Output, EventEmitter } from "@angular/core";
import { Builder } from "../../services/builder.service";

export interface IEntityCreate {
  id: string;
  module: string;
  name: string;
  version: string | number;
  metadata: Record<string, any>;
}

@Component({
  selector: "app-portal-module-list",
  templateUrl: "./module-list.html",
})
export class ModuleListComponent implements OnInit, OnDestroy {
  @Output()
  onEntityCreate = new EventEmitter<IEntityCreate>();

  get moduleList() {
    return this.builder.moduleList;
  }

  constructor(private builder: Builder) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onEntityClick(target: any) {
    console.log(target);
    this.onEntityCreate.emit({
      id: this.builder.Utils.createEntityId(),
      module: target.moduleName,
      name: target.name,
      version: target.metadata.entity.version,
      metadata: target.metadata,
    });
  }
}
