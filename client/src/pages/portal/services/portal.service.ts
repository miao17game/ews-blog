import { Injectable } from "@angular/core";

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

@Injectable()
export class PortalService {
  private isCollapsed = false;

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
          name: "Settings",
          link: "/portal/settings",
          selected: false,
        },
      ],
    },
  ];

  public get menuCollapsed() {
    return this.isCollapsed;
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
