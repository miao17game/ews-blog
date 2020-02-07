import yamljs from "js-yaml";
import fs from "fs-extra";
import path from "path";
import { merge } from "lodash";

export async function readYamlFile(pathname: string) {
  if (!pathname.endsWith(".yaml") && !pathname.endsWith(".yml")) {
    return {};
  }
  try {
    const file = await fs.readFile(pathname, { encoding: "utf8" });
    return yamljs.safeLoad(file);
  } catch (_) {
    console.log(_);
    return {};
  }
}

export async function deepExtends(pathname: string) {
  const json = await readYamlFile(pathname);
  if ("extends" in json && typeof json["extends"] === "string") {
    const parentPath = path.resolve(path.dirname(pathname), ...json["extends"].split("/"));
    delete json["extends"];
    const final = merge({}, await deepExtends(parentPath), json);
    return final;
  }
  return json;
}

export async function resolveYamlFile(pathname: string) {
  return deepExtends(pathname);
}
