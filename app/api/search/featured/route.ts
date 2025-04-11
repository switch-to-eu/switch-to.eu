import { NextRequest, NextResponse } from 'next/server';
import { SearchResultType, ServiceSearchResult } from '@/lib/search';
import { getFeaturedServices, getAllServices } from '@/lib/content';

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

    console.log('Featured API: Processing request with filters:', { limit, types, region });

    // Get all featured services from markdown files
    const featuredServicesData = await getFeaturedServices();

    // If getFeaturedServices doesn't exist or fails, fall back to getting all services
    // and filtering for featured ones
    let featuredServices: ServiceSearchResult[] = [];

    if (featuredServicesData.length > 0) {
      // Transform the data to match the ServiceSearchResult interface
      featuredServices = featuredServicesData.map(({ service }) => ({
        id: service.name.toLowerCase().replace(/\s+/g, '-'),
        title: service.name,
        description: service.description,
        url: `/alternatives/${service.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'service',
        location: service.location,
        category: service.category,
        privacyRating: service.privacyRating,
        freeOption: service.freeOption,
        region: service.region || 'non-eu' // Default to non-eu if not specified
      }));
    } else {
      // Fallback: get all services and filter for ones marked as featured
      const allServices = await getAllServices();
      featuredServices = allServices
        .filter(service => service.featured === true)
        .map(service => ({
          id: service.name.toLowerCase().replace(/\s+/g, '-'),
          title: service.name,
          description: service.description,
          url: `/alternatives/${service.name.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'service',
          location: service.location,
          category: service.category,
          privacyRating: service.privacyRating,
          freeOption: service.freeOption,
          region: service.region || 'non-eu' // Default to non-eu if not specified
        }));
    }

    console.log(`Featured API: Loaded ${featuredServices.length} featured services from content files`);

    // Apply type filter if specified
    let filteredResults = featuredServices;
    if (types && types.length > 0) {
      filteredResults = filteredResults.filter(item =>
        types.includes(item.type as SearchResultType)
      );
    }

    // Apply region filter if specified
    if (region) {
      filteredResults = filteredResults.filter(item => item.region === region);
    }

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