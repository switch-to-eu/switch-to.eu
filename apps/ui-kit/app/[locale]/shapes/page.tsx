"use client";

import {
  BlobShape,
  PebbleShape,
  CircleShape,
  DiamondShape,
  HeartShape,
  HalfCircleShape,
  PuddleShape,
} from "@switch-to-eu/ui/components/hero-shapes";
import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const shapes = [
  { name: "BlobShape", Component: BlobShape, color: "#FBA616" },
  { name: "PebbleShape", Component: PebbleShape, color: "#0D492C" },
  { name: "CircleShape", Component: CircleShape, color: "#9BCDD0" },
  { name: "DiamondShape", Component: DiamondShape, color: "#E22028" },
  { name: "HeartShape", Component: HeartShape, color: "#E282B4" },
  { name: "HalfCircleShape", Component: HalfCircleShape, color: "#1E42B0" },
  { name: "PuddleShape", Component: PuddleShape, color: "#E45229" },
];

export default function ShapesPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Shapes</h1>
      <p className="text-muted-foreground mb-8">
        Animated SVG shapes, floating animations, and CSS filter utilities from the design system.
      </p>

      {/* Hero Shapes */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Hero Shapes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          7 animated SVG shapes from{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
            @switch-to-eu/ui/components/hero-shapes
          </code>
          . Each shape floats with a unique animation on mount.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {shapes.map(({ name, Component, color }) => (
            <div key={name} className="flex flex-col items-center gap-3">
              <div className="w-32 h-32">
                <Component color={color} delay={0} />
              </div>
              <div className="text-xs font-medium">{name}</div>
              <div className="text-xs text-muted-foreground font-mono">{color}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shape Float Animation */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Shape Float Animation</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The <code className="text-sm bg-muted px-1.5 py-0.5 rounded">animate-shape-float</code>{" "}
          CSS class applies a gentle floating animation. Customize with different{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">animation-duration</code> values.
        </p>
        <div className="rounded-xl border border-border p-8 bg-muted/30 flex items-center justify-center gap-12 min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="animate-shape-float w-16 h-16 rounded-full bg-brand-yellow"
              style={{ animationDuration: "8s" }}
            />
            <span className="text-xs text-muted-foreground font-mono">8s</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div
              className="animate-shape-float w-20 h-20 rounded-2xl bg-brand-sky"
              style={{ animationDuration: "12s", animationDelay: "1s" }}
            />
            <span className="text-xs text-muted-foreground font-mono">12s, 1s delay</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div
              className="animate-shape-float w-14 h-14 bg-brand-pink"
              style={{
                animationDuration: "16s",
                animationDelay: "2s",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <span className="text-xs text-muted-foreground font-mono">16s, 2s delay</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div
              className="animate-shape-float w-24 h-12 rounded-full bg-brand-sage"
              style={{ animationDuration: "20s", animationDelay: "0.5s" }}
            />
            <span className="text-xs text-muted-foreground font-mono">20s, 0.5s delay</span>
          </div>
        </div>
      </section>

      {/* CSS Filters */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">CSS Filters</h2>
        <p className="text-sm text-muted-foreground mb-4">
          CSS filter strings from{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
            @switch-to-eu/ui/lib/shape-filters
          </code>{" "}
          to recolor SVG images via the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">filter</code> property.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Original */}
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="w-20 h-20">
              <CircleShape color="#ff6b6b" delay={0} />
            </div>
            <span className="text-xs font-medium">Original</span>
            <span className="text-xs text-muted-foreground">No filter applied</span>
          </div>

          {/* Brand Green */}
          <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-3">
            <div className="w-20 h-20" style={{ filter: FILTER_BRAND_GREEN }}>
              <CircleShape color="#ff6b6b" delay={0} />
            </div>
            <span className="text-xs font-medium">FILTER_BRAND_GREEN</span>
            <span className="text-xs text-muted-foreground font-mono break-all text-center leading-relaxed">
              {FILTER_BRAND_GREEN}
            </span>
          </div>

          {/* White */}
          <div className="rounded-xl border border-border p-6 bg-brand-green flex flex-col items-center gap-3">
            <div className="w-20 h-20" style={{ filter: FILTER_WHITE }}>
              <CircleShape color="#ff6b6b" delay={0} />
            </div>
            <span className="text-xs font-medium text-white">FILTER_WHITE</span>
            <span className="text-xs text-white/70 font-mono break-all text-center leading-relaxed">
              {FILTER_WHITE}
            </span>
          </div>
        </div>
      </section>

      {/* Static SVG Shapes */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Static SVG Shapes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          36 static SVG files from{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
            public/images/shapes/
          </code>{" "}
          that apps can copy as needed.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {[
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
          ].map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 bg-muted/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/shapes/${name}.svg`}
                alt={name}
                className="w-12 h-12 object-contain"
              />
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
