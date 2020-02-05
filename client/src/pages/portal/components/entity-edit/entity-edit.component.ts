import { Component, OnDestroy, OnInit, Input, OnChanges, Output, EventEmitter } from "@angular/core";
import { Builder, ICompileContext } from "../../services/builder.service";
import { IEntityCreate } from "../module-list/module-list.component";

interface IEntityContext {
  init: boolean;
  displayName: string;
  idVersion: string;
  inputs: IGroup[];
  attaches: any[];
  data: {
    inputs: Record<string, any>;
  };
}

interface IScope {}

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

  @Input()
  context: ICompileContext;

  @Input()
  parents: string[] = [];

  @Output()
  onComplete = new EventEmitter<any>();

  public entity!: IEntityContext;
  public scope: IScope = {};

  constructor(private builder: Builder) {}

  ngOnInit(): void {
    this.initContext(this.model);
  }

  private initContext(model: IEntityCreate) {
    this.entity = createDefaultEntity();
    this.entity.displayName = model.displayName || model.name;
    this.entity.idVersion = `${model.module}/${model.name}@${model.version}`;
    this.entity.attaches = Object.entries(model.metadata.attaches).map(([, d]) => d);
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
    Object.entries<any>(model.metadata.inputs).forEach(([, d]) => {
      const groupName = d.group || "default";
      const fullname = `${d.group || "default"}.${d.name.value}`;
      groups[groupName].children.push(d);
      this.entity.data.inputs[fullname] = { value: null };
    });
    this.entity.inputs = Object.entries(groups).map(([, g]) => g);
    this.entity.init = true;
    // to DEBUG
    console.log(this.context);
    if (this.parents.length > 0) {
      const [page, ...others] = this.parents;
      console.log(page);
      if (page) {
        let x: any;
        const childList = this.context.page.children || [];
        if (others.length === 0) {
          this.scope = this.context.page;
          return;
        }
        for (const id of others) {
          x = childList.find(i => i.id === id);
          if (!x) break;
        }
        if (!x) return;
        this.scope = x;
      }
    }
  }

  onModelChange() {
    console.log(this.entity.data);
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

  ngOnDestroy(): void {
    const { data } = this.entity;
    for (const key in data.inputs) {
      if (data.inputs.hasOwnProperty(key)) {
        const element = data.inputs[key];
        if (element.value === null) {
          delete data.inputs[key];
        }
      }
    }
    this.onComplete.emit({
      id: this.model.id,
      module: this.model.module,
      name: this.model.name,
      ...data,
    });
  }
}

function createDefaultEntity(): IEntityContext {
  return {
    init: false,
    displayName: "",
    idVersion: "",
    inputs: [],
    attaches: [],
    data: {
      inputs: {},
    },
  };
}
