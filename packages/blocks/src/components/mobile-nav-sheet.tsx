"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@switch-to-eu/ui/components/sheet";
import { usePathname } from "@switch-to-eu/i18n/navigation";

interface MobileNavSheetProps {
  trigger: ReactNode;
  children: ReactNode;
  colorClassName?: string;
}

export function MobileNavSheet({ trigger, children, colorClassName = "text-tool-primary" }: MobileNavSheetProps) {
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
        {trigger}
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
