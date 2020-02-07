import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "jsonStringify",
  pure: false,
})
export class JsonStringifyPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return JSON.stringify(value);
  }
}
