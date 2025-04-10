import React from 'react';
import Link from 'next/link';
import { ServiceFrontmatter } from '@/lib/content';
import { RegionBadge } from '@/components/ui/region-badge';

interface RecommendedAlternativeProps {
  service: ServiceFrontmatter;
  guides?: {
    slug: string;
    frontmatter: {
      title: string;
      description: string;
      targetService: string;
      sourceService: string;
    };
    category: string;
  }[];
}

export function RecommendedAlternative({ service, guides = [] }: RecommendedAlternativeProps) {
  if (!service) return null;

  // Create the slug for the service
  const serviceSlug = service.name.toLowerCase().replace(/\s+/g, '-');

  // Find guides relevant to this service (it could be the target service)
  const relevantGuides = guides.filter(guide => {
    const guideName = guide.frontmatter.targetService.toLowerCase();
    const serviceName = service.name.toLowerCase();

    // Check if this service is the target service in any guide
    return guideName === serviceName ||
      guideName.includes(serviceName) ||
      serviceName.includes(guideName);
  });

  return (
    <div className="mb-8 p-6 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">Recommended Alternative</h2>
        <RegionBadge region="eu" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{service.name}</h3>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < service.privacyRating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{service.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="font-semibold">Location:</span> {service.location}
          </div>
          <div>
            <span className="font-semibold">Pricing:</span> {service.startingPrice}
          </div>
          <div>
            <span className="font-semibold">Free Option:</span> {service.freeOption ? '✅ Yes' : '❌ No'}
          </div>
        </div>

        {service.features && service.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {service.features.slice(0, 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Visit Website
          </a>

          <Link
            href={`/services/eu/${serviceSlug}`}
            className="inline-block px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {relevantGuides.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Migration Guides:</h4>
          <div className="space-y-2">
            {relevantGuides.map((guide) => (
              <Link
                key={`${guide.category}-${guide.slug}`}
                href={`/guides/${guide.category}/${guide.slug}`}
                className="block p-3 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h5 className="font-medium">{guide.frontmatter.title}</h5>
                <p className="text-sm text-muted-foreground">{guide.frontmatter.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}