import { Component, OnDestroy, OnInit, Input, OnChanges } from "@angular/core";
import { Builder } from "../../services/builder.service";
import { IEntityCreate } from "../module-list/module-list.component";

interface IContext {
  init: boolean;
  displayName: string;
  idVersion: string;
  inputs: IGroup[];
  attaches: any[];
}

interface IGroup {
  name: string;
  displayName: string | null;
  children: any[];
}

@Component({
  selector: "app-portal-entity-edit",
  templateUrl: "./entity-edit.html",
})
export class EntityEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  model: IEntityCreate;

  public context: IContext = {
    init: false,
    displayName: "",
    idVersion: "",
    inputs: [],
    attaches: [],
  };

  constructor(private builder: Builder) {}

  ngOnInit(): void {
    this.initContext(this.model);
  }

  private initContext(model: IEntityCreate) {
    this.context.displayName = model.displayName || model.name;
    this.context.idVersion = `${model.module}/${model.name}@${model.version}`;
    this.context.attaches = Object.entries(model.metadata.attaches).map(([, d]) => d);
    const groups: Record<string, any> = {
      default: { name: "default", displayName: "Default", children: [] },
    };
    Object.entries<any>(model.metadata.groups).forEach(
      ([name, group]) =>
        (groups[name] = {
          name: group.name.value,
          displayName:
            group.name.displayValue && group.name.displayValue !== group.name.value
              ? `${group.name.displayValue}(${group.name.value})`
              : group.name.value,
          children: [],
        }),
    );
    Object.entries<any>(model.metadata.inputs).forEach(([, d]) => groups[d.group || "default"].children.push(d));
    this.context.inputs = Object.entries(groups).map(([, g]) => g);
    // console.log(this.context);
    this.context.init = true;
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    for (const key in changes) {
      if (changes.hasOwnProperty(key)) {
        const element = changes[key];
        if (key === "model") {
          this.initContext(element.currentValue);
        }
      }
    }
  }

  ngOnDestroy(): void {}
}
