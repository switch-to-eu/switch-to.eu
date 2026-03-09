"use client";

import { useState } from "react";
import {
  BRAND_COLORS,
  BRAND_COLOR_KEYS,
  TOOL_SCHEMES,
  type BrandColorKey,
  type ToolColorScheme,
} from "@switch-to-eu/ui/lib/tool-colors";

/** Light colors that need dark text for contrast */
const LIGHT_COLORS: Set<BrandColorKey> = new Set(["cream", "yellow", "sky", "sage", "pink"]);

function MiniCard({ scheme, label }: { scheme: ToolColorScheme; label: string }) {
  const primary = BRAND_COLORS[scheme.primary];
  const accent = BRAND_COLORS[scheme.accent];
  const surface = BRAND_COLORS[scheme.surface];
  const primaryTextColor = LIGHT_COLORS.has(scheme.primary) ? "#1a1a1a" : "#ffffff";
  const accentTextColor = LIGHT_COLORS.has(scheme.accent) ? "#1a1a1a" : "#ffffff";

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Header bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: primary.value }}
      >
        <span className="text-sm font-bold truncate" style={{ color: primaryTextColor }}>{label}</span>
        <div
          className="h-5 w-5 rounded-full border-2"
          style={{ backgroundColor: accent.value, borderColor: `${primaryTextColor}30` }}
        />
      </div>

      {/* Body with surface tint */}
      <div
        className="p-4 space-y-3"
        style={{ backgroundColor: `color-mix(in srgb, ${surface.value} 10%, white)` }}
      >
        {/* Icon highlight row */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: accent.value, color: accentTextColor }}
          >
            Aa
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-2 rounded-full bg-foreground/10 w-3/4" />
            <div className="h-2 rounded-full bg-foreground/10 w-1/2" />
          </div>
        </div>

        {/* Gradient bar */}
        <div
          className="h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${primary.value}, ${accent.value})`,
          }}
        />

        {/* Button */}
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium w-full"
          style={{ backgroundColor: primary.value, color: primaryTextColor }}
        >
          Button
        </button>
      </div>

      {/* Label */}
      <div className="px-4 py-2 border-t border-border bg-card">
        <p className="text-xs font-mono text-muted-foreground">
          {scheme.primary} + {scheme.accent} + {scheme.surface}
        </p>
      </div>
    </div>
  );
}

export default function ToolColorsPage() {
  const [filterPrimary, setFilterPrimary] = useState<BrandColorKey | "all">("all");
  const [filterAccent, setFilterAccent] = useState<BrandColorKey | "all">("all");

  // Generate all combos (excluding same primary+accent)
  const allCombos: { scheme: ToolColorScheme; label: string }[] = [];
  for (const primary of BRAND_COLOR_KEYS) {
    for (const accent of BRAND_COLOR_KEYS) {
      if (primary === accent) continue;
      // Surface defaults to accent for browsing
      allCombos.push({
        scheme: { primary, accent, surface: accent },
        label: `${BRAND_COLORS[primary].name} + ${BRAND_COLORS[accent].name}`,
      });
    }
  }

  const filtered = allCombos.filter(({ scheme }) => {
    if (filterPrimary !== "all" && scheme.primary !== filterPrimary) return false;
    if (filterAccent !== "all" && scheme.accent !== filterAccent) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-4xl mb-2">Tool Color Schemes</h1>
      <p className="text-muted-foreground mb-8">
        Browse all brand-color combinations for tool apps. Each card shows primary (header/buttons),
        accent (icons/highlights), and surface (background tint) colors.
      </p>

      {/* Active schemes */}
      <section className="mb-10">
        <h2 className="text-2xl mb-4">Active Schemes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Currently assigned tool color schemes from{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">TOOL_SCHEMES</code>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(TOOL_SCHEMES).map(([name, scheme]) => (
            <MiniCard key={name} scheme={scheme} label={name} />
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6">
        <h2 className="text-2xl mb-4">All Combinations</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Primary:</label>
            <select
              value={filterPrimary}
              onChange={(e) => setFilterPrimary(e.target.value as BrandColorKey | "all")}
              className="text-sm border border-border rounded-lg px-2 py-1"
            >
              <option value="all">All</option>
              {BRAND_COLOR_KEYS.map((key) => (
                <option key={key} value={key}>{BRAND_COLORS[key].name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Accent:</label>
            <select
              value={filterAccent}
              onChange={(e) => setFilterAccent(e.target.value as BrandColorKey | "all")}
              className="text-sm border border-border rounded-lg px-2 py-1"
            >
              <option value="all">All</option>
              {BRAND_COLOR_KEYS.map((key) => (
                <option key={key} value={key}>{BRAND_COLORS[key].name}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-muted-foreground self-center">
            {filtered.length} combinations
          </span>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(({ scheme, label }) => (
          <MiniCard key={label} scheme={scheme} label={label} />
        ))}
      </div>
    </div>
  );
}
