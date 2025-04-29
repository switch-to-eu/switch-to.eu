import React from "react";
import Link from "next/link";
import { RegionBadge } from "@/components/ui/region-badge";
import { ServiceFrontmatter } from "@/lib/content/schemas";
import { Locale, getDictionary } from "@/lib/i18n/dictionaries";

interface ServiceCardProps {
  service: ServiceFrontmatter;
  showCategory?: boolean;
  lang: Locale;
}

export async function ServiceCard({ service, showCategory = true, lang }: ServiceCardProps) {
  const dict = await getDictionary(lang);
  const categoryFormatted = service.category.charAt(0).toUpperCase() + service.category.slice(1);

  // Create slug from service name for linking
  const serviceSlug = service.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-100 bg-white overflow-hidden">
      <div className="p-6 pb-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-semibold">{service.name}</h3>
          <RegionBadge region={service.region || "eu"} />
        </div>
        {showCategory && (
          <p className="text-sm text-muted-foreground">{dict.services.category}: {categoryFormatted}</p>
        )}
      </div>
      <div className="px-6 flex-grow">
        <div className="mb-3">
          <div className="flex mb-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < service.privacyRating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {dict.services.location}: {service.location} • {service.freeOption ? dict.services.freeOption : dict.services.paidOnly}
          </div>
        </div>
        <p className="text-gray-700">{service.description}</p>
      </div>
      <div className="p-6 pt-4 mt-auto">
        <Link
          href={`/${lang}/services/${service.region || "eu"}/${serviceSlug}`}
          className=" font-medium hover:underline"
        >
          {dict.services.viewDetails}
        </Link>
      </div>
    </div>
  );
}