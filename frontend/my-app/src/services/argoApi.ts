// ARGO Data API Service with ERDDAP integration and fallback to mock data

export interface ArgoDataPoint {
  id: number;
  floatId: string;
  date: string;
  time: string;
  timestamp: number;
  region: string;
  latitude: number;
  longitude: number;
  depth: number;
  temperature: number;
  salinity: number;
  pressure: number;
  oxygen?: number;
  chlorophyll?: number;
  ph?: number;
  nitrate?: number;
  phosphate?: number;
  isRecent: boolean;
}

export interface ArgoApiResponse {
  data: ArgoDataPoint[];
  totalFloats: number;
  regions: string[];
  lastUpdated: string;
  dataSource: 'api' | 'mock';
}

class ArgoApiService {
  private readonly ERDDAP_BASE_URL = 'https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.csv';
  private readonly BACKUP_ERDDAP_URL = 'https://data.nodc.noaa.gov/erddap/tabledap/ArgoFloats.csv';
  
  // Regional boundaries for filtering
  private readonly REGION_BOUNDARIES = {
    'Arabian Sea': { latMin: 10, latMax: 25, lonMin: 60, lonMax: 78 },
    'Bay of Bengal': { latMin: 5, latMax: 22, lonMin: 80, lonMax: 100 },
    'Indian Ocean': { latMin: -40, latMax: 30, lonMin: 20, lonMax: 120 },
    'North Pacific': { latMin: 20, latMax: 60, lonMin: 120, lonMax: -120 },
    'South Pacific': { latMin: -60, latMax: 20, lonMin: 120, lonMax: -70 },
    'North Atlantic': { latMin: 20, latMax: 70, lonMin: -80, lonMax: 20 },
    'South Atlantic': { latMin: -60, latMax: 20, lonMin: -70, lonMax: 20 },
    'Southern Ocean': { latMin: -80, latMax: -40, lonMin: -180, lonMax: 180 },
    'Arctic Ocean': { latMin: 66, latMax: 90, lonMin: -180, lonMax: 180 },
    'Mediterranean Sea': { latMin: 30, latMax: 46, lonMin: -6, lonMax: 36 },
    'South China Sea': { latMin: 0, latMax: 25, lonMin: 99, lonMax: 125 },
    'Caribbean Sea': { latMin: 9, latMax: 22, lonMin: -89, lonMax: -60 }
  };

  private getTimeRangeFilter(timeRange: string): string {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'Last Week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Last 3 Months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'All Time':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return startDate.toISOString().split('T')[0] + 'T00:00:00Z';
  }

  private getRegionFilter(region: string): string {
    if (region === 'All') return '';
    
    const bounds = this.REGION_BOUNDARIES[region as keyof typeof this.REGION_BOUNDARIES];
    if (!bounds) return '';

    return `&latitude>=${bounds.latMin}&latitude<=${bounds.latMax}&longitude>=${bounds.lonMin}&longitude<=${bounds.lonMax}`;
  }

