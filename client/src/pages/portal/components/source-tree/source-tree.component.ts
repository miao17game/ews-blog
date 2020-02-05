import { Component, OnInit, OnDestroy, OnChanges, Input } from "@angular/core";
import { ICompileContext } from "../../services/builder.service";

@Component({
  selector: "app-portal-source-tree",
  templateUrl: "./source-tree.html",
})
export class SourceTreeComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  context: ICompileContext;

  ngOnInit(): void {}
  ngOnDestroy(): void {}
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {}
}
