import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Project } from "@stackblitz/sdk/typings/interfaces";
import SDK from "@stackblitz/sdk";

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
      "src/index.js": createSourceCode(),
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
      hideExplorer: true,
      hideDevTools: true,
      hideNavigation: true,
      forceEmbedLayout: true,
      height: "750px",
    }).then(vm => {
      // TODO
      console.log(vm);
    });
  }
}

function createSourceCode() {
  return `
import React from "react";
import ReactDOM from "react-dom";
import Button from "zent/es/button";
import "zent/css/button.css";
import { IButtonProps } from "zent";
import { IButtonType } from "zent";
import { useState } from "react";
import "zent/css/base.css";
function ZentBtnDemoComponent(props) {
    var _a;
    return (React.createElement(Button, { type: props.type || "default", size: props.size || "medium", htmlType: props.htmlType || "button", block: props.block || false, disabled: props.disabled || false, loading: props.loading || false, outline: props.outline || false, bordered: (_a = props.bordered, (_a !== null && _a !== void 0 ? _a : true)), href: props.href, target: props.target || "", download: props.download, onClick: props.onClick, key: "ZentBtnDemoComponent" }, props.children));
}
function CssGridPageDemoRoot(props) {
    const [btn01Text, setBtn01text] = useState("10002");
    const [zentBtnLoading, setZentbtnloading] = useState(true);
    const [zentBtnType, setZentbtntype] = useState("danger");
    const [zentBtn02Content, setZentbtn02content] = useState("BUTTON02");
    const [objectState, setObjectstate] = useState({
        id: "xxx",
        name: "yyy"
    });
    const [arrayState, setArraystate] = useState([
        {
            id: "xxx",
            name: "yyy"
        },
        {
            id: "zzz",
            name: "aaa"
        }
    ]);
    return (React.createElement("div", { style: {
            height: "100vh",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(1, 1fr 2fr)",
            gridRowGap: "0px",
            gridColumnGap: "0px"
        }, key: "CssGridPageDemoRoot" },
        React.createElement(ZentBtnDemoComponent, { loading: zentBtnLoading, children: "BUTTON01", size: "large", type: zentBtnType, key: "ZentBtnDemoCompRef01" }),
        React.createElement(ZentBtnDemoComponent, { loading: false, children: zentBtn02Content, size: "large", type: "primary", key: "ZentBtnDemoCompRef02", onClick: (e) => setZentbtn02content(String(new Date().getTime())) })));
}
ReactDOM.render(React.createElement(CssGridPageDemoRoot, null), document.getElementById("app"));
`;
}
