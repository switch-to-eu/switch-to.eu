import { BRAND_CARD_COLORS } from "@switch-to-eu/ui/lib/brand-palette";

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 w-full rounded-lg border border-border"
        style={{ backgroundColor: value }}
      />
      <div className="text-xs font-medium">{name}</div>
      <div className="text-xs text-muted-foreground font-mono">{value}</div>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: { name: string; value: string }[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {colors.map((color) => (
          <Swatch key={color.name} {...color} />
        ))}
      </div>
    </section>
  );
}

const coreColors = [
  { name: "background", value: "#fefbf9" },
  { name: "foreground", value: "#383838" },
  { name: "primary", value: "#1a3c5a" },
  { name: "primary-foreground", value: "#ffffff" },
  { name: "secondary", value: "#ffffff" },
  { name: "secondary-foreground", value: "#1a3c5a" },
  { name: "muted", value: "#f8f9fa" },
  { name: "muted-foreground", value: "#334155" },
  { name: "accent", value: "#ffffff" },
  { name: "accent-foreground", value: "#1a3c5a" },
  { name: "destructive", value: "#ff4a4a" },
  { name: "border", value: "#e5e7eb" },
  { name: "input", value: "#ffffff" },
  { name: "ring", value: "#1a3c5a" },
  { name: "card", value: "#ffffff" },
  { name: "card-foreground", value: "#1a3c5a" },
  { name: "popover", value: "#ffffff" },
  { name: "popover-foreground", value: "#1a3c5a" },
];

const brandColors = [
  { name: "brand-yellow", value: "#FBA616" },
  { name: "brand-green", value: "#0D492C" },
  { name: "brand-sky", value: "#9BCDD0" },
  { name: "brand-red", value: "#E22028" },
  { name: "brand-pink", value: "#E282B4" },
  { name: "brand-navy", value: "#1E42B0" },
  { name: "brand-sage", value: "#B0D8B0" },
  { name: "brand-orange", value: "#E45229" },
  { name: "brand-cream", value: "#fefbf9" },
];

const darkModeColors = [
  { name: "background", value: "#0f172a" },
  { name: "foreground", value: "#f8fafc" },
  { name: "card", value: "#1e293b" },
  { name: "card-foreground", value: "#f8fafc" },
  { name: "primary", value: "#64a5f6" },
  { name: "primary-foreground", value: "#0f172a" },
  { name: "secondary", value: "#1e293b" },
  { name: "muted", value: "#1e293b" },
  { name: "muted-foreground", value: "#94a3b8" },
  { name: "border", value: "rgba(255,255,255,0.1)" },
  { name: "ring", value: "#64a5f6" },
];

const chartColors = [
  { name: "chart-1", value: "#1b456b" },
  { name: "chart-2", value: "#76c5f6" },
  { name: "chart-3", value: "#c1e1b8" },
  { name: "chart-4", value: "#ff9d8a" },
  { name: "chart-5", value: "#5694b8" },
];

const sidebarColors = [
  { name: "sidebar", value: "#ffffff" },
  { name: "sidebar-foreground", value: "#1a3c5a" },
  { name: "sidebar-primary", value: "#1a3c5a" },
  { name: "sidebar-primary-fg", value: "#ffffff" },
  { name: "sidebar-accent", value: "#f8f9fa" },
  { name: "sidebar-accent-fg", value: "#1a3c5a" },
  { name: "sidebar-border", value: "#e5e7eb" },
  { name: "sidebar-ring", value: "#1a3c5a" },
];

const radiusTokens = [
  { name: "radius", value: "0.75rem (12px)" },
  { name: "radius-sm", value: "0.5rem (8px)" },
  { name: "radius-md", value: "0.625rem (10px)" },
  { name: "radius-lg", value: "0.75rem (12px)" },
  { name: "radius-xl", value: "1rem (16px)" },
];

export default function ColorsPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Colors</h1>
      <p className="text-muted-foreground mb-8">
        All CSS custom properties defined in the theme. Values shown are light mode defaults.
      </p>

      <ColorGroup title="Core" colors={coreColors} />
      <ColorGroup title="Brand Palette" colors={brandColors} />

      {/* Dark Mode Overrides */}
      <section className="mb-10">
        <h2 className="text-2xl mb-4">Dark Mode Overrides</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Token values that change under <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.dark</code> class.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {darkModeColors.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </section>

      {/* Brand Card Palette */}
      <section className="mb-10">
        <h2 className="text-2xl mb-4">Brand Card Palette</h2>
        <p className="text-sm text-muted-foreground mb-4">
          8-color card rotation from{" "}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">BRAND_CARD_COLORS</code>.
          Each card combines a background, text color, and button style.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BRAND_CARD_COLORS.map((scheme, i) => (
            <div
              key={i}
              className={`${scheme.bg} rounded-xl p-5 flex flex-col gap-3`}
            >
              <p className={`text-sm font-mono ${scheme.text}`}>
                Card {i + 1}
              </p>
              <p className={`text-lg font-bold ${scheme.text}`}>
                {scheme.bg.replace("bg-", "")}
              </p>
              <div className={`${scheme.button} rounded-lg px-3 py-1.5 text-sm font-medium w-fit`}>
                Button
              </div>
              <div className="mt-1 space-y-0.5">
                <p className={`text-xs font-mono ${scheme.text} opacity-70`}>
                  bg: {scheme.bg}
                </p>
                <p className={`text-xs font-mono ${scheme.text} opacity-70`}>
                  text: {scheme.text}
                </p>
                <p className={`text-xs font-mono ${scheme.text} opacity-70`}>
                  btn: {scheme.button}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ColorGroup title="Chart" colors={chartColors} />
      <ColorGroup title="Sidebar" colors={sidebarColors} />

      <section className="mb-10">
        <h2 className="text-2xl mb-4">Border Radius</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {radiusTokens.map((token) => (
            <div key={token.name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border-2 border-primary bg-primary/10"
                style={{
                  borderRadius:
                    token.name === "radius" ? "0.75rem"
                    : token.name === "radius-sm" ? "0.5rem"
                    : token.name === "radius-md" ? "0.625rem"
                    : token.name === "radius-lg" ? "0.75rem"
                    : "1rem",
                }}
              />
              <div className="text-xs font-medium text-center">{token.name}</div>
              <div className="text-xs text-muted-foreground text-center">{token.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
