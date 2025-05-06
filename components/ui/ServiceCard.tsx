import React from "react";
import Link from "next/link";
import { RegionBadge } from "@/components/ui/region-badge";
import { getLocale, getTranslations } from "next-intl/server";
import { ServiceFrontmatter } from "@/lib/content";


export async function ServiceCard({ service, showCategory = true }: { service: ServiceFrontmatter, showCategory?: boolean }) {
  const locale = await getLocale();
  const t = await getTranslations("services");
  const categoryFormatted = service.category.charAt(0).toUpperCase() + service.category.slice(1);

  // Create slug from service name for linking
  const serviceSlug = service.name.toLowerCase().replace(/\s+/g, '-');
  // Keep original 'eu' path (not 'eu-friendly')
  const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
  const serviceLink = `/${locale}/services/${regionPath}/${serviceSlug}`;

  return (
    <Link href={serviceLink} className="block h-full transition-transform hover:scale-[1.02] hover:shadow-md">
      <div className={`flex flex-col h-full rounded-lg border border-gray-100 ${service.featured ? 'bg-[var(--green-bg)]' : 'bg-white'} overflow-hidden transition-colors hover:border-slate-200`}>
        <div className="p-6 pb-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-semibold">
              {service.featured && <span className="mr-1">⭐</span>}
              {service.name}
            </h3>
            <RegionBadge region={service.region || "eu"} />
          </div>
          {showCategory && (
            <p className="text-sm text-muted-foreground">{t('category')}: {categoryFormatted}</p>
          )}
        </div>
        <div className="px-6 flex-grow pb-6">
          <div className="mb-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="text-sm flex items-center">
                <span className="font-medium mr-1">{t('location')}:</span>
                <span>{service.location}</span>
              </div>
              <div className="text-sm flex items-center">
                <span className="font-medium mr-1">{t('freeOption')}:</span>
                <span>{service.freeOption ? "✅" : "❌"}</span>
              </div>
              {/* Only show premium price if it exists and is a string */}
              {service.startingPrice && typeof service.startingPrice === 'string' && (
                <div className="text-sm flex items-center">
                  <span className="font-medium mr-1">{t('detail.startingPrice')}:</span>
                  <span>{service.startingPrice}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-700">{service.description}</p>
        </div>
      </div>
    </Link>
  );
}