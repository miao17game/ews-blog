import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Project } from "@stackblitz/sdk/typings/interfaces";
import SDK from "@stackblitz/sdk";
import ts from "typescript";

@Component({
  selector: "app-portal-preview",
  templateUrl: "./preview.html",
})
export class PortalPreviewComponent implements OnInit, AfterViewInit {
  @ViewChild("previewHost", { static: false }) previewHost: ElementRef;

  public showButton = false;
  private project: Project = {
    files: {
      "public/index.html": `<div id="app"></div>`,
      "src/index.tsx": createSourceCode(),
      "src/index.js": ts.transpileModule(createSourceCode(), {
        compilerOptions: {
          jsx: ts.JsxEmit.React,
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.ES2015,
        },
      }).outputText,
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
  };

  ngOnInit() {
    console.log(SDK);
  }

  ngAfterViewInit() {
    console.log(this.previewHost);
    this.showButton = true;
  }

  onStart() {
    SDK.embedProject(this.previewHost.nativeElement, this.project, {
      hideExplorer: false,
      hideDevTools: false,
      hideNavigation: true,
      forceEmbedLayout: true,
      height: "720px",
    });
    // Get the VM of the embedded instance
    // .then(vm => {
    //   // Wait 2 seconds...
    //   setTimeout(() => {
    //     // Then update the VM's file system :)
    //     vm.applyFsDiff({
    //       create: {
    //         "index.html": `<h1>This was updated programmatically!</h1>`,
    //       },
    //       destroy: ["randomFile.ts"],
    //     });
    //   }, 2000);
    // });
  }
}

function createSourceCode() {
  return `
  import React from "react";
  import ReactDOM from "react-dom";
  import { Button, IButtonProps, IButtonType } from "zent";
  import { useState } from "react";
  import "zent/css/base.css";
  function ZentBtnDemoComponent(props: IButtonProps) {
    return (
      <Button
        type={props.type || "default"}
        size={props.size || "medium"}
        htmlType={props.htmlType || "button"}
        block={props.block || false}
        disabled={props.disabled || false}
        loading={props.loading || false}
        outline={props.outline || false}
        bordered={props.bordered || true}
        href={props.href}
        target={props.target || ""}
        download={props.download}
        onClick={props.onClick}
        key="ZentBtnDemoComponent"
      >
        {props.children}
      </Button>
    );
  }
  function CssGridPageDemoRoot(props: any) {
    const [btn01Text, setBtn01text] = useState("10002");
    const [zentBtnLoading, setZentbtnloading] = useState(true);
    const [zentBtnType, setZentbtntype] = useState<IButtonType>("danger");
    const [zentBtn02Content, setZentbtn02content] = useState("BUTTON02");
    const [objectState, setObjectstate] = useState<any>({
      id: "xxx",
      name: "yyy"
    });
    const [arrayState, setArraystate] = useState<any[]>([
      {
        id: "xxx",
        name: "yyy"
      },
      {
        id: "zzz",
        name: "aaa"
      }
    ]);
    return (
      <div
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(1, 1fr 2fr)",
          gridRowGap: "0px",
          gridColumnGap: "0px"
        }}
        key="CssGridPageDemoRoot"
      >
        <ZentBtnDemoComponent
          loading={zentBtnLoading}
          children={"BUTTON01"}
          size={"large"}
          type={zentBtnType}
          key="ZentBtnDemoCompRef01"
        ></ZentBtnDemoComponent>
        <ZentBtnDemoComponent
          loading={false}
          children={zentBtn02Content}
          size={"large"}
          type={"primary"}
          key="ZentBtnDemoCompRef02"
          onClick={(e: any) => setZentbtn02content(String(new Date().getTime()))}
        ></ZentBtnDemoComponent>
      </div>
    );
  }
  ReactDOM.render(<CssGridPageDemoRoot></CssGridPageDemoRoot>, document.getElementById("app"));`;
}
