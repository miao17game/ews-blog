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

  public moduleList: any[] = [];

  constructor(private builder: Builder) {}

  ngOnInit(): void {
    this.initModuleList();
  }

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

  public onModuleExpand(model: any) {
    model.displayInfo.expanded = !model.displayInfo.expanded;
  }

  private initModuleList() {
    this.moduleList = this.builder.moduleList.map(i => {
      return {
        ...i,
        components: (i.components || []).map((e: any) => ({
          ...e,
          displayInfo: { displayName: createDisplayName(e) },
        })),
        directives: (i.directives || []).map((e: any) => ({
          ...e,
          displayInfo: { displayName: createDisplayName(e) },
        })),
        displayInfo: {
          displayName: createDisplayName(i),
          expanded: true,
        },
      };
    });
  }
}

function createDisplayName(i: any) {
  return i.displayName !== i.name ? i.displayName + " (" + i.name + ")" : i.displayName;
}
