import { IConfigs } from "./config";

export const configs: IConfigs = {
  portal: {
    uri: "http://localhost:4200/portal",
    type: "redirect",
  },
  site: {
    uri: "http://localhost:4200/site",
    type: "redirect",
  },
  api: {
    uri: "http://localhost:4200/api",
    type: "redirect",
  },
};
