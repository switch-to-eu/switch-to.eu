/**
 * Card colours for the website's calm look.
 *
 * Cards are white with a hairline border and dark text. The brand colour
 * rotation survives in small doses: the tinted band behind a card's shape or
 * image, and the shape itself. Same interface as `getCardColor` from
 * `@switch-to-eu/ui/lib/brand-palette` (which the tool apps keep using), plus
 * `band` for the tinted visual area.
 */
const ROTATION = [
  { band: "bg-brand-sky/35", shape: "text-brand-green" },
  { band: "bg-brand-orange/15", shape: "text-brand-orange" },
  { band: "bg-brand-yellow/25", shape: "text-brand-green" },
  { band: "bg-brand-sage/40", shape: "text-brand-green" },
  { band: "bg-brand-pink/20", shape: "text-brand-pink" },
  { band: "bg-brand-navy/10", shape: "text-brand-navy" },
  { band: "bg-brand-sage/30", shape: "text-brand-green" },
  { band: "bg-brand-red/10", shape: "text-brand-red" },
] as const;

export interface QuietCardColor {
  bg: string;
  text: string;
  button: string;
  shapeColor: string;
  band: string;
}

export function getCardColor(index: number): QuietCardColor {
  const c = ROTATION[index % ROTATION.length]!;
  return {
    bg: "bg-white border border-black/10",
    text: "text-[#1a1a1a]",
    button: "bg-brand-green text-white",
    shapeColor: c.shape,
    band: c.band,
  };
}
