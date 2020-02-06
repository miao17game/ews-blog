import SDK from "@stackblitz/sdk";
import yamljs from "js-yaml";
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, TemplateRef, Renderer2 } from "@angular/core";
import { NzMessageService, NzModalService, NzModalRef } from "ng-zorro-antd";
import { Project } from "@stackblitz/sdk/typings/interfaces";
import { VM } from "@stackblitz/sdk/typings/VM";
import { PortalService } from "../services/portal.service";
import { Builder, ICompileContext } from "../services/builder.service";
import { EntityEditComponent } from "../components/entity-edit/entity-edit.component";

const CommonDepts = {
  "@types/react": "^16.9.7",
  rxjs: "^6.5.4",
};

@Component({
  selector: "app-portal-preview",
  templateUrl: "./preview.html",
})
export class PortalPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild("previewRender", { static: false }) previewRender: ElementRef;
  @ViewChild("previewTpl", { static: false }) previewTpl: TemplateRef<HTMLDivElement>;
  @ViewChild("modalContent", { static: false }) modalContent: TemplateRef<any>;
  @ViewChild("deleteModalContext", { static: false }) deleteModalContext: TemplateRef<any>;

  public showButton = false;
  public showEditor: "view" | "config" | "hide" = "view";
  public showPreview = {
    edit: true,
    preview: false,
  };

  public lastDepts: Record<string, string> = {};
  public tempEntityData!: any;
  public modelRef!: NzModalRef;

  public parentPaths: string[] = [];
  public createContext = createDefaultConfigs();
  public pageConfigs = yamljs.safeDump(this.createContext);

  public lastModalOk = false;
  public lastModalType!: "create" | "edit";

  public willDelete!: any;

  public get lastDeptKvs() {
    return Object.entries(this.lastDepts);
  }

  private vm!: VM;
  private project: Project = {
    files: {
      "public/index.html": `<div id="app"></div>`,
      "src/index.js": "",
    },
    dependencies: {},
    title: "Preview Page",
    description: "preview page",
    template: "create-react-app",
    tags: [],
    settings: {
      compile: {
        trigger: "save",
        action: "hmr",
        clearConsole: true,
      },
    },
  };

  constructor(
    private renderer: Renderer2,
    private portal: PortalService,
    private message: NzMessageService,
    private modal: NzModalService,
    private builder: Builder,
  ) {}

  ngOnInit() {
    // console.log(this.builder.moduleList);
  }

  ngAfterViewInit() {
    this.showButton = true;
  }

  onEditorClick(value: any) {
    if (value === "config") {
      this.pageConfigs = yamljs.safeDump(this.createContext);
    }
    this.showEditor = value;
  }

  onPreviewClick(target: any) {
    this.showPreview[target] = !this.showPreview[target];
    this.trackPreviewIfNeed(this.createContext);
  }

  onEntityCreate(e: any) {
    this.tempEntityData = e;
    if (this.modelRef) {
      this.modelRef.getInstance().nzWidth = "80vw";
    }
  }

  editGoBack() {
    this.tempEntityData = null;
    if (this.modelRef) {
      this.modelRef.getInstance().nzWidth = "40vw";
    }
  }

  showModal() {
    if (this.modelRef) {
      this.modelRef.destroy();
    }
    this.lastModalOk = false;
    this.lastModalType = "create";
    this.modelRef = this.modal.create({
      nzTitle: "创建节点",
      nzContent: this.modalContent,
      nzWidth: "40vw",
      nzOnOk: () => {
        this.tempEntityData = null;
        this.parentPaths = [];
        this.lastModalOk = true;
      },
      nzOnCancel: () => {
        this.tempEntityData = null;
        this.parentPaths = [];
      },
    });
  }

  editEntityOpenModal({ model, meta, paths }: any) {
    if (this.modelRef) {
      this.modelRef.destroy();
    }
    this.lastModalOk = false;
    this.lastModalType = "edit";
    this.modelRef = this.modal.create({
      nzTitle: "编辑节点",
      nzContent: EntityEditComponent,
      nzWidth: "80vw",
      nzBodyStyle: {
        height: "64vh",
        "overflow-y": "auto",
      },
      nzComponentParams: {
        context: this.createContext,
        model: {
          id: model.id,
          module: meta.moduleName,
          name: meta.name,
          displayName: meta.displayName === meta.name ? null : meta.displayName,
          version: meta.metadata.entity.version,
          metadata: meta.metadata,
          source: model,
        },
        parents: paths,
      },
      nzOnOk: () => {
        this.tempEntityData = null;
        this.parentPaths = [];
        this.lastModalOk = true;
      },
      nzOnCancel: () => {
        this.tempEntityData = null;
        this.parentPaths = [];
      },
    });
  }

  onEmit(e: any) {
    console.log(e);
  }

  deleteEntityFromContext({ found, transform }: any) {
    this.willDelete = found;
    const ref = this.modal.warning({
      nzTitle: "确认删除节点吗?",
      nzCancelText: "Cancel",
      nzContent: this.deleteModalContext,
      nzOnOk: () => {
        this.createContext = transform(this.createContext);
        this.trackPreviewIfNeed(this.createContext);
        ref.destroy();
        this.willDelete = null;
      },
      nzOnCancel: () => {
        ref.destroy();
        this.willDelete = null;
      },
    });
  }

  onTextareaChange(value: string) {
    this.createContext = yamljs.safeLoad(value);
    this.trackPreviewIfNeed(this.createContext);
  }

  private async runUpdate(confs?: any) {
    try {
      const configs = confs || yamljs.safeLoad(this.pageConfigs);
      const result = await this.portal.createSource(configs);
      const hasDeptsChange = this.checkIfAllEqual(result.data.dependencies);
      if (this.vm && hasDeptsChange) {
        this.vm.applyFsDiff({
          create: {
            "src/index.js": result.data.source,
          },
          destroy: [],
        });
      } else {
        const firstChild = this.previewRender.nativeElement.childNodes[0];
        if (firstChild) {
          this.renderer.removeChild(this.previewRender.nativeElement, firstChild);
          this.vm = null;
        }
        this.project.files["src/index.js"] = result.data.source;
        this.lastDepts = { ...result.data.dependencies };
        this.project.dependencies = {
          ...CommonDepts,
          ...result.data.dependencies,
        };
        this.onStart();
      }
    } catch (error) {
      this.message.error(JSON.stringify(error.toString()));
    }
  }

  private checkIfAllEqual(newDepts: Record<string, string>) {
    return Object.entries(newDepts).every(([k, v]) => k in this.lastDepts && this.lastDepts[k] === v);
  }

  private onStart() {
    const tpl = this.previewTpl.createEmbeddedView(null);
    this.renderer.appendChild(this.previewRender.nativeElement, tpl.rootNodes[0]);
    SDK.embedProject(tpl.rootNodes[0], this.project, {
      hideExplorer: true,
      hideDevTools: true,
      hideNavigation: true,
      forceEmbedLayout: true,
      view: "preview",
    }).then(vm => {
      this.vm = vm;
      const iframe = this.previewRender.nativeElement.childNodes[0];
      this.renderer.setAttribute(iframe, "style", "width: 100%; height: 80vh");
      this.renderer.setAttribute(iframe, "height", "");
    });
  }

  private trackPreviewIfNeed(confs?: any) {
    if (this.showPreview.preview) {
      this.runUpdate(confs);
    }
  }
}

