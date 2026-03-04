"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@switch-to-eu/ui/components/sheet";
import { usePathname } from "@switch-to-eu/i18n/navigation";

interface MobileNavSheetProps {
  children: ReactNode;
  colorClassName?: string;
  menuLabel?: string;
}

export function MobileNavSheet({ children, colorClassName = "text-tool-primary", menuLabel = "Menu" }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close sheet on navigation (pathname change)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-tool-primary-foreground hover:bg-tool-primary-foreground/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{menuLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={`flex flex-col gap-0 p-0 overflow-y-auto max-h-screen bg-white border-l border-current/10 w-[85%] sm:max-w-sm ${colorClassName}`}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
