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
  children: any[];
  displayInfo: {
    displayName: string | null;
  };
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
    this.clearData(data);
    this.formatData(data);
    this.onComplete.emit({
      id: this.model.id,
      module: this.model.module,
      name: this.model.name,
      ...data,
    });
  }

  onModelChange() {
    // console.log(this.entity.data);
  }

  addMapEntry(model: any) {
    const value = this.entity.data.inputs[model.displayInfo.fullname].value;
    const keys = model.type.mapInfo.key;
    if (Array.isArray(keys) && keys.length > 0) {
      for (const willKey of keys) {
        if (value.findIndex((i: any) => i[0] === willKey) >= 0) {
          continue;
        }
        value.push([willKey, null]);
        break;
      }
    }
    if (typeof keys === "function" || typeof keys === "string") {
      value.push([null, null]);
    }
    // console.log(model, this.entity.data.inputs[model.displayInfo.fullname]);
  }

  removeMapEntry(model: any, index: number) {
    const value = this.entity.data.inputs[model.displayInfo.fullname].value;
    // console.log(value);
    (<any[]>value).splice(index, 1);
  }

  private initContext(model: IEntityCreate) {
    this.entity = createDefaultEntity();
    this.entity.displayName = model.displayName || model.name;
    this.entity.idVersion = `${model.module}/${model.name}@${model.version}`;
    this.entity.attaches = Object.entries(model.metadata.attaches).map(([, d]) => d);
    const groups: Record<string, any> = {
      default: {
        name: "default",
        children: [],
        displayInfo: {
          displayName: "Default",
        },
      },
    };
    Object.entries<any>(model.metadata.groups).forEach(
      ([name, group]) =>
        (groups[name] = {
          name: group.name.value,
          children: [],
          displayInfo: {
            displayName: createDisplayName(group),
          },
        }),
    );
    Object.entries<any>(model.metadata.inputs).forEach(([, d]) => {
      const groupName = d.group || "default";
      const fullname = `${d.group || "default"}.${d.name.value}`;
      this.initItemNgModel(fullname, d);
      groups[groupName].children.push({
        ...d,
        displayInfo: {
          displayName: createDisplayName(d),
          fullname: fullname,
        },
      });
    });
    this.entity.inputs = Object.entries(groups).map(([, g]) => g);
    this.entity.init = true;
    // to DEBUG
    // console.log(this.context);
    // if (this.parents.length > 0) {
    //   const [page, ...others] = this.parents;
    //   if (page) {
    //     let x: any;
    //     const childList = this.context.page.children || [];
    //     if (others.length === 0) {
    //       this.scope = this.context.page;
    //       return;
    //     }
    //     for (const id of others) {
    //       x = childList.find(i => i.id === id);
    //       if (!x) break;
    //     }
    //     if (!x) return;
    //     this.scope = x;
    //   }
    // }
  }

  private initItemNgModel(fullname: string, d: any) {
    const ngModel: any = (this.entity.data.inputs[fullname] = { value: null });
    if (d.type.meta === "map") {
      ngModel.value = [];
      const keys = d.type.mapInfo.key;
      if (Array.isArray(keys)) {
        ngModel.typeCheck = (v: any) => keys.includes(v);
        ngModel.selectList = true;
      }
      if (typeof keys === "function") {
        ngModel.typeCheck = (v: any) => keys(v);
        ngModel.selectList = false;
      }
      if (typeof keys === "string") {
        ngModel.typeCheck = (v: any) => typeof v === "string";
        ngModel.selectList = false;
      }
    }
  }

  private clearData(data: { inputs: Record<string, any> }) {
    for (const key in data.inputs) {
      if (data.inputs.hasOwnProperty(key)) {
        const element = data.inputs[key];
        if (element.value === null) {
          delete data.inputs[key];
        }
        if (Array.isArray(element.value)) {
          if (element.value.length === 0) {
            delete data.inputs[key];
          }
          element.value = element.value.filter((i: any) => i[1] !== null);
        }
      }
    }
  }

  private formatData(data: { inputs: Record<string, any> }) {
    const newInputs: Record<string, any> = {};
    for (const key in data.inputs) {
      if (data.inputs.hasOwnProperty(key)) {
        const element = data.inputs[key];
        const [group, realKey] = key.split(".");
        if (!newInputs[group]) newInputs[group] = {};
        (group === "default" ? newInputs : newInputs[group])[realKey] = {
          type: "literal",
          expression: element.value,
        };
      }
    }
    data.inputs = newInputs;
  }
}

function createDisplayName(d: any) {
  return d.name.displayValue !== d.name.value && !!d.name.displayValue
    ? `${d.name.displayValue} (${d.name.value})`
    : d.name.value;
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
