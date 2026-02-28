import { getNavItems } from "./nav-items";
import { NavMenuClient } from "./NavMenuClient";

interface MainNavProps {
  className?: string;
}

export async function MainNav({ className }: MainNavProps) {
  const navItems = await getNavItems();

  return (
    <NavMenuClient
      navItems={navItems.filter((item) => !item.mobileOnly)}
      className={className}
    />
  );
}
