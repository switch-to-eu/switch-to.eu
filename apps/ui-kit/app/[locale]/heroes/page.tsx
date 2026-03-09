"use client";

import { Hero, HERO_PRESETS } from "@switch-to-eu/blocks/components/hero";
import type { HeroColors } from "@switch-to-eu/blocks/components/hero";
import { useState } from "react";

const presetNames = Object.keys(HERO_PRESETS);

const fonts = [
  { label: "Bonbance", value: "var(--font-bonbance)" },
  { label: "Anton", value: "var(--font-anton)" },
  { label: "HankenGrotesk", value: "var(--font-hanken-grotesk)" },
];

const demoButtons = [
  { label: "Primary Action", href: "#", variant: "solid" as const },
  { label: "Secondary", href: "#", variant: "outline" as const },
];

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground w-28 shrink-0 font-mono">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-mono border border-border rounded px-2 py-1 w-full bg-background"
      />
    </div>
  );
}

function CustomHeroEditor() {
  const [colors, setColors] = useState<HeroColors>(HERO_PRESETS.navy);
  const [font, setFont] = useState(fonts[0]!.value);
  const [activePreset, setActivePreset] = useState("navy");

  const updateColor = (key: keyof HeroColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setActivePreset("");
  };

  const loadPreset = (name: string) => {
    setColors(HERO_PRESETS[name as keyof typeof HERO_PRESETS]!);
    setActivePreset(name);
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl mb-4">Custom Hero Editor</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Edit colors live. Pick a preset to start, then tweak individual values.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {presetNames.map((name) => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activePreset === name
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {fonts.map((f) => (
          <button
            key={f.value}
            onClick={() => setFont(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              font === f.value
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 p-4 rounded-xl border border-border bg-muted/20">
        <ColorInput label="bg" value={colors.bg} onChange={(v) => updateColor("bg", v)} />
        <ColorInput label="title" value={colors.title} onChange={(v) => updateColor("title", v)} />
        <ColorInput label="subtitle" value={colors.subtitle} onChange={(v) => updateColor("subtitle", v)} />
        <ColorInput label="blob1" value={colors.blob1} onChange={(v) => updateColor("blob1", v)} />
        <ColorInput label="blob2" value={colors.blob2} onChange={(v) => updateColor("blob2", v)} />
        <ColorInput label="blob3" value={colors.blob3} onChange={(v) => updateColor("blob3", v)} />
        <ColorInput label="buttonBg" value={colors.buttonBg} onChange={(v) => updateColor("buttonBg", v)} />
        <ColorInput label="buttonText" value={colors.buttonText} onChange={(v) => updateColor("buttonText", v)} />
        <ColorInput label="outlineColor" value={colors.buttonOutlineColor} onChange={(v) => updateColor("buttonOutlineColor", v)} />
        <ColorInput label="outlineHoverBg" value={colors.buttonOutlineHoverBg} onChange={(v) => updateColor("buttonOutlineHoverBg", v)} />
        <ColorInput label="outlineHoverText" value={colors.buttonOutlineHoverText} onChange={(v) => updateColor("buttonOutlineHoverText", v)} />
      </div>

      <Hero
        title="Switch to European Alternatives"
        subtitle="Discover privacy-respecting services built in the EU"
        colors={colors}
        titleFont={font}
        buttons={demoButtons}
      />
    </section>
  );
}

export default function HeroesPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Heroes</h1>
      <p className="text-muted-foreground mb-8">
        Hero component presets from{" "}
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          @switch-to-eu/blocks/components/hero
        </code>
        . Each preset uses a different brand color scheme.
      </p>

      <CustomHeroEditor />

      <h2 className="text-2xl mb-6">All Presets</h2>

      <div className="space-y-8">
        {presetNames.map((name) => (
          <div key={name}>
            <h3 className="text-lg font-medium mb-3 font-mono">{name}</h3>
            <Hero
              title="Switch to European Alternatives"
              subtitle="Discover privacy-respecting services built in the EU"
              colors={HERO_PRESETS[name as keyof typeof HERO_PRESETS]!}
              buttons={demoButtons}
            />
          </div>
        ))}
      </div>

      <h2 className="text-2xl mt-12 mb-6">Font Comparison</h2>
      <div className="space-y-8">
        {fonts.map((f) => (
          <div key={f.value}>
            <h3 className="text-lg font-medium mb-3 font-mono">{f.label}</h3>
            <Hero
              title="Switch to European Alternatives"
              subtitle="Discover privacy-respecting services built in the EU"
              colors={HERO_PRESETS.navy}
              titleFont={f.value}
              buttons={demoButtons}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
