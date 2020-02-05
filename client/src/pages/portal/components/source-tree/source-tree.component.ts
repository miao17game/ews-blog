import { Component, OnInit, OnDestroy, OnChanges, Input } from "@angular/core";
import {
  ICompileContext,
  IComponentDefine,
  IDirectiveDefine,
  Builder,
  IPageDefine,
  IComponentChildDefine,
} from "../../services/builder.service";

type IExtend<T> = T & {
  displayInfo: { displayName: string };
};

interface ISourceTree {
  components: IExtend<IComponentDefine>[];
  directives: IExtend<IDirectiveDefine>[];
  page?: IDisplayEntity;
}

interface IDisplayEntity extends IPageDefine {
  displayInfo: { displayName: string };
  children?: IExtend<IPageDefine>[];
  directives?: IExtend<IPageDefine>[];
}

@Component({
  selector: "app-portal-source-tree",
  templateUrl: "./source-tree.html",
})
export class SourceTreeComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  context: ICompileContext;

  public tree: ISourceTree;

  constructor(private builder: Builder) {}

  private initTree(context: ICompileContext) {
    const components = (context.components || []).map(i => ({
      ...i,
      displayInfo: { displayName: getDisplayText(this.builder.getComponent(i.module, i.name).displayName, i.name) },
    }));
    const directives = (context.directives || []).map(i => ({
      ...i,
      displayInfo: { displayName: getDisplayText(this.builder.getDirective(i.module, i.name).displayName, i.name) },
    }));
    this.tree = {
      page: null,
      directives,
      components,
    };
    this.tree.page = context.page && this.getEntityDisplayName(context.page);
  }

  private getEntityDisplayName(target: IComponentChildDefine): IDisplayEntity {
    const { ref } = target;
    const { children, directives, ...others } = target;
    const comp = this.tree.components.find(i => i.id === ref);
    if (comp) {
      return {
        ...others,
        children: (children || []).map(i => this.getEntityDisplayName(i)).filter(i => !!i),
        directives: (directives || []).map(i => this.getEntityDisplayName(i)).filter(i => !!i),
        displayInfo: {
          displayName: comp.displayInfo.displayName,
        },
      };
    }
  }

  ngOnInit(): void {
    this.initTree(this.context);
  }

  ngOnDestroy(): void {}

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    for (const key in changes) {
      if (changes.hasOwnProperty(key)) {
        const element = changes[key];
        if (key === "context") {
          this.initTree(element.currentValue);
        }
      }
    }
  }
}

function getDisplayText(displayName: string, name: string): any {
  return displayName === name ? displayName : `${displayName}(${name})`;
}
