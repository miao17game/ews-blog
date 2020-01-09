import SDK from "@stackblitz/sdk";
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { NzMessageService, NzTabChangeEvent } from "ng-zorro-antd";
import { Project } from "@stackblitz/sdk/typings/interfaces";
import { VM } from "@stackblitz/sdk/typings/VM";
import { PortalService } from "../services/portal.service";

@Component({
  selector: "app-portal-preview",
  templateUrl: "./preview.html",
})
export class PortalPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild("previewHost", { static: false }) previewHost: ElementRef;

  public showButton = false;
  public pageConfigs = createDefaultConfigs();

  private vm!: VM;
  private project: Project = {
    files: {
      "public/index.html": `<div id="app"></div>`,
      "src/index.js": "",
    },
    dependencies: {
      "@types/react": "^16.9.7",
      zent: "^7.1.0",
      rxjs: "^6.5.4",
      react: "^16.12.0",
      "react-dom": "^16.12.0",
    },
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

  constructor(private portal: PortalService, private message: NzMessageService) {}

  ngOnInit() {
    console.log(SDK);
  }

  ngAfterViewInit() {
    console.log(this.previewHost);
    this.showButton = true;
  }

  async onTabChange(e: NzTabChangeEvent) {
    if (e.index === 1) {
      try {
        const configs = JSON.parse(this.pageConfigs);
        const result = await this.portal.createSource("yaml", configs);
        if (this.vm) {
          this.vm.applyFsDiff({
            create: {
              "src/index.js": result.data.source,
            },
            destroy: [],
          });
        } else {
          this.project.files["src/index.js"] = result.data.source;
          this.onStart();
        }
      } catch (error) {
        this.message.error(JSON.stringify(error.toString()));
      }
    }
  }

  onStart() {
    SDK.embedProject(this.previewHost.nativeElement, this.project, {
      hideExplorer: true,
      hideDevTools: true,
      hideNavigation: true,
      forceEmbedLayout: true,
      height: "750px",
      view: "preview",
    }).then(vm => {
      // TODO
      this.vm = vm;
      console.log(vm);
    });
  }
}

function createDefaultConfigs() {
  return `{
    "components": [
      {
        "module": "ambjs-common-component-module",
        "name": "zent-button",
        "id": "ZentBtnDemoComponent"
      }
    ],
    "page": {
      "module": "ambjs-common-component-module",
      "name": "css-grid-container",
      "id": "CssGridPageDemoRoot",
      "children": [
        {
          "ref": "ZentBtnDemoComponent",
          "id": "ZentBtnDemoCompRef01",
          "props": {
            "loading": {
              "type": "state",
              "expression": "zentBtnLoading"
            },
            "children": {
              "type": "literal",
              "syntaxType": "string",
              "expression": "BUTTON01"
            },
            "size": {
              "type": "literal",
              "syntaxType": "string",
              "expression": "large"
            },
            "type": {
              "type": "state",
              "expression": "zentBtnType"
            }
          }
        },
        {
          "ref": "ZentBtnDemoComponent",
          "id": "ZentBtnDemoCompRef02",
          "props": {
            "loading": {
              "type": "literal",
              "syntaxType": "boolean",
              "expression": false
            },
            "children": {
              "type": "state",
              "expression": "zentBtn02Content"
            },
            "size": {
              "type": "literal",
              "syntaxType": "string",
              "expression": "large"
            },
            "type": {
              "type": "literal",
              "syntaxType": "string",
              "expression": "primary"
            }
          }
        }
      ],
      "directives": [
        {
          "module": "ambjs-common-directive-module",
          "name": "zent-base-css",
          "id": "ZentBaseCssDemoDirective"
        },
        {
          "module": "ambjs-common-directive-module",
          "name": "custom-click",
          "id": "CustomClickDemoDirective",
          "input": {
            "host": {
              "type": "literal",
              "expression": "ZentBtnDemoCompRef02"
            },
            "eventType": {
              "type": "literal",
              "expression": "setState"
            },
            "attrName": {
              "type": "literal",
              "expression": "onClick"
            },
            "targetName": {
              "type": "literal",
              "expression": "zentBtn02Content"
            },
            "expression": {
              "type": "literal",
              "expression": "e => new Date().getTime()"
            }
          }
        }
      ],
      "input": {
        "basic": {
          "useComponentState": {
            "type": "literal",
            "expression": true
          },
          "defaultComponentState": {
            "type": "literal",
            "expression": {
              "btn01Text": "10002",
              "zentBtnLoading": true,
              "zentBtnType": "danger",
              "zentBtn02Content": "BUTTON02"
            },
            "objectState": {
              "type": "literal",
              "expression": {
                "id": "xxx",
                "name": "yyy"
              }
            },
            "arrayState": {
              "type": "literal",
              "expression": [
                {
                  "id": "xxx",
                  "name": "yyy"
                },
                {
                  "id": "zzz",
                  "name": "aaa"
                }
              ]
            }
          }
        },
        "gridTemplateColumnsCount": {
          "type": "literal",
          "expression": 2
        },
        "gridTemplateRowsFrs": {
          "type": "literal",
          "expression": [
            1,
            2
          ]
        }
      },
      "attach": {
        "childRowStart": {
          "type": "childRefs",
          "expression": [
            {
              "id": "ZentBtnDemoCompRef01",
              "value": 1
            },
            {
              "id": "ZentBtnDemoCompRef02",
              "value": 2
            }
          ]
        },
        "childColumnStart": {
          "type": "childRefs",
          "expression": [
            {
              "id": "ZentBtnDemoCompRef01",
              "value": 1
            },
            {
              "id": "ZentBtnDemoCompRef02",
              "value": 2
            }
          ]
        }
      }
    }
  }`;
}