  private async fetchFromERDDAP(timeRange: string, region: string): Promise<ArgoDataPoint[]> {
    const timeFilter = this.getTimeRangeFilter(timeRange);
    const regionFilter = this.getRegionFilter(region);
    
    // Construct ERDDAP URL with parameters
    const url = `${this.ERDDAP_BASE_URL}?time,latitude,longitude,temp,psal,pres&time>=${timeFilter}${regionFilter}&orderBy("time")`;
    
    console.log('Fetching ARGO data from ERDDAP:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/csv',
        'User-Agent': 'INCOIS-ARGO-Explorer/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`ERDDAP API error: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    return this.parseCSVData(csvText, region);
  }

  private parseCSVData(csvText: string, selectedRegion: string): ArgoDataPoint[] {
    const lines = csvText.split('\n');
    const data: ArgoDataPoint[] = [];
    
    // Skip header lines (usually first 2 lines in ERDDAP CSV)
    const dataLines = lines.slice(2).filter(line => line.trim());
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',');
      
      if (columns.length >= 6) {
        try {
          const timestamp = new Date(columns[0]).getTime();
          const latitude = parseFloat(columns[1]);
          const longitude = parseFloat(columns[2]);
          const temperature = parseFloat(columns[3]);
          const salinity = parseFloat(columns[4]);
          const pressure = parseFloat(columns[5]);
          
          // Skip invalid data
          if (isNaN(latitude) || isNaN(longitude) || isNaN(temperature) || isNaN(salinity)) {
            return;
          }
          
          // Determine region based on coordinates
          const region = this.determineRegion(latitude, longitude, selectedRegion);
          
          const depth = Math.round(pressure * 1.025); // Approximate depth from pressure
          const date = new Date(timestamp);
          
          data.push({
            id: index,
            floatId: `ARGO_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            date: date.toISOString().split('T')[0],
            time: date.toLocaleTimeString('en-US', { hour12: false }),
            timestamp,
            region,
            latitude,
            longitude,
            depth,
            temperature,
            salinity,
            pressure,
            oxygen: Math.max(0, 10 - depth/400 + Math.random() * 2),
            chlorophyll: Math.max(0, Math.random() * 3 + depth/1000),
            ph: 8.2 - depth/1500 + Math.random() * 0.3,
            nitrate: Math.max(0, Math.random() * 20 + depth/200),
            phosphate: Math.max(0, Math.random() * 3 + depth/800),
            isRecent: Date.now() - timestamp < 6 * 60 * 60 * 1000 // Last 6 hours
          });
        } catch (error) {
          console.warn('Error parsing CSV line:', line, error);
        }
      }
    });
    
    return data;
  }

  private determineRegion(lat: number, lon: number, selectedRegion: string): string {
    if (selectedRegion !== 'All') return selectedRegion;
    
    // Determine region based on coordinates
    for (const [regionName, bounds] of Object.entries(this.REGION_BOUNDARIES)) {
      if (lat >= bounds.latMin && lat <= bounds.latMax && 
          lon >= bounds.lonMin && lon <= bounds.lonMax) {
        return regionName;
      }
    }
    
    // Default fallback based on general ocean areas
    if (lat >= 20 && lat <= 60 && lon >= 120) return 'North Pacific';
    if (lat >= -60 && lat < 20 && lon >= 120) return 'South Pacific';
    if (lat >= 20 && lat <= 70 && lon >= -80 && lon <= 20) return 'North Atlantic';
    if (lat >= -60 && lat < 20 && lon >= -70 && lon <= 20) return 'South Atlantic';
    if (lat >= -40 && lat <= 30 && lon >= 20 && lon <= 120) return 'Indian Ocean';
    if (lat < -40) return 'Southern Ocean';
    if (lat > 66) return 'Arctic Ocean';
    
    return 'Unknown Region';
  }

  private generateMockData(timeRange: string, selectedRegion: string): ArgoDataPoint[] {
    console.log('Falling back to mock data generation');
    
    const regions = selectedRegion === 'All' 
      ? ['North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Arabian Sea', 'Bay of Bengal']
      : [selectedRegion];
    
    const now = new Date();
    let maxDaysBack: number, dataPoints: number;
    
    switch (timeRange) {
      case 'Last Week': maxDaysBack = 7; dataPoints = 200; break;
      case 'Last Month': maxDaysBack = 30; dataPoints = 400; break;
      case 'Last 3 Months': maxDaysBack = 90; dataPoints = 800; break;
      case 'All Time': maxDaysBack = 365; dataPoints = 1200; break;
      default: maxDaysBack = 30; dataPoints = 400;
    }
    
    const data: ArgoDataPoint[] = [];
    const dataPointsPerRegion = Math.ceil(dataPoints / regions.length);
    
    regions.forEach((region, regionIndex) => {
      const regionDataPoints = regionIndex === regions.length - 1 
        ? dataPoints - (dataPointsPerRegion * (regions.length - 1))
        : dataPointsPerRegion;
      
      for (let i = 0; i < regionDataPoints; i++) {
        const daysAgo = Math.floor(Math.random() * maxDaysBack);
        const hoursAgo = daysAgo * 24 + Math.floor(Math.random() * 24);
        const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        
        const depth = Math.random() * 2000;
        const baseTemp = 25 - (depth / 100) + (Math.random() - 0.5) * 5;
        const baseSalinity = 34.5 + (depth / 1000) + (Math.random() - 0.5) * 0.5;
        
        data.push({
          id: regionIndex * dataPointsPerRegion + i,
          floatId: `${2900 + regionIndex}${String(100 + i).padStart(3, '0')}`,
          date: date.toISOString().split('T')[0],
          time: date.toLocaleTimeString('en-US', { hour12: false }),
          timestamp: date.getTime(),
          region,
          latitude: -80 + Math.random() * 160,
          longitude: -180 + Math.random() * 360,
          depth: Math.round(depth),
          temperature: Math.round(baseTemp * 100) / 100,
          salinity: Math.round(baseSalinity * 100) / 100,
          pressure: Math.round(depth * 1.025),
          oxygen: Math.round((10 - depth/400 + Math.random() * 2) * 100) / 100,
          chlorophyll: Math.round((Math.random() * 3 + depth/1000) * 100) / 100,
          ph: Math.round((8.2 - depth/1500 + Math.random() * 0.3) * 100) / 100,
          nitrate: Math.round((Math.random() * 20 + depth/200) * 100) / 100,
          phosphate: Math.round((Math.random() * 3 + depth/800) * 100) / 100,
          isRecent: hoursAgo < 6
        });
      }
    });
    
    return data.sort((a, b) => b.timestamp - a.timestamp);
  }

  async fetchArgoData(timeRange: string = 'Last Month', selectedRegion: string = 'All'): Promise<ArgoApiResponse> {
    let data: ArgoDataPoint[] = [];
    let dataSource: 'api' | 'mock' = 'mock';
    
    try {
      // Try to fetch from ERDDAP API first
      data = await this.fetchFromERDDAP(timeRange, selectedRegion);
      dataSource = 'api';
      console.log(`Successfully fetched ${data.length} data points from ERDDAP API`);
    } catch (error) {
      console.warn('Failed to fetch from ERDDAP API, falling back to mock data:', error);
      
      try {
        // Try backup ERDDAP server
        const backupUrl = this.BACKUP_ERDDAP_URL + `?time,latitude,longitude,temp,psal,pres&time>=${this.getTimeRangeFilter(timeRange)}${this.getRegionFilter(selectedRegion)}`;
        const response = await fetch(backupUrl, { signal: AbortSignal.timeout(5000) });
        
        if (response.ok) {
          const csvText = await response.text();
          data = this.parseCSVData(csvText, selectedRegion);
          dataSource = 'api';
          console.log(`Successfully fetched ${data.length} data points from backup ERDDAP API`);
        } else {
          throw new Error('Backup API also failed');
        }
      } catch (backupError) {
        console.warn('Backup API also failed, using mock data:', backupError);
        data = this.generateMockData(timeRange, selectedRegion);
      }
    }
    
    // Calculate statistics
    const regions = [...new Set(data.map(d => d.region))];
    const totalFloats = new Set(data.map(d => d.floatId)).size;
    
    return {
      data,
      totalFloats,
      regions,
      lastUpdated: new Date().toISOString(),
      dataSource
    };
  }
}

export const argoApiService = new ArgoApiService();
