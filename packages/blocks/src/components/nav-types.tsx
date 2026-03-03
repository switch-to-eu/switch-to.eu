export type MainNavItem = {
  title: string;
  href?: string;
  isExternal?: boolean;
  dropdown?: "simple" | "mega";
  mobileOnly?: boolean;
  children?: SubNavItem[];
};

export interface SubNavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  isExternal?: boolean;
  disabled?: boolean;
}
