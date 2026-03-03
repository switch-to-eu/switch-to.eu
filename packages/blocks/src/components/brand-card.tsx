import Image from "next/image";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import { Link } from "@switch-to-eu/i18n/navigation";

export interface BrandCardProps {
  colorIndex: number;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  ctaText?: string;
  shape?: string;
  /** Cover image URL — renders an object-cover photo area instead of a centered shape */
  image?: string;
  imageAlt?: string;
  className?: string;
}

export function BrandCard({
  colorIndex,
  title,
  description,
  href,
  external,
  ctaText,
  shape,
  image,
  imageAlt,
  className,
}: BrandCardProps) {
  const card = getCardColor(colorIndex);

  const content = (
    <div
      className={cn(
        card.bg,
        "h-full flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md md:rounded-3xl",
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
              <Image
                src={shape}
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: card.shapeFilter,
                  animationDuration: `${6 + (colorIndex % 4) * 1.5}s`,
                  animationDelay: `${(colorIndex % 4) * -1.5}s`,
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>
          )}
        </div>
      ) : shape ? (
        <div className="relative h-40 sm:h-48 flex items-center justify-center">
          <Image
            src={shape}
            alt=""
            fill
            className="object-contain p-4 sm:p-6 select-none animate-shape-float"
            style={{
              filter: card.shapeFilter,
              animationDuration: `${6 + (colorIndex % 4) * 1.5}s`,
              animationDelay: `${(colorIndex % 4) * -1.5}s`,
            }}
            aria-hidden="true"
            unoptimized
          />
        </div>
      ) : null}

      <div className={cn("flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6", image && "pt-4")}>
        <h3 className={`${card.text} mb-2 font-bold text-lg sm:text-xl`}>
          {title}
        </h3>
        <p
          className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed line-clamp-3 mb-5`}
        >
          {description}
        </p>
        {ctaText && (
          <div className="mt-auto">
            <span
              className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}
            >
              {ctaText}
            </span>
          </div>
        )}
      </div>
    </div>
  );

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
