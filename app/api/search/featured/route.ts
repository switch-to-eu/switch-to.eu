import { NextRequest, NextResponse } from 'next/server';
import { SearchResultType, ServiceSearchResult } from '@/lib/search';
import { getFeaturedServices } from '@/lib/content';
import { Locale } from '@/lib/i18n/dictionaries';

export async function GET(request: NextRequest) {
  try {
    // Get filter parameters from URL
    const { searchParams } = new URL(request.url);

    // Parse limit parameter
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Parse types parameter (comma-separated list)
    const typesParam = searchParams.get('types');
    const types = typesParam ? typesParam.split(',') as SearchResultType[] : undefined;

    // Get region parameter for filtering
    const regionParam = searchParams.get('region');
    const region = regionParam ? regionParam as 'eu' | 'non-eu' : undefined;

    // Get language parameter
    const langParam = searchParams.get('lang');
    const lang = langParam as Locale || 'en';

    console.log('Featured API: Processing request with filters:', { limit, types, region, lang });

    // Get all featured services from markdown files, passing the language parameter
    const featuredServicesData = await getFeaturedServices(lang, region);

    // Transform the data to match the ServiceSearchResult interface
    const featuredServices: ServiceSearchResult[] = featuredServicesData.map(({ service }) => ({
      id: service.name.toLowerCase().replace(/\s+/g, '-'),
      title: service.name,
      description: service.description,
      url: `/${lang}/services/${service.region || 'non-eu'}/${service.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'service',
      location: service.location,
      category: service.category,
      privacyRating: service.privacyRating,
      freeOption: service.freeOption,
      region: service.region || 'non-eu' // Default to non-eu if not specified
    }));

    console.log(`Featured API: Loaded ${featuredServices.length} featured services from content files`);

    // Apply type filter if specified
    let filteredResults = featuredServices;
    if (types && types.length > 0) {
      filteredResults = filteredResults.filter(item =>
        types.includes(item.type as SearchResultType)
      );
    }

    // Note: We already applied region filter in getFeaturedServices to benefit from more efficient filtering

    // Apply limit
    const limitedResults = filteredResults.slice(0, limit);

    console.log(`Featured API: Returning ${limitedResults.length} featured services`);

    // Return featured results
    return NextResponse.json(
      { results: limitedResults },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Featured API error:', error);

    // Return error response
    return NextResponse.json(
      { message: 'An error occurred', error: String(error) },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}