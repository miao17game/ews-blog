import { Component, OnDestroy, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { Builder } from "../../services/builder.service";

export interface IEntityCreate {
  id: string;
  module: string;
  name: string;
  displayName: string | null;
  version: string | number;
  metadata: Record<string, any>;
}

@Component({
  selector: "app-portal-module-list",
  templateUrl: "./module-list.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      displayName: target.displayName === target.name ? null : target.displayName,
      version: target.metadata.entity.version,
      metadata: target.metadata,
    });
  }
}
