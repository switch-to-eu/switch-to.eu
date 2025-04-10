import { NextRequest, NextResponse } from 'next/server';
import { performSearch, SearchResultType } from '@/lib/search';

export async function GET(request: NextRequest) {
    try {
        // Get search parameters from URL
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        console.log('Search API received query:', query);

        // Parse limit parameter
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Parse types parameter (comma-separated list)
        const typesParam = searchParams.get('types');
        const types = typesParam ? typesParam.split(',') as SearchResultType[] : undefined;

        // Get region parameter for filtering
        const regionParam = searchParams.get('region');
        const region = regionParam ? regionParam as 'eu' | 'non-eu' : undefined;

        // Validate search query
        if (!query.trim()) {
            console.log('Search API: Empty query received');
            return NextResponse.json(
                { results: [], message: 'Search query is required' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );
        }

        // Perform search with parameters
        console.log('Search API: Performing search for:', query, region ? `with region filter: ${region}` : '');
        const results = await performSearch(query, { limit, types, region });
        console.log(`Search API: Found ${results.length} results`);

        // Return search results
        return NextResponse.json(
            { results },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        );
    } catch (error) {
        console.error('Search API error:', error);

        // Return error response
        return NextResponse.json(
            { message: 'An error occurred while searching', error: String(error) },
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