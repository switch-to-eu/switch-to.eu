import { Link } from "@switch-to-eu/i18n/navigation";
import { Palette, Type, Component, LayoutGrid } from "lucide-react";

const sections = [
  {
    title: "Colors",
    description: "Theme color palette — primary, semantic, feature, pop, and chart colors.",
    href: "/colors",
    icon: Palette,
  },
  {
    title: "Typography",
    description: "Font families, heading scale, body text, bold, and italic variants.",
    href: "/typography",
    icon: Type,
  },
  {
    title: "Components",
    description: "All shared UI components — buttons, cards, inputs, badges, dialogs, and more.",
    href: "/components",
    icon: Component,
  },
  {
    title: "Blocks",
    description: "Page-level shared components — Header, Footer, LanguageSelector, BrandIndicator.",
    href: "/blocks",
    icon: LayoutGrid,
  },
];

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Design System</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Internal reference for the Switch-to.eu design system. Browse colors,
        typography, shared UI components, and page-level blocks.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border border-border p-6 hover:border-primary/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl group-hover:text-primary transition-colors">{section.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
