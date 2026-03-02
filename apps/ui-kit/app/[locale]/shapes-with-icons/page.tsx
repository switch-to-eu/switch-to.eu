"use client";

import {
  Brain,
  Globe,
  Mail,
  MessageSquare,
  MapPin,
  Search,
  Users,
  FolderOpen,
  Heart,
  Star,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const allShapes = [
  "arch",
  "asterisk",
  "blob",
  "bumpy-cloud",
  "circle",
  "cloud",
  "clover",
  "clover-3",
  "coral",
  "cross",
  "daisy",
  "diamond-4",
  "fleur",
  "flower",
  "heart",
  "hourglass",
  "peanut",
  "pebble",
  "petal",
  "pill",
  "pin",
  "puddle",
  "scallop",
  "spark",
  "speech",
  "splat",
  "squiggle",
  "star",
  "starburst",
  "sunburst",
  "swirl",
  "ticket",
  "triangle",
  "tulip",
  "wave",
  "wide-heart",
];

const previewIcons: { name: string; Icon: LucideIcon }[] = [
  { name: "Brain", Icon: Brain },
  { name: "Globe", Icon: Globe },
  { name: "Mail", Icon: Mail },
  { name: "MessageSquare", Icon: MessageSquare },
  { name: "MapPin", Icon: MapPin },
  { name: "Search", Icon: Search },
  { name: "Users", Icon: Users },
  { name: "FolderOpen", Icon: FolderOpen },
  { name: "Heart", Icon: Heart },
  { name: "Star", Icon: Star },
  { name: "Shield", Icon: Shield },
  { name: "Zap", Icon: Zap },
];

const sizes = [
  { label: "40px (mega menu)", size: 40, iconSize: 18 },
  { label: "48px", size: 48, iconSize: 22 },
  { label: "56px", size: 56, iconSize: 24 },
  { label: "64px", size: 64, iconSize: 28 },
];

export default function ShapesWithIconsPage() {
  const [activeIcon, setActiveIcon] = useState(0);
  const [activeSize, setActiveSize] = useState(0);

  const { Icon } = previewIcons[activeIcon]!;
  const { size, iconSize, label } = sizes[activeSize]!;

  return (
    <div>
      <h1 className="text-4xl mb-2">Shapes with Icons</h1>
      <p className="text-muted-foreground mb-8">
        All 36 static SVG shapes with an icon overlay, using the same CSS mask
        technique as the mega dropdown. Useful for checking which shapes work
        well at different sizes.
      </p>

      {/* Controls */}
      <section className="mb-8 rounded-xl border border-border p-5 bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Preview icon</h3>
            <div className="flex flex-wrap gap-1.5">
              {previewIcons.map((item, i) => (
                <button
                  key={item.name}
                  onClick={() => setActiveIcon(i)}
                  className={`rounded-lg p-2 transition-colors ${
                    i === activeIcon
                      ? "bg-brand-navy text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  title={item.name}
                >
                  <item.Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Size</h3>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveSize(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === activeSize
                      ? "bg-brand-navy text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shape grid */}
      <section>
        <p className="text-sm text-muted-foreground mb-4">
          Showing <strong>{previewIcons[activeIcon]!.name}</strong> at{" "}
          <strong>{label}</strong>. Hover to see the active state.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {allShapes.map((name) => (
            <div
              key={name}
              className="group/card flex flex-col items-center gap-2 rounded-lg border border-border p-3 bg-muted/20 hover:bg-white hover:border-primary/30 transition-colors"
            >
              <div
                className="relative flex items-center justify-center"
                style={{ width: size, height: size }}
              >
                <div
                  className="absolute inset-0 bg-brand-navy/10 transition-colors group-hover/card:bg-brand-yellow"
                  style={{
                    maskImage: `url(/images/shapes/${name}.svg)`,
                    WebkitMaskImage: `url(/images/shapes/${name}.svg)`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
                <Icon
                  className="relative text-brand-navy transition-colors group-hover/card:text-brand-green"
                  style={{ width: iconSize, height: iconSize }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono text-center leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
