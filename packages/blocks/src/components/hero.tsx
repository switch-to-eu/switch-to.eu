"use client";

import { BlobShape, PebbleShape, PuddleShape } from "@switch-to-eu/ui/components/hero-shapes";
import { Container } from "./container";

export interface HeroColors {
  bg: string;
  title: string;
  subtitle: string;
  blob1: string;
  blob2: string;
  blob3: string;
  buttonBg: string;
  buttonText: string;
  buttonOutlineColor: string;
  buttonOutlineHoverBg: string;
  buttonOutlineHoverText: string;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  colors: HeroColors;
  titleFont?: string;
  children?: React.ReactNode;
  buttons?: Array<{
    label: string;
    href: string;
    variant: "solid" | "outline";
  }>;
}

export function Hero({
  title,
  subtitle,
  colors,
  titleFont = "var(--font-bonbance)",
  children,
  buttons,
}: HeroProps) {
  return (
    <section>
      <Container noPaddingMobile>
        <div
          className="rounded-none md:rounded-3xl"
          style={{ backgroundColor: colors.bg }}
        >
          <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="relative text-center">
              <BlobShape
                color={colors.blob1}
                className="absolute -left-8 md:-left-16 -top-8 md:-top-12 w-32 h-32 md:w-52 md:h-52 opacity-80 -rotate-12 pointer-events-none"
                delay={200}
              />
              <PebbleShape
                color={colors.blob2}
                className="absolute -right-4 md:-right-12 -bottom-4 md:-bottom-8 w-32 h-32 md:w-48 md:h-48 opacity-80 rotate-12 pointer-events-none"
                delay={400}
              />
              <PuddleShape
                color={colors.blob3}
                className="absolute right-1/4 -top-6 md:-top-10 w-28 h-28 md:w-44 md:h-44 opacity-80 rotate-45 pointer-events-none"
                delay={600}
              />
              <h1
                className="relative uppercase text-center"
                style={{
                  fontFamily: titleFont,
                  fontSize: "clamp(3.5rem, 10vw, 9rem)",
                  fontWeight: 400,
                  lineHeight: 0.9,
                  letterSpacing: "-0.02em",
                  color: colors.title,
                }}
              >
                {title}
              </h1>
            </div>

            {subtitle && (
              <p
                className="text-center text-base sm:text-lg md:text-xl mt-8 sm:mt-10 max-w-2xl mx-auto"
                style={{ color: colors.subtitle }}
              >
                {subtitle}
              </p>
            )}

            {children && (
              <div className="mt-6 sm:mt-8 max-w-xl mx-auto">{children}</div>
            )}

            {buttons && buttons.length > 0 && (
              <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                {buttons.map((btn) => (
                  <a
                    key={btn.href}
                    href={btn.href}
                    className="px-6 sm:px-8 py-3 font-medium rounded-full transition-colors text-sm sm:text-base"
                    style={
                      btn.variant === "solid"
                        ? {
                            backgroundColor: colors.buttonBg,
                            color: colors.buttonText,
                          }
                        : {
                            border: `1px solid ${colors.buttonOutlineColor}`,
                            color: colors.buttonOutlineColor,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (btn.variant === "outline") {
                        e.currentTarget.style.backgroundColor = colors.buttonOutlineHoverBg;
                        e.currentTarget.style.color = colors.buttonOutlineHoverText;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (btn.variant === "outline") {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = colors.buttonOutlineColor;
                      }
                    }}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export const HERO_PRESETS = {
  navy: {
    bg: "var(--brand-navy)",
    title: "var(--brand-yellow)",
    subtitle: "var(--brand-sky)",
    blob1: "var(--brand-orange)",
    blob2: "var(--brand-pink)",
    blob3: "var(--brand-sky)",
    buttonBg: "var(--brand-yellow)",
    buttonText: "var(--brand-navy)",
    buttonOutlineColor: "var(--brand-yellow)",
    buttonOutlineHoverBg: "var(--brand-yellow)",
    buttonOutlineHoverText: "var(--brand-navy)",
  },
  green: {
    bg: "var(--brand-green)",
    title: "var(--brand-yellow)",
    subtitle: "var(--brand-cream)",
    blob1: "var(--brand-sage)",
    blob2: "var(--brand-pink)",
    blob3: "var(--brand-sky)",
    buttonBg: "var(--brand-yellow)",
    buttonText: "var(--brand-green)",
    buttonOutlineColor: "var(--brand-yellow)",
    buttonOutlineHoverBg: "var(--brand-yellow)",
    buttonOutlineHoverText: "var(--brand-green)",
  },
  red: {
    bg: "var(--brand-red)",
    title: "#ffffff",
    subtitle: "var(--brand-yellow)",
    blob1: "var(--brand-orange)",
    blob2: "var(--brand-pink)",
    blob3: "var(--brand-yellow)",
    buttonBg: "#ffffff",
    buttonText: "var(--brand-red)",
    buttonOutlineColor: "#ffffff",
    buttonOutlineHoverBg: "#ffffff",
    buttonOutlineHoverText: "var(--brand-red)",
  },
  orange: {
    bg: "var(--brand-orange)",
    title: "#ffffff",
    subtitle: "var(--brand-yellow)",
    blob1: "var(--brand-red)",
    blob2: "var(--brand-yellow)",
    blob3: "var(--brand-pink)",
    buttonBg: "#ffffff",
    buttonText: "var(--brand-orange)",
    buttonOutlineColor: "#ffffff",
    buttonOutlineHoverBg: "#ffffff",
    buttonOutlineHoverText: "var(--brand-orange)",
  },
  pink: {
    bg: "var(--brand-pink)",
    title: "#ffffff",
    subtitle: "var(--brand-navy)",
    blob1: "var(--brand-red)",
    blob2: "var(--brand-yellow)",
    blob3: "var(--brand-sky)",
    buttonBg: "var(--brand-navy)",
    buttonText: "#ffffff",
    buttonOutlineColor: "var(--brand-navy)",
    buttonOutlineHoverBg: "var(--brand-navy)",
    buttonOutlineHoverText: "#ffffff",
  },
  sky: {
    bg: "var(--brand-sky)",
    title: "var(--brand-navy)",
    subtitle: "var(--brand-green)",
    blob1: "var(--brand-sage)",
    blob2: "var(--brand-pink)",
    blob3: "var(--brand-yellow)",
    buttonBg: "var(--brand-navy)",
    buttonText: "#ffffff",
    buttonOutlineColor: "var(--brand-navy)",
    buttonOutlineHoverBg: "var(--brand-navy)",
    buttonOutlineHoverText: "#ffffff",
  },
  yellow: {
    bg: "var(--brand-yellow)",
    title: "var(--brand-navy)",
    subtitle: "var(--brand-green)",
    blob1: "var(--brand-orange)",
    blob2: "var(--brand-red)",
    blob3: "var(--brand-pink)",
    buttonBg: "var(--brand-navy)",
    buttonText: "#ffffff",
    buttonOutlineColor: "var(--brand-navy)",
    buttonOutlineHoverBg: "var(--brand-navy)",
    buttonOutlineHoverText: "#ffffff",
  },
  sage: {
    bg: "var(--brand-sage)",
    title: "var(--brand-green)",
    subtitle: "var(--brand-navy)",
    blob1: "var(--brand-sky)",
    blob2: "var(--brand-yellow)",
    blob3: "var(--brand-green)",
    buttonBg: "var(--brand-green)",
    buttonText: "#ffffff",
    buttonOutlineColor: "var(--brand-green)",
    buttonOutlineHoverBg: "var(--brand-green)",
    buttonOutlineHoverText: "#ffffff",
  },
} satisfies Record<string, HeroColors>;
