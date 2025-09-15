import { NextRequest, NextResponse } from 'next/server';

// Mock ARGO data - in a real application, this would connect to your database
const mockArgoData = {
  floats: [
    {
      id: 'ARGO-2901234',
      name: 'Arabian Sea Float 1',
      latitude: 15.5,
      longitude: 65.2,
      status: 'active',
      lastUpdate: new Date().toISOString(),
      temperature: 28.5,
      salinity: 35.2,
      depth: 1500,
      region: 'Arabian Sea',
      cycle: 245,
      profiles: [
        { depth: 0, temperature: 28.5, salinity: 35.2, pressure: 0 },
        { depth: 10, temperature: 28.3, salinity: 35.1, pressure: 1 },
        { depth: 50, temperature: 27.8, salinity: 35.0, pressure: 5 },
        { depth: 100, temperature: 25.2, salinity: 34.8, pressure: 10 },
        { depth: 200, temperature: 20.1, salinity: 34.5, pressure: 20 },
        { depth: 500, temperature: 12.3, salinity: 34.2, pressure: 50 },
        { depth: 1000, temperature: 6.8, salinity: 34.0, pressure: 100 },
        { depth: 1500, temperature: 4.2, salinity: 34.1, pressure: 150 }
      ]
    },
    {
      id: 'ARGO-2901235',
      name: 'Bay of Bengal Float 2',
      latitude: 18.2,
      longitude: 88.1,
      status: 'active',
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      temperature: 29.1,
      salinity: 34.8,
      depth: 1800,
      region: 'Bay of Bengal',
      cycle: 198,
      profiles: [
        { depth: 0, temperature: 29.1, salinity: 34.8, pressure: 0 },
        { depth: 10, temperature: 28.9, salinity: 34.7, pressure: 1 },
        { depth: 50, temperature: 28.4, salinity: 34.6, pressure: 5 },
        { depth: 100, temperature: 26.1, salinity: 34.4, pressure: 10 },
        { depth: 200, temperature: 21.3, salinity: 34.1, pressure: 20 },
        { depth: 500, temperature: 13.7, salinity: 33.8, pressure: 50 },
        { depth: 1000, temperature: 7.2, salinity: 33.6, pressure: 100 },
        { depth: 1500, temperature: 4.5, salinity: 33.7, pressure: 150 },
        { depth: 1800, temperature: 3.8, salinity: 33.8, pressure: 180 }
      ]
    },
    {
      id: 'ARGO-2901236',
      name: 'Indian Ocean Float 3',
      latitude: -5.3,
      longitude: 75.8,
      status: 'active',
      lastUpdate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      temperature: 27.8,
      salinity: 35.5,
      depth: 2000,
      region: 'Indian Ocean',
      cycle: 312,
      profiles: [
        { depth: 0, temperature: 27.8, salinity: 35.5, pressure: 0 },
        { depth: 10, temperature: 27.6, salinity: 35.4, pressure: 1 },
        { depth: 50, temperature: 27.1, salinity: 35.3, pressure: 5 },
        { depth: 100, temperature: 24.8, salinity: 35.1, pressure: 10 },
        { depth: 200, temperature: 19.7, salinity: 34.8, pressure: 20 },
        { depth: 500, temperature: 11.9, salinity: 34.5, pressure: 50 },
        { depth: 1000, temperature: 6.1, salinity: 34.3, pressure: 100 },
        { depth: 1500, temperature: 3.9, salinity: 34.4, pressure: 150 },
        { depth: 2000, temperature: 2.8, salinity: 34.5, pressure: 200 }
      ]
    }
  ],
  statistics: {
    totalFloats: 4123,
    activeFloats: 3891,
    totalProfiles: 2400000,
    profilesToday: 2847,
    dataQuality: 99.2,
    regions: {
      'Indian Ocean': 1200,
      'Pacific Ocean': 1800,
      'Atlantic Ocean': 900,
      'Southern Ocean': 300,
      'Arctic Ocean': 150
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredFloats = mockArgoData.floats;

    // Apply filters
    if (region && region !== 'All') {
      filteredFloats = filteredFloats.filter(float => float.region === region);
    }

    if (status && status !== 'All') {
      filteredFloats = filteredFloats.filter(float => float.status === status);
    }

    // Apply pagination
    const paginatedFloats = filteredFloats.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        floats: paginatedFloats,
        statistics: mockArgoData.statistics,
        pagination: {
          total: filteredFloats.length,
          limit,
          offset,
          hasMore: offset + limit < filteredFloats.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ARGO data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ARGO data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    // Simulate AI-powered data query processing
    const results = mockArgoData.floats.filter(float => {
      if (query) {
        const searchTerm = query.toLowerCase();
        return (
          float.name.toLowerCase().includes(searchTerm) ||
          float.id.toLowerCase().includes(searchTerm) ||
          float.region.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        query,
        filters,
        totalResults: results.length
      }
    });
  } catch (error) {
    console.error('Error processing ARGO data query:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
