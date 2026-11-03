/**
 * Card colours for the website.
 *
 * Cards are white with a hairline border and dark text, on the warm page
 * ground. Each card carries one thin, saturated brand-colour strip across its
 * top: colour as accent, never as the card's ground. Same interface as
 * `getCardColor` from `@switch-to-eu/ui/lib/brand-palette` (which the tool
 * apps keep using), plus `band` for an image area and `strip`.
 */
const BAND = "bg-[#f3efe8]";
const ROTATION = [
  { strip: "bg-brand-sky", shape: "text-brand-sky" },
  { strip: "bg-brand-orange", shape: "text-brand-orange" },
  { strip: "bg-brand-yellow", shape: "text-brand-yellow" },
  { strip: "bg-brand-green", shape: "text-brand-green" },
  { strip: "bg-brand-pink", shape: "text-brand-pink" },
  { strip: "bg-brand-navy", shape: "text-brand-navy" },
  { strip: "bg-brand-sage", shape: "text-brand-sage" },
  { strip: "bg-brand-red", shape: "text-brand-red" },
] as const;

export interface QuietCardColor {
  bg: string;
  text: string;
  button: string;
  shapeColor: string;
  band: string;
  /** Thin saturated strip across the top of the card. */
  strip: string;
}

export function getCardColor(index: number): QuietCardColor {
  const c = ROTATION[index % ROTATION.length]!;
  return {
    bg: "bg-white border border-black/10",
    text: "text-[#1a1a1a]",
    button: "bg-brand-green text-white",
    shapeColor: c.shape,
    band: BAND,
    strip: c.strip,
  };
}
