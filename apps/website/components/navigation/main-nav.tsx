import { getNavItems } from "./nav-items";
import { MainNavClient } from "./MainNavClient";

interface MainNavProps {
  className?: string;
}

export async function MainNav({ className }: MainNavProps) {
  const navItems = await getNavItems();

  return (
    <MainNavClient
      navItems={navItems.filter((item) => !item.mobileOnly)}
      className={className}
    />
  );
}
