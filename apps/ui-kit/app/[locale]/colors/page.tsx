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

const semanticColors = [
  { name: "green", value: "#a2d4a8" },
  { name: "green-bg", value: "#e8fff5" },
  { name: "blue", value: "#3ea6e3" },
  { name: "blue-bg", value: "#cce6f4" },
  { name: "yellow", value: "#f7df8f" },
];

const featureColors = [
  { name: "feature-blue-bg", value: "#e9f4fd" },
  { name: "feature-pink-bg", value: "#ffeae5" },
  { name: "feature-green-bg", value: "#e8f7ed" },
  { name: "feature-icon-color", value: "#1b456b" },
  { name: "cta-button", value: "#feb5a7" },
  { name: "cta-button-hover", value: "#ff8a74" },
];

const popColors = [
  { name: "pop-1 (blue)", value: "#e9f4fd" },
  { name: "pop-2 (pink)", value: "#ffeae5" },
  { name: "pop-3 (green)", value: "#e8f7ed" },
  { name: "pop-4 (purple)", value: "#f0ebff" },
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
      <ColorGroup title="Semantic" colors={semanticColors} />
      <ColorGroup title="Feature Cards" colors={featureColors} />
      <ColorGroup title="Pop (Category Cards)" colors={popColors} />
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
