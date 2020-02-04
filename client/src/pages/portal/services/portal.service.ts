import { Injectable } from "@angular/core";
import { HttpService } from "../../../services/http.service";

export interface IMenuItem {
  name: string;
  link: string;
  selected: boolean;
}

export interface IMenuGroup {
  name: string;
  icon: string;
  selected: boolean;
  items: IMenuItem[];
}

export interface IPreviewApiResult {
  code: number;
  data: {
    source: string;
    dependencies: Record<string, string>;
  };
}

@Injectable()
export class PortalService {
  public isCollapsed = false;

  public menulist: IMenuGroup[] = [
    {
      name: "Group01",
      icon: "user",
      selected: false,
      items: [
        {
          name: "Portal",
          link: "/portal",
          selected: false,
        },
        {
          name: "Preview",
          link: "/portal/preview",
          selected: false,
        },
        {
          name: "Settings",
          link: "/portal/settings",
          selected: false,
        },
      ],
    },
  ];

  public userInfos: any = { logined: false, name: "" };

  constructor(private readonly http: HttpService) {}

  public fetchTemplates() {
    this.http.get("templates");
  }

  public createSource(configs: any) {
    return this.http.post<IPreviewApiResult>("preview", { configs });
  }

  public async fetchUserInfos() {
    const userInfo: any = await this.http.get("user");
    if (userInfo.code === 0) {
      this.userInfos = { ...this.userInfos, ...userInfo.data };
    }
  }

  public toggleMenuCollapsed() {
    this.isCollapsed = !this.isCollapsed;
  }

  public setCurrentUrl(url: string) {
    this.menulist.forEach(group => {
      if (group.items.some(i => i.link === url)) {
        group.selected = true;
      } else {
        group.selected = false;
      }
    });
  }
}
