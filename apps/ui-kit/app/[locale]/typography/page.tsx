export default function TypographyPage() {
  return (
    <div>
      <h1 className="text-4xl mb-2">Typography</h1>
      <p className="text-muted-foreground mb-8">
        Font families, heading scale, and text styles used across the design system.
      </p>

      {/* Font Families */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Font Families</h2>
        <div className="space-y-6">
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-bricolage-grotesque) &middot; font-heading
            </p>
            <p className="font-heading text-3xl">
              BricolageGrotesque ExtraBold — Used for all headings
            </p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-hanken-grotesk) &middot; font-sans
            </p>
            <p className="font-sans text-lg">
              HankenGrotesk SemiBold — Used for body text and paragraphs
            </p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-hanken-grotesk-bold) &middot; font-bold
            </p>
            <p className="font-bold text-lg">
              HankenGrotesk Bold — Used for strong/bold text
            </p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-kiyosuna-sans) &middot; font-kiyosuna
            </p>
            <p className="font-[family-name:var(--font-kiyosuna-sans)] text-3xl">
              KT Kiyosuna Sans Bold — Geometric sans-serif with smooth arching strokes
            </p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-kiyosuna-sans-light) &middot; font-kiyosuna-light
            </p>
            <p className="font-[family-name:var(--font-kiyosuna-sans-light)] text-3xl">
              KT Kiyosuna Sans Light — Geometric sans-serif, light weight
            </p>
          </div>
          <div className="rounded-xl border border-border p-6">
            <p className="text-xs text-muted-foreground mb-2 font-mono">
              font-family: var(--font-bonbance) &middot; font-bonbance
            </p>
            <p className="font-[family-name:var(--font-bonbance)] text-3xl">
              Bonbance Bold Condensed — Vintage serif inspired by French printing
            </p>
          </div>
        </div>
      </section>

      {/* Heading Scale */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Heading Scale</h2>
        <div className="space-y-6 rounded-xl border border-border p-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h1 &middot; text-5xl</p>
            <h1 className="text-5xl">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h2 &middot; text-4xl</p>
            <h2 className="text-4xl">The quick brown fox jumps over the lazy dog</h2>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h3 &middot; text-3xl</p>
            <h3 className="text-3xl">The quick brown fox jumps over the lazy dog</h3>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h4 &middot; text-2xl</p>
            <h4 className="text-2xl">The quick brown fox jumps over the lazy dog</h4>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h5 &middot; text-xl</p>
            <h5 className="text-xl">The quick brown fox jumps over the lazy dog</h5>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">h6 &middot; text-lg</p>
            <h6 className="text-lg">The quick brown fox jumps over the lazy dog</h6>
          </div>
        </div>
      </section>

      {/* Body Text */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Body Text</h2>
        <div className="space-y-6 rounded-xl border border-border p-6 max-w-2xl">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">p &middot; regular</p>
            <p>
              Switch-to.eu helps users transition from non-EU digital services to European
              alternatives. Our platform provides migration guides, EU alternative listings, and
              tools to analyze your digital footprint.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">strong &middot; bold</p>
            <p>
              <strong>This text is bold.</strong> It uses HankenGrotesk Bold at 700 weight.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">em &middot; italic</p>
            <p>
              <em>This text is italic.</em> It uses HankenGrotesk SemiBold Italic.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">mixed</p>
            <p>
              Regular text with <strong>bold segments</strong> and <em>italic segments</em> mixed
              together in a paragraph. Also <strong><em>bold italic</em></strong> for emphasis.
            </p>
          </div>
        </div>
      </section>

      {/* Text Sizes */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Text Size Scale</h2>
        <div className="space-y-3 rounded-xl border border-border p-6">
          {[
            { cls: "text-xs", label: "text-xs (12px)" },
            { cls: "text-sm", label: "text-sm (14px)" },
            { cls: "text-base", label: "text-base (16px)" },
            { cls: "text-lg", label: "text-lg (18px)" },
            { cls: "text-xl", label: "text-xl (20px)" },
            { cls: "text-2xl", label: "text-2xl (24px)" },
            { cls: "text-3xl", label: "text-3xl (30px)" },
            { cls: "text-4xl", label: "text-4xl (36px)" },
            { cls: "text-5xl", label: "text-5xl (48px)" },
          ].map((size) => (
            <div key={size.cls} className="flex items-baseline gap-4">
              <span className="text-xs text-muted-foreground font-mono w-36 shrink-0">
                {size.label}
              </span>
              <span className={size.cls}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tailwind Colors as Text */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Theme Text Colors</h2>
        <div className="space-y-2 rounded-xl border border-border p-6">
          <p className="text-foreground">text-foreground — Default body text</p>
          <p className="text-primary">text-primary — Primary blue</p>
          <p className="text-muted-foreground">text-muted-foreground — Muted/secondary text</p>
          <p className="text-destructive">text-destructive — Error/destructive text</p>
          <p className="text-blue">text-blue — Link blue</p>
        </div>
      </section>
    </div>
  );
}
