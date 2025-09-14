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