function createDefaultConfigs(): ICompileContext {
  return {
    provider: "react",
    // framework: { sdk: "0.0.1" },
    components: [
      { id: "GridLayout", name: "grid-layout", module: "ambjs-layout-module", version: "0.0.1-beta.0" },
      { id: "StackLayout", name: "stack-layout", module: "ambjs-layout-module", version: "0.0.1-beta.0" },
      { id: "ZentButton", name: "zent-button", module: "zent-module", version: "0.0.1" },
    ],
    directives: [
      { id: "GlobalState", name: "global-state", module: "ambjs-common-module", version: "0.0.1-beta.0" },
      { id: "ZentCssImport", name: "zent-base-css", module: "zent-module", version: "0.0.1" },
    ],
    page: {
      ref: "GridLayout",
      id: "GridLayoutPageRoot",
      slot: "app",
      input: {
        basic: {
          width: { type: "literal", expression: "100vw" },
          height: { type: "literal", expression: "100vh" },
        },
        grid: {
          rowCount: { type: "literal", expression: 2 },
          columnCount: { type: "literal", expression: 3 },
          rowSizes: {
            type: "literal",
            expression: [
              [1, 50],
              [2, 50],
            ],
          },
          columnSizes: {
            type: "literal",
            expression: [
              [1, 30],
              [2, 40],
              [3, 30],
            ],
          },
        },
      },
      directives: [
        { ref: "ZentCssImport", id: "ZentCssImportInstance01" },
        {
          ref: "GlobalState",
          id: "GlobalStateInstance01",
          input: {
            name: { type: "literal", expression: "AppContext" },
            state: {
              type: "literal",
              expression: [
                ["demoNumber", 123456],
                ["buttonName", "XXXXXXXXXX"],
                ["objectState", { a: 24523, b: false }],
              ],
            },
          },
        },
      ],
      children: [
        {
          ref: "GridLayout",
          id: "GridLayoutChild01",
          input: {
            basic: {
              background: { type: "literal", expression: "#fea500" },
              padding: { type: "literal", expression: [["all", "10px"]] },
            },
          },
          children: [
            {
              ref: "StackLayout",
              id: "StackLayoutChild01",
              input: {
                basic: { background: { type: "literal", expression: "#888888" } },
              },
              children: [
                {
                  ref: "ZentButton",
                  id: "ZentButtonInstance02",
                  props: { children: { type: "literal", syntaxType: "string", expression: "BUTTON01" } },
                },
                {
                  ref: "ZentButton",
                  id: "ZentButtonInstance03",
                  props: {
                    children: { type: "literal", syntaxType: "string", expression: "BUTTON02" },
                    type: { type: "literal", syntaxType: "string", expression: "primary" },
                  },
                },
                {
                  ref: "ZentButton",
                  id: "ZentButtonInstance04",
                  props: {
                    children: { type: "literal", syntaxType: "string", expression: "BUTTON03" },
                    type: { type: "literal", syntaxType: "string", expression: "danger" },
                  },
                },
              ],
            },
          ],
        },
        {
          ref: "GridLayout",
          id: "GridLayoutChild02",
          input: {
            basic: {
              background: { type: "literal", expression: "#323233" },
              borderColor: {
                type: "literal",
                expression: [
                  ["all", "#ffffff"],
                  ["bottom", "#fea588"],
                ],
              },
              borderWidth: { type: "literal", expression: [["all", "4px"]] },
              borderStyle: {
                type: "literal",
                expression: [
                  ["all", "hidden"],
                  ["bottom", "solid"],
                ],
              },
            },
          },
        },
        {
          ref: "GridLayout",
          id: "GridLayoutChild03",
          input: {
            basic: { background: { type: "literal", expression: "rgb(254, 38, 76)" } },
          },
        },
        {
          ref: "GridLayout",
          id: "GridLayoutChild04",
          input: {
            basic: { background: { type: "literal", expression: "rgb(54, 158, 106)" } },
          },
          children: [
            {
              ref: "ZentButton",
              id: "ZentButtonInstance01",
              props: {
                loading: { type: "state", expression: "objectState.b" },
                children: { type: "state", expression: "buttonName" },
                size: { type: "literal", syntaxType: "string", expression: "large" },
                type: { type: "literal", syntaxType: "string", expression: "danger" },
              },
            },
          ],
        },
      ],
      attach: {
        rowStart: {
          type: "childRefs",
          expression: [
            { id: "GridLayoutChild01", value: 1 },
            { id: "GridLayoutChild02", value: 1 },
            { id: "GridLayoutChild03", value: 2 },
            { id: "GridLayoutChild04", value: 2 },
          ],
        },
        columnStart: {
          type: "childRefs",
          expression: [
            { id: "GridLayoutChild01", value: 1 },
            { id: "GridLayoutChild02", value: 2 },
            { id: "GridLayoutChild03", value: 1 },
            { id: "GridLayoutChild04", value: 3 },
          ],
        },
        rowSpan: {
          type: "childRefs",
          expression: [
            { id: "GridLayoutChild01", value: 1 },
            { id: "GridLayoutChild02", value: 1 },
            { id: "GridLayoutChild03", value: 1 },
            { id: "GridLayoutChild04", value: 1 },
          ],
        },
        columnSpan: {
          type: "childRefs",
          expression: [
            { id: "GridLayoutChild01", value: 1 },
            { id: "GridLayoutChild02", value: 2 },
            { id: "GridLayoutChild03", value: 2 },
            { id: "GridLayoutChild04", value: 1 },
          ],
        },
      },
    },
  };
}
