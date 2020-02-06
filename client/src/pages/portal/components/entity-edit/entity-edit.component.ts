import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
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

interface IEntityEdit extends IEntityCreate {
  source?: any;
}

const DEFAULT_ENUM_VALUE_LABEL = "默认值";
const DEFAULT_ENUM_VALUE = "?##default##?";

@Component({
  selector: "app-portal-entity-edit",
  templateUrl: "./entity-edit.html",
})
export class EntityEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  model: IEntityEdit;

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
    console.log(this.model);
    console.log(this.context);
    console.log(this.parents);
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

  isColor(value: string | null) {
    if (typeof value !== "string") return false;
    return /^#[0-9abcdefABCDEF]{6,8}$/.test(value);
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
    (<any[]>value).splice(index, 1);
  }

  clearNumberValue(model: any) {
    this.entity.data.inputs[model.displayInfo.fullname].value = null;
  }

  private initContext(model: IEntityEdit) {
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
      const propertyPath = !d.group ? d.name.value : `${d.group}.${d.name.value}`;
      this.initItemNgModel(fullname, propertyPath, model, d);
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

  private initItemNgModel(fullname: string, propertyPath: string, model: IEntityEdit, d: any) {
    const ngModel: any = (this.entity.data.inputs[fullname] = {
      value: null,
      type: d.type.meta,
    });
    const forkData: any = cloneDeep(model.source || {});
    const sourceValue = get(forkData.input, propertyPath, null);
    if (d.type.meta === "string" || d.type.meta === "number") {
      ngModel.value = sourceValue === null ? null : sourceValue.expression;
    } else if (d.type.meta === "map") {
      ngModel.value = sourceValue === null ? [] : sourceValue.expression;
      const keys = d.type.mapInfo.key;
      ngModel.selectList = false;
      if (Array.isArray(keys)) {
        ngModel.typeCheck = (v: any) => keys.includes(v);
        ngModel.selectList = true;
      }
      if (typeof keys === "function") {
        ngModel.typeCheck = (v: any) => keys(v);
      }
      if (typeof keys === "string") {
        ngModel.typeCheck = (v: any) => typeof v === "string";
      }
    } else if (d.type.meta === "enums") {
      ngModel.value = sourceValue === null ? DEFAULT_ENUM_VALUE : sourceValue.expression;
      const keys = d.type.enumsInfo;
      ngModel.selectList = false;
      const otherOptions = keys.map((k: string) => ({ key: k, value: k }));
      ngModel.enumValues = [{ key: DEFAULT_ENUM_VALUE_LABEL, value: DEFAULT_ENUM_VALUE }, ...otherOptions];
      if (Array.isArray(keys)) {
        ngModel.typeCheck = (v: any) => keys.includes(v);
        ngModel.selectList = true;
      }
    }
  }

  private clearData(data: { inputs: Record<string, any> }) {
    for (const key in data.inputs) {
      if (data.inputs.hasOwnProperty(key)) {
        const element = data.inputs[key];
        if (element.type === "string" || element.type === "number") {
          if (element.value === null) {
            delete data.inputs[key];
          }
        } else if (element.type === "map") {
          if (Array.isArray(element.value)) {
            if (element.value.length === 0) {
              delete data.inputs[key];
            }
            element.value = element.value.filter((i: any) => i[1] !== null);
          }
        } else if (element.type === "enums") {
          if (element.value === DEFAULT_ENUM_VALUE) {
            delete data.inputs[key];
          }
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
