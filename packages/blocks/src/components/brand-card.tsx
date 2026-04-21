import Image from "next/image";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import { Link } from "@switch-to-eu/i18n/navigation";
import { shapes } from "../shapes";

export interface BrandCardProps {
  colorIndex: number;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  ctaText?: string;
  /** Shape name (e.g. "spark"), looked up from the shapes data */
  shape?: string;
  /** "top" (default): shape in dedicated visual area. "accent": small corner decoration. */
  shapePosition?: "top" | "accent";
  /** Cover image URL — renders an object-cover photo area instead of a centered shape */
  image?: string;
  imageAlt?: string;
  className?: string;
  /** Extra classes on the content area (e.g. "text-center") */
  contentClassName?: string;
  /** Pre-translated label shown between description and CTA (e.g. "Start with Mastodon"). A decorative arrow is appended. */
  recommendationLabel?: string;
  /**
   * Optional small secondary link rendered below the CTA.
   * When set together with `href`, the card switches to a stretched-link pattern
   * so the whole card clicks through to `href` while this link remains independently clickable.
   */
  secondaryLink?: {
    href: string;
    text: string;
  };
  /** Accessible label for the primary (card-level) link. Defaults to the card title. */
  primaryAriaLabel?: string;
}

function ShapeSvg({ name, color, colorIndex }: { name: string; color: string; colorIndex: number }) {
  const shapeData = shapes[name];
  if (!shapeData) return null;
  return (
    <svg
      viewBox={shapeData.viewBox}
      className={cn("w-full h-full select-none animate-shape-float", color)}
      style={{
        animationDuration: `${6 + (colorIndex % 4) * 1.5}s`,
        animationDelay: `${(colorIndex % 4) * -1.5}s`,
      }}
      aria-hidden="true"
    >
      <path d={shapeData.d} fill="currentColor" />
    </svg>
  );
}

export function BrandCard({
  colorIndex,
  title,
  description,
  href,
  external,
  ctaText,
  shape,
  shapePosition = "top",
  image,
  imageAlt,
  className,
  contentClassName,
  recommendationLabel,
  secondaryLink,
  primaryAriaLabel,
}: BrandCardProps) {
  const card = getCardColor(colorIndex);

  const content = (
    <div
      className={cn(
        card.bg,
        "h-full flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md md:rounded-3xl",
        shapePosition === "accent" && "relative",
        className
      )}
    >
      {image ? (
        <div className="relative h-44 sm:h-52">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {shape && (
            <div className="absolute top-3 right-3 w-14 h-14 sm:w-16 sm:h-16 opacity-30 pointer-events-none">
              <ShapeSvg name={shape} color={card.shapeColor} colorIndex={colorIndex} />
            </div>
          )}
        </div>
      ) : shape && shapePosition === "top" ? (
        <div className="relative h-40 sm:h-48 flex items-center justify-center p-4 sm:p-6">
          <ShapeSvg name={shape} color={card.shapeColor} colorIndex={colorIndex} />
        </div>
      ) : null}

      {shape && shapePosition === "accent" && (
        <div className="absolute top-3 right-3 w-20 h-20 sm:w-24 sm:h-24 opacity-20 pointer-events-none">
          <ShapeSvg name={shape} color={card.shapeColor} colorIndex={colorIndex} />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col flex-1",
          shapePosition === "accent"
            ? "relative z-10 p-6 sm:p-8"
            : cn("px-5 pb-5 sm:px-6 sm:pb-6", image && "pt-4"),
          contentClassName
        )}
      >
        <h3 className={`${card.text} mb-2 font-bold text-lg sm:text-xl`}>
          {title}
        </h3>
        <p
          className={cn(
            `${card.text} text-sm sm:text-base opacity-80 leading-relaxed`,
            (ctaText || recommendationLabel) && "line-clamp-3 mb-4"
          )}
        >
          {description}
        </p>
        {recommendationLabel && (
          <p
            className={cn(
              card.text,
              "text-xs sm:text-sm font-semibold mb-5 flex items-center gap-1.5"
            )}
          >
            <span>{recommendationLabel}</span>
            <span aria-hidden="true" className="opacity-70">→</span>
          </p>
        )}
        {ctaText && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}
            >
              {ctaText}
            </span>
            {secondaryLink && (
              <Link
                href={secondaryLink.href}
                className={cn(
                  card.text,
                  "pointer-events-auto inline-flex items-center gap-1 text-xs sm:text-sm font-semibold opacity-80 hover:opacity-100 hover:underline transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green rounded"
                )}
              >
                {secondaryLink.text}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href && secondaryLink) {
    // Stretched-link pattern: whole card clicks through to `href`.
    // `pointer-events-none` on the content layer lets clicks fall to the stretched link,
    // while the secondary link inside content re-enables pointer events for itself.
    return (
      <article className="relative h-full group">
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={primaryAriaLabel ?? title}
            className="absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
          />
        ) : (
          <Link
            href={href}
            aria-label={primaryAriaLabel ?? title}
            className="absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
          />
        )}
        <div className="relative z-10 pointer-events-none h-full">
          {content}
        </div>
      </article>
    );
  }

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline h-full group"
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className="no-underline h-full group">
        {content}
      </Link>
    );
  }

  return content;
}
