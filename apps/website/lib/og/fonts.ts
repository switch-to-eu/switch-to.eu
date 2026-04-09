import { readFile } from "fs/promises";
import { join } from "path";

let cachedFonts: { hankenBold: ArrayBuffer; bonbance: ArrayBuffer } | null =
  null;

export async function getOgFonts() {
  if (cachedFonts) return cachedFonts;

  const fontsDir = join(
    process.cwd(),
    "../../packages/ui/src/fonts"
  );

  const [hankenBold, bonbance] = await Promise.all([
    readFile(join(fontsDir, "HankenGrotesk-Bold.woff2")),
    readFile(join(fontsDir, "Bonbance-BoldCondensed.woff2")),
  ]);

  cachedFonts = {
    hankenBold: hankenBold.buffer,
    bonbance: bonbance.buffer,
  };

  return cachedFonts;
}

export const ogFontConfig = (fonts: {
  hankenBold: ArrayBuffer;
  bonbance: ArrayBuffer;
}) => [
  {
    name: "Hanken Grotesk",
    data: fonts.hankenBold,
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    name: "Bonbance",
    data: fonts.bonbance,
    weight: 800 as const,
    style: "normal" as const,
  },
];
