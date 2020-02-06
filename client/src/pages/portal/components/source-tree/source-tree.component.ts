import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import {
  ICompileContext,
  IComponentDefine,
  IDirectiveDefine,
  Builder,
  IPageDefine,
  IComponentChildDefine,
} from "../../services/builder.service";

type IDisplay<T> = T & {
  displayInfo: {
    displayName: string;
    expanded: boolean;
  };
};

interface ISourceTree {
  components: IDisplay<IComponentDefine>[];
  directives: IDisplay<IDirectiveDefine>[];
  page?: IDisplay<IDisplayEntity>;
}

interface IDisplayEntity extends IPageDefine {
  children?: IDisplay<IPageDefine>[];
  directives?: IDisplay<IPageDefine>[];
}

@Component({
  selector: "app-portal-source-tree",
  templateUrl: "./source-tree.html",
})
export class SourceTreeComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  context: ICompileContext;

  @Output()
  onEntityClick = new EventEmitter();

  public tree: ISourceTree;

  constructor(private builder: Builder) {}

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

  public onEntityEditClick(model: any, paths: string | undefined) {
    const comp = this.tree.components.find(i => i.id === model.ref);
    if (comp) {
      return this.onEntityClick.emit({
        model,
        paths: (paths && paths.split("#")) || [],
        meta: this.builder.getComponent(comp.module, comp.name),
      });
    }
    const dire = this.tree.directives.find(i => i.id === model.ref);
    if (dire) {
      return this.onEntityClick.emit({
        model,
        paths: (paths && paths.split("#")) || [],
        meta: this.builder.getDirective(dire.module, dire.name),
      });
    }
  }

  public onEntityExpand(entity: IDisplay<IPageDefine>) {
    entity.displayInfo.expanded = !entity.displayInfo.expanded;
  }

  public checkIfShowChildren(entity: IDisplay<IPageDefine>) {
    return entity.children && entity.children.length > 0 && entity.displayInfo.expanded;
  }

  private initTree(context: ICompileContext) {
    const components = (context.components || []).map(i => ({
      ...i,
      displayInfo: {
        displayName: getDisplayText(this.builder.getComponent(i.module, i.name).displayName, i.name),
        expanded: false,
      },
    }));
    const directives = (context.directives || []).map(i => ({
      ...i,
      displayInfo: {
        displayName: getDisplayText(this.builder.getDirective(i.module, i.name).displayName, i.name),
        expanded: false,
      },
    }));
    this.tree = {
      page: null,
      directives,
      components,
    };
    this.tree.page = context.page && this.getEntityDisplayName(context.page);
  }

  private getEntityDisplayName(target: IComponentChildDefine): IDisplay<IDisplayEntity> {
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
          expanded: true,
        },
      };
    }
  }
}

function getDisplayText(displayName: string, name: string): any {
  return displayName === name ? displayName : `${displayName} (${name})`;
}
