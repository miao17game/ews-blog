import { configs as defaultConfigs, merge } from "./config";

export const configs = merge(defaultConfigs, {
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
  },
});
