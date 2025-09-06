import { NextRequest, NextResponse } from 'next/server';

// Mock dashboard data
const mockDashboardData = {
  stats: {
    activeFloats: 4123,
    profilesToday: 2847,
    dataQuality: 99.2,
    coverage: 87.5,
    changes: {
      activeFloats: '+2.3%',
      profilesToday: '+5.1%',
      dataQuality: '+0.1%',
      coverage: '-1.2%'
    }
  },
  recentActivity: [
    {
      id: 1,
      type: 'data',
      message: 'New data received from ARGO-2901234',
      time: '2 min ago',
      status: 'success',
      details: {
        float: 'ARGO-2901234',
        location: 'Arabian Sea',
        profiles: 1,
        quality: 'Good'
      }
    },
    {
      id: 2,
      type: 'system',
      message: 'Data quality check completed',
      time: '5 min ago',
      status: 'success',
      details: {
        profiles: 1200,
        quality: '99.2%',
        duration: '2.3s'
      }
    },
    {
      id: 3,
      type: 'maintenance',
      message: 'ARGO-2901237 requires maintenance',
      time: '1 hour ago',
      status: 'warning',
      details: {
        float: 'ARGO-2901237',
        location: 'South China Sea',
        issue: 'Battery low',
        priority: 'Medium'
      }
    },
    {
      id: 4,
      type: 'deployment',
      message: 'New ARGO float deployed',
      time: '2 hours ago',
      status: 'success',
      details: {
        float: 'ARGO-2901239',
        location: 'Bay of Bengal',
        depth: 2000,
        cycle: 1
      }
    }
  ],
  oceanRegions: [
    {
      name: 'Indian Ocean',
      floats: 1200,
      coverage: '85%',
      color: 'bg-blue-500',
      active: 1150,
      maintenance: 50
    },
    {
      name: 'Pacific Ocean',
      floats: 1800,
      coverage: '92%',
      color: 'bg-cyan-500',
      active: 1720,
      maintenance: 80
    },
    {
      name: 'Atlantic Ocean',
      floats: 900,
      coverage: '78%',
      color: 'bg-green-500',
      active: 850,
      maintenance: 50
    },
    {
      name: 'Southern Ocean',
      floats: 300,
      coverage: '65%',
      color: 'bg-purple-500',
      active: 280,
      maintenance: 20
    },
    {
      name: 'Arctic Ocean',
      floats: 150,
      coverage: '45%',
      color: 'bg-orange-500',
      active: 140,
      maintenance: 10
    }
  ],
  recentFloats: [
    {
      id: 'ARGO-2901234',
      name: 'Arabian Sea Float 1',
      location: 'Arabian Sea',
      lastUpdate: '2 min ago',
      status: 'active',
      temperature: 28.5,
      salinity: 35.2,
      depth: 1500,
      cycle: 245
    },
    {
      id: 'ARGO-2901235',
      name: 'Bay of Bengal Float 2',
      location: 'Bay of Bengal',
      lastUpdate: '5 min ago',
      status: 'active',
      temperature: 29.1,
      salinity: 34.8,
      depth: 1800,
      cycle: 198
    },
    {
      id: 'ARGO-2901236',
      name: 'Indian Ocean Float 3',
      location: 'Indian Ocean',
      lastUpdate: '8 min ago',
      status: 'active',
      temperature: 27.8,
      salinity: 35.5,
      depth: 2000,
      cycle: 312
    },
    {
      id: 'ARGO-2901237',
      name: 'South China Sea Float 4',
      location: 'South China Sea',
      lastUpdate: '12 min ago',
      status: 'maintenance',
      temperature: 30.2,
      salinity: 34.2,
      depth: 1200,
      cycle: 156
    },
    {
      id: 'ARGO-2901238',
      name: 'Red Sea Float 5',
      location: 'Red Sea',
      lastUpdate: '15 min ago',
      status: 'active',
      temperature: 31.5,
      salinity: 38.1,
      depth: 800,
      cycle: 89
    }
  ],
  systemHealth: {
    cpu: 45,
    memory: 67,
    disk: 78,
    network: 12,
    database: 23,
    status: {
      cpu: 'good',
      memory: 'good',
      disk: 'warning',
      network: 'good',
      database: 'good'
    }
  },
  trends: {
    temperature: {
      current: 28.5,
      trend: 'increasing',
      change: '+0.3°C',
      period: 'last 7 days'
    },
    salinity: {
      current: 35.2,
      trend: 'stable',
      change: '0.0 PSU',
      period: 'last 7 days'
    },
    profiles: {
      current: 2847,
      trend: 'increasing',
      change: '+156',
      period: 'today'
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const region = searchParams.get('region');
    const timeRange = searchParams.get('timeRange') || '7 days';

    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let responseData = mockDashboardData;

    // Filter data based on parameters
    if (type === 'stats') {
      responseData = { stats: mockDashboardData.stats };
    } else if (type === 'activity') {
      responseData = { recentActivity: mockDashboardData.recentActivity };
    } else if (type === 'regions') {
      responseData = { oceanRegions: mockDashboardData.oceanRegions };
    } else if (type === 'floats') {
      let floats = mockDashboardData.recentFloats;
      if (region && region !== 'All') {
        floats = floats.filter(float => float.location === region);
      }
      responseData = { recentFloats: floats };
    } else if (type === 'health') {
      responseData = { systemHealth: mockDashboardData.systemHealth };
    } else if (type === 'trends') {
      responseData = { trends: mockDashboardData.trends };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      filters: {
        type,
        region,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (action) {
      case 'refresh':
        return NextResponse.json({
          success: true,
          message: 'Dashboard data refreshed successfully',
          data: mockDashboardData,
          timestamp: new Date().toISOString()
        });

      case 'export':
        return NextResponse.json({
          success: true,
          message: 'Data export initiated',
          downloadUrl: '/api/export/dashboard-data.csv',
          timestamp: new Date().toISOString()
        });

      case 'updateSettings':
        return NextResponse.json({
          success: true,
          message: 'Dashboard settings updated successfully',
          settings: data,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing dashboard request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
