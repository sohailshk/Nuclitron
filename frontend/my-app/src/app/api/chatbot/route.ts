import { NextRequest, NextResponse } from 'next/server';

// Mock AI responses for different types of queries
const generateAIResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Temperature queries
  if (lowerQuery.includes('temperature') && lowerQuery.includes('arabian sea')) {
    return `I found temperature data for the Arabian Sea region. The current surface temperature ranges from 28-32°C, with a thermocline at approximately 50-100m depth. The deep ocean temperature (below 1000m) remains relatively stable at 2-4°C. Would you like me to show you a detailed profile or compare with other regions?`;
  }
  
  if (lowerQuery.includes('temperature') && lowerQuery.includes('bay of bengal')) {
    return `Temperature data for the Bay of Bengal shows surface temperatures of 29-31°C, with seasonal variations. The thermocline is typically found at 75-125m depth. Deep water temperatures below 1000m range from 3-5°C. I can provide more specific data for particular time periods or depths.`;
  }
  
  // Salinity queries
  if (lowerQuery.includes('salinity') && lowerQuery.includes('equator')) {
    return `Salinity data near the equator shows interesting patterns. Surface salinity ranges from 34-36 PSU, with lower values in areas of high precipitation. The halocline is typically found at 100-200m depth. I can provide more specific data for particular regions or time periods.`;
  }
  
  if (lowerQuery.includes('salinity') && lowerQuery.includes('indian ocean')) {
    return `Indian Ocean salinity varies significantly by region. The Arabian Sea shows higher salinity (35-37 PSU) due to evaporation, while the Bay of Bengal has lower salinity (32-35 PSU) due to freshwater input from rivers. Deep water salinity is more uniform at around 34.5 PSU.`;
  }
  
  // ARGO float queries
  if (lowerQuery.includes('argo float') && lowerQuery.includes('indian ocean')) {
    return `There are currently 1,200+ active ARGO floats in the Indian Ocean region. They provide continuous monitoring of temperature, salinity, and pressure profiles. The floats cycle every 10 days, collecting data from surface to 2000m depth. Would you like to see their current locations on a map?`;
  }
  
  if (lowerQuery.includes('argo float') && lowerQuery.includes('location')) {
    return `ARGO floats are deployed globally across all major ocean basins. In the Indian Ocean region, they're distributed in the Arabian Sea, Bay of Bengal, and central Indian Ocean. Each float provides real-time location data and can be tracked on our interactive map. Would you like to see the current float positions?`;
  }
  
  // Comparison queries
  if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
    return `I can help you compare oceanographic data across different regions, time periods, or parameters. For example, I can compare temperature profiles between the Arabian Sea and Bay of Bengal, or show seasonal variations in salinity. What specific comparison would you like to make?`;
  }
  
  if (lowerQuery.includes('arabian sea') && lowerQuery.includes('bay of bengal')) {
    return `Comparing the Arabian Sea and Bay of Bengal: The Arabian Sea has higher salinity (35-37 PSU) and lower temperatures (28-30°C) due to evaporation and upwelling. The Bay of Bengal has lower salinity (32-35 PSU) and higher temperatures (29-31°C) due to freshwater input and reduced mixing. Both regions show distinct seasonal patterns.`;
  }
  
  // Depth and pressure queries
  if (lowerQuery.includes('depth') || lowerQuery.includes('pressure')) {
    return `ARGO floats collect data from surface to 2000m depth. The pressure increases by approximately 1 bar per 10m depth. Temperature typically decreases with depth, reaching minimum values in the thermocline (50-200m), then stabilizing in deep water. Salinity patterns vary by region and depth. Would you like specific depth profiles for a particular region?`;
  }
  
  // Data quality and statistics
  if (lowerQuery.includes('data quality') || lowerQuery.includes('statistics')) {
    return `Our ARGO data maintains high quality standards with 99.2% accuracy. We process over 2,800 profiles daily from 4,000+ active floats globally. Data undergoes automatic quality control and manual validation. All measurements follow international oceanographic standards. Would you like to see specific quality metrics?`;
  }
  
  // Climate and seasonal queries
  if (lowerQuery.includes('seasonal') || lowerQuery.includes('climate')) {
    return `Oceanographic data shows distinct seasonal patterns. In the Indian Ocean, monsoon seasons significantly affect surface temperature and salinity. Summer monsoon brings cooler, fresher water, while winter monsoon results in warmer, saltier conditions. Deep ocean conditions remain relatively stable year-round.`;
  }
  
  // General ocean data queries
  if (lowerQuery.includes('ocean data') || lowerQuery.includes('oceanographic')) {
    return `I can help you explore comprehensive oceanographic data including temperature, salinity, pressure, and bio-geo-chemical parameters. Our database contains millions of profiles from ARGO floats, with real-time updates and historical archives. What specific ocean data are you interested in?`;
  }
  
  // Default response
  return `I understand you're asking about "${query}". I can help you with various oceanographic data queries including temperature profiles, salinity measurements, ARGO float locations, ocean currents, and climate patterns. Could you be more specific about what data you're looking for?`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate AI response
    const response = generateAIResponse(message);

    // Generate suggestions based on the query
    const suggestions = [
      'Show more details about this data',
      'Compare with other regions',
      'Export this data',
      'Create a visualization'
    ];

    return NextResponse.json({
      success: true,
      data: {
        response,
        suggestions,
        timestamp: new Date().toISOString(),
        context: {
          query: message,
          ...context
        }
      }
    });
  } catch (error) {
    console.error('Error processing chatbot request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = generateAIResponse(query);

    return NextResponse.json({
      success: true,
      data: {
        response,
        query,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
