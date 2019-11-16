export interface IPartRule {
  uri: string;
  type: "render" | "redirect";
}

export interface IConfigs {
  portal: IPartRule;
  site: IPartRule;
  api: IPartRule;
}

export const configs: IConfigs = {
  portal: {
    uri: "index",
    type: "render",
  },
  site: {
    uri: "site",
    type: "render",
  },
  api: {
    uri: "/api",
    type: "redirect",
  },
};
