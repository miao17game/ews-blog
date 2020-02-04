import { Component, OnDestroy, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { Builder } from "../../services/builder.service";

@Component({
  selector: "app-portal-entity-edit",
  templateUrl: "./entity-edit.html",
})
export class EntityEditComponent implements OnInit, OnDestroy {
  @Input()
  model: any;

  constructor(private builder: Builder) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
