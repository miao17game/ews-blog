type PartialAll<T> = {
  [key in keyof T]?: PartialAll<T[key]>;
};

export interface IPartRule {
  uri: string;
  token: string;
  type: "render" | "redirect";
}

export interface IConfigs {
  portal: IPartRule;
  site: IPartRule;
  api: IPartRule;
}

export function merge(def: IConfigs, confs: PartialAll<IConfigs>): IConfigs {
  return {
    portal: {
      ...def.portal,
      ...confs.portal,
    },
    site: {
      ...def.site,
      ...confs.site,
    },
    api: {
      ...def.api,
      ...confs.api,
    },
  };
}

export const configs: IConfigs = {
  portal: {
    uri: "index",
    token: "portal",
    type: "render",
  },
  site: {
    uri: "site",
    token: "site",
    type: "render",
  },
  api: {
    uri: "api",
    token: "api",
    type: "redirect",
  },
};
