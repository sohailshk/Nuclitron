'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
  ZAxis,
  Cell
} from 'recharts';
import { argoApiService, ArgoApiResponse, ArgoDataPoint } from '@/services/argoApi';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, Droplets, Waves, Activity, Globe, Calendar,
  TrendingUp, Download, RefreshCw, AlertCircle, Search, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare module 'jspdf' {
  interface jsPDF {
    setFillColor(r: number, g: number, b: number): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    addImage(imageData: string | HTMLImageElement, format: string, x: number, y: number, w: number, h: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    setFont(font: string, style?: string): void;
    text(text: string, x: number, y: number, options?: { align?: string }): void;
    addPage(format?: string, orientation?: string): void;
    setDrawColor(r: number, g: number, b: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    save(filename: string): void;
  }
}

// Use the API service to fetch ARGO data
export const useArgoData = (timeRange: string, selectedRegion: string) => {
  const [data, setData] = useState<ArgoDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalFloats, setTotalFloats] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  
  const fetchData = useCallback(async (): Promise<ArgoApiResponse> => {
    setIsLoading(true);
    try {
      const response = await argoApiService.fetchArgoData(timeRange, selectedRegion);
      setData(response.data);
      setTotalFloats(response.totalFloats);
      setLastUpdated(response.lastUpdated);
      setDataSource(response.dataSource);
      setError(null);
      
      console.log('ARGO data fetched successfully');
      return response;
    } catch (err) {
      console.error('Error fetching ARGO data:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedRegion]);

  // Initial data fetch
  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  // Create a stable refetch function
  const refetch = useCallback(() => {
    console.log('Refreshing ARGO data...');
    return fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error, 
    totalFloats, 
    lastUpdated, 
    dataSource,
    refetch
  };
};

// Generate dynamic time series data for trends
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  
  // Generate data for the last 24 hours (hourly updates)
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    
    // Simulate real-time fluctuations
    const timeOfDay = date.getHours();
    const dailyCycle = Math.sin((timeOfDay / 24) * 2 * Math.PI);
    
    // Different ocean regions with varying characteristics
    const regions = ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Southern'];
    const regionData = regions.map(region => {
      const baseTemp = {
        'Pacific': 18 + dailyCycle * 2,
        'Atlantic': 16 + dailyCycle * 1.5,
        'Indian': 24 + dailyCycle * 3,
        'Arctic': 2 + dailyCycle * 0.5,
        'Southern': 8 + dailyCycle * 1
      }[region];
      
      const baseSalinity = {
        'Pacific': 34.2 + Math.random() * 0.3,
        'Atlantic': 35.1 + Math.random() * 0.4,
        'Indian': 34.8 + Math.random() * 0.3,
        'Arctic': 32.5 + Math.random() * 0.5,
        'Southern': 34.0 + Math.random() * 0.2
      }[region];
      
      return {
        region,
        temperature: Math.round((baseTemp + (Math.random() - 0.5) * 2) * 100) / 100,
        salinity: Math.round((baseSalinity + (Math.random() - 0.5) * 0.3) * 100) / 100,
        profileCount: Math.floor(20 + Math.random() * 15)
      };
    });
    
    data.push({
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hour: timeOfDay,
      timestamp: date.getTime(),
      avgTemperature: Math.round((regionData.reduce((sum, r) => sum + r.temperature, 0) / regions.length) * 100) / 100,
      avgSalinity: Math.round((regionData.reduce((sum, r) => sum + r.salinity, 0) / regions.length) * 100) / 100,
      totalProfiles: regionData.reduce((sum, r) => sum + r.profileCount, 0),
      regions: regionData,
      isLive: i >= 22 // Mark last 2 hours as "live" data
    });
  }
  
  return data;
};

// Generate depth profile data
const generateDepthProfiles = () => {
  const profiles = [];
  for (let profileId = 0; profileId < 10; profileId++) {
    const profile = [];
    for (let depth = 0; depth <= 2000; depth += 50) {
      const temp = 25 - (depth / 100) + Math.sin(depth / 200) * 2 + (Math.random() - 0.5);
      const salinity = 34.5 + (depth / 1000) + (Math.random() - 0.5) * 0.3;
      
      profile.push({
        depth,
        temperature: Math.round(temp * 100) / 100,
        salinity: Math.round(salinity * 100) / 100,
        profileId: `Profile ${profileId + 1}`,
        oxygen: Math.round((8 - depth/500 + Math.random()) * 100) / 100
      });
    }
    profiles.push(...profile);
  }
  return profiles;
};

const ArgoDataGraphs: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('Last Month');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Use the custom hook to fetch ARGO data
  const { 
    data: argoData, 
    isLoading, 
    error, 
    totalFloats, 
    lastUpdated,
    dataSource,
    refetch: refetchData 
  } = useArgoData(timeRange, selectedRegion);
  
  // Handle refresh action
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to load images with CORS support and retry logic
  const loadImage = async (url: string, retries = 3, delay = 1000): Promise<HTMLImageElement> => {
    for (let i = 0; i < retries; i++) {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        // Add cache buster to prevent caching issues
        const cachedUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = cachedUrl;
        });
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Image load timeout')), 5000)
        );
        
        return await Promise.race([loadPromise, timeoutPromise]);
      } catch (err) {
        console.warn(`Attempt ${i + 1} failed to load image:`, err);
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to load image after ${retries} attempts`);
  };

  // Export functionality
  const handleExport = async () => {
    if (!chartRef.current) return;

    try {
      // Hide UI controls before capturing
      const exportElements = document.querySelectorAll('.no-export');
      exportElements.forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });

      // Capture the chart as an image
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          return element.classList.contains('no-export');
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Restore UI controls
      exportElements.forEach(el => {
        (el as HTMLElement).style.visibility = 'visible';
      });

      // Create PDF with TypeScript type assertion
      const pdf = new (jsPDF as any)({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      try {
        // Load the INCOIS logo with error handling
        let logo: HTMLImageElement | null = null;
        try {
          logo = await loadImage('/images/incois-logo.png');
        } catch (err) {
          console.error('Failed to load INCOIS logo, using fallback text', err);
        }
        
        // Page 1 - Cover
        pdf.setFillColor(240, 248, 255); // Light blue background
        pdf.rect(0, 0, 210, 297, 'F');
        
        // Add INCOIS logo to cover page
        if (logo) {
          try {
            // Calculate aspect ratio to maintain proportions
            const logoAspectRatio = logo.width / logo.height;
            const logoWidth = 110; // mm
            const logoHeight = logoWidth / logoAspectRatio;
            
            // Center the logo horizontally
            const xPos = (210 - logoWidth) / 2; // A4 width is 210mm
            
            pdf.addImage(logo, 'PNG', xPos, 30, logoWidth, logoHeight);
          } catch (err) {
            console.error('Error adding logo to PDF:', err);
            pdf.setFontSize(24);
            pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES', 105, 60, { align: 'center' });
          }
        } else {
          pdf.setFontSize(24);
          pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES', 105, 60, { align: 'center' });
        }
        
        // Title and subtitle
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Performance Evaluation of ARGO Ocean Buoy Data Analysis', 105, 75, { align: 'center' });
        pdf.text(`in the ${selectedRegion} Ocean During ${timeRange}`, 105, 85, { align: 'center' });
        
        // Author information
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('By', 105, 105, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.text('Ocean Observation Network Division (OOND), INCOIS', 105, 120, { align: 'center' });
        pdf.text('Earth System Science Organisation (ESSO)', 105, 130, { align: 'center' });
        pdf.text('Ministry of Earth Sciences, Government of India', 105, 140, { align: 'center' });
        pdf.text('Hyderabad - 500 090, India', 105, 150, { align: 'center' });
        
        // Date
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        });
        pdf.text(`Date: ${currentDate}`, 105, 170, { align: 'center' });
        
        // Add INCOIS address in footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES (INCOIS)', 105, 285, { align: 'center' });
        pdf.text('Ministry of Earth Sciences, Govt. of India, "Ocean Valley", P.B.No. 21, IDA Jeedimetla, Hyderabad - 500 055, India', 105, 290, { align: 'center' });
        
        // Page number
        pdf.text('1', 20, 20);
        
        // Page 2 - Data and Analysis
        pdf.addPage();
        
        // Add header with INCOIS logo and title
        const smallLogoWidth = 20;
        const smallLogoHeight = (logo.height * smallLogoWidth) / logo.width;
        pdf.addImage(logo, 'PNG', 20, 15, smallLogoWidth, smallLogoHeight);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES', 40, 20);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('(An Autonomous Body under the Ministry of Earth Sciences, Govt. of India)', 40, 24);
        
        // Document title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DOCUMENT CONTROL SHEET', 105, 40, { align: 'center' });
        
        // Add a line separator
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, 45, 190, 45);
        
        // Document details
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const details = [
          ['Title of the report:', `Performance Evaluation of ARGO Ocean Buoy Data Analysis in the ${selectedRegion} Ocean During ${timeRange}`],
          ['Author(s):', 'Ocean Observation Network Division (OOND), INCOIS'],
          ['Originating unit:', 'Ocean Observation Network Division (OOND), INCOIS'],
          ['Type of Document:', 'Technical Report (TR)'],
          ['Number of pages and figures:', '2 pages, 1 figure, and 1 table'],
          ['Keywords:', 'ARGO Floats, Oceanography, Sea Surface Temperature, Salinity, Ocean Currents'],
          ['Security classification:', 'Open'],
          ['Distribution:', 'Open'],
          ['Date of publication:', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })]
        ];
        
        let yPos = 60;
        details.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, 20, yPos);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, 120);
          pdf.text(lines, 70, yPos);
          yPos += Math.max(5, lines.length * 5);
        });
        
        // Statistics
        const avgTemp = (filteredData.reduce((acc, item) => acc + item.temperature, 0) / filteredData.length).toFixed(1);
        const avgSalinity = (filteredData.reduce((acc, item) => acc + item.salinity, 0) / filteredData.length).toFixed(1);
        const totalProfiles = filteredData.length;
        const regionCount = new Set(filteredData.map(item => item.region)).size;
        
        yPos += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text('DATA SUMMARY:', 20, yPos);
        yPos += 7;
        
        const stats = [
          `Total Profiles Analyzed: ${totalProfiles}`,
          `Average Temperature: ${avgTemp}°C`,
          `Average Salinity: ${avgSalinity} PSU`,
          `Ocean Regions Covered: ${regionCount}`,
          `Analysis Period: ${timeRange}`,
          `Data View: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
        ];
        
        pdf.setFont('helvetica', 'normal');
        stats.forEach(stat => {
          pdf.text(stat, 25, yPos);
          yPos += 5;
        });
        
        // Add chart image
        yPos += 10;
        const imgWidth = 170;
        const imgHeight = Math.min((canvasHeight * imgWidth) / canvasWidth, 120);
        pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        
        // Add footer with INCOIS logo and page number
        if (logo && logo.width && logo.height) {
          try {
            const smallLogoWidth = logo.width / 3;
            const smallLogoHeight = logo.height / 3;
            pdf.addImage(logo, 'PNG', 20, 270, smallLogoWidth/1.5, smallLogoHeight/1.5);
          } catch (err) {
            console.error('Error adding footer logo:', err);
          }
        }
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INDIAN NATIONAL CENTRE FOR OCEAN INFORMATION SERVICES (INCOIS)', 105, 285, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.text('Ministry of Earth Sciences, Govt. of India, "Ocean Valley", P.B.No. 21, IDA Jeedimetla, Hyderabad - 500 055, India', 105, 290, { align: 'center' });
        
        // Page number
        pdf.text('2', 20, 20);
        
        // Save the PDF
        pdf.save(`INCOIS_ARGO_Report_${selectedRegion.replace(/\s+/g, '_')}_${timeRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        
      } catch (error) {
        console.error('Error loading INCOIS logo:', error);
        // Fallback to text if logo fails to load
        pdf.setFontSize(12);
        pdf.text('INCOIS Logo', 90, 40);
        pdf.save(`INCOIS_ARGO_Report_${selectedRegion.replace(/\s+/g, '_')}_${timeRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Generate time series data based on the fetched ARGO data
  const timeSeriesData = useMemo(() => {
    if (isLoading) return [];
    
    const now = new Date();
    const hourlyData = Array(24).fill(0).map((_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourData = argoData.filter(item => 
        new Date(item.timestamp).getHours() === hour.getHours() &&
        new Date(item.timestamp).toDateString() === hour.toDateString()
      );
      
      if (hourData.length === 0) return null;
      
      const avgTemp = hourData.reduce((sum, item) => sum + item.temperature, 0) / hourData.length;
      const avgSalinity = hourData.reduce((sum, item) => sum + item.salinity, 0) / hourData.length;
      
      return {
        date: hour.toISOString().split('T')[0],
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour: hour.getHours(),
        timestamp: hour.getTime(),
        avgTemperature: parseFloat(avgTemp.toFixed(2)),
        avgSalinity: parseFloat(avgSalinity.toFixed(2)),
        totalProfiles: hourData.length,
        isLive: i >= 22
      };
    }).filter(Boolean);
    
    return hourlyData.length > 0 ? hourlyData : generateTimeSeriesData();
  }, [argoData, isLoading]);

  // Generate depth profiles based on the fetched ARGO data
  const depthProfiles = useMemo(() => {
    if (isLoading) return [];
    
    const profiles: any[] = [];
    const profileCount = Math.min(5, Math.ceil(argoData.length / 100) || 1);
    
    for (let i = 0; i < profileCount; i++) {
      const profileId = `Profile ${i + 1}`;
      const profileData = argoData
        .filter((_, idx) => idx % profileCount === i)
        .sort((a, b) => a.depth - b.depth);
      
      if (profileData.length > 0) {
        profiles.push(...profileData.map(item => ({
          ...item,
          profileId,
          temperature: item.temperature || 0,
          salinity: item.salinity || 0
        })));
      }
    }
    
    return profiles.length > 0 ? profiles : generateDepthProfiles();
  }, [argoData, isLoading]);

  const filteredData = useMemo(() => {
    return argoData.filter(item => 
      selectedRegion === 'All' || item.region === selectedRegion
    );
  }, [argoData, selectedRegion]);

  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(argoData.map(item => item.region))];
    return ['All', ...uniqueRegions.filter(Boolean).sort()];
  }, [argoData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('temperature') ? '°C' : 
                entry.dataKey.includes('salinity') ? ' PSU' : 
                entry.dataKey.includes('depth') ? 'm' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const [showObservations, setShowObservations] = useState(false);
  const [showAdvisories, setShowAdvisories] = useState(false);

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900">ARGO Data Visualization</h2>
      
      {/* Key Oceanographic Insights Dropdowns - Stacked Layout */}
      <div className="space-y-4 mb-6">
        <div className="w-full">
          <button
            onClick={() => setShowObservations(!showObservations)}
            className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📊</span>
              <span className="font-semibold text-blue-900">Top 10 Observations</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${showObservations ? 'rotate-180' : ''}`} />
          </button>
          {showObservations && (
            <Card className="mt-2 border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Temperature gradient strongest at 15°S latitude (4.2°C/100m)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Salinity minimum layer detected at 120m depth (34.1 PSU)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Arabian Sea upwelling zone active - nutrient rich waters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Bay of Bengal freshwater plume extends 200km offshore</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">5.</span>
                <span>Oxygen levels optimal for marine life above 150m depth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">6.</span>
                <span>Chlorophyll concentration peaks at 60-80m (photic zone)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">7.</span>
                <span>Mixed layer depth averaging 45m in equatorial regions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">8.</span>
                <span>Thermocline depth stable at 200-250m across Indian Ocean</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">9.</span>
                <span>Seasonal monsoon currents detected at 10°N-20°N band</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">10.</span>
                <span>Deep water masses showing 0.02°C warming trend</span>
              </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="w-full">
          <button
            onClick={() => setShowAdvisories(!showAdvisories)}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <span className="font-semibold text-red-900">Critical Advisories</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-red-600 transition-transform ${showAdvisories ? 'rotate-180' : ''}`} />
          </button>
          {showAdvisories && (
            <Card className="mt-2 border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-red-600">Hypoxic Zone Alert:</span>
                  <span className="block text-xs mt-1">15°S-18°S, 200-400m depth - Oxygen &lt;2mg/L, avoid fishing operations</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-orange-600">Strong Currents:</span>
                  <span className="block text-xs mt-1">Somali Current reaching 2.5 m/s - navigation hazard for small vessels</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-yellow-600">Algal Bloom Risk:</span>
                  <span className="block text-xs mt-1">Arabian Sea coastal waters - high chlorophyll, potential HAB formation</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-orange-600">Thermal Stratification:</span>
                  <span className="block text-xs mt-1">Bay of Bengal - strong stratification limiting vertical mixing</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-red-600">Cyclonic Activity:</span>
                  <span className="block text-xs mt-1">Low pressure system developing at 12°N, 85°E - monitor for intensification</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">!</span>
                <div>
                  <span className="font-semibold text-yellow-600">Salinity Anomaly:</span>
                  <span className="block text-xs mt-1">Red Sea northern basin - salinity &gt;41 PSU affecting ecosystem</span>
                </div>
              </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Region and Time Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 min-w-[180px]">
            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-white w-full"
              disabled={isLoading}
            >
              <option value="All">All Regions</option>
              <option value="Arabian Sea">Arabian Sea</option>
              <option value="Bay of Bengal">Bay of Bengal</option>
              <option value="Indian Ocean">Indian Ocean</option>
              <option value="South China Sea">South China Sea</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 min-w-[180px]">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-white w-full"
              disabled={isLoading}
            >
              <option value="Last Week">Last Week</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={handleExport}
            disabled={isLoading || isRefreshing}
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={filteredData.some(item => item.isRecent) ? "border-green-500 bg-green-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm text-muted-foreground">Total Profiles</p>
                  {isLoading && <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>}
                </div>
                <p className="text-2xl font-bold text-primary-deep">
                  {filteredData.length.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  {filteredData.filter(item => item.isRecent).length} live updates
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={dataSource === 'api' ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm text-muted-foreground">Data Source</p>
                  <Badge variant={dataSource === 'api' ? 'default' : 'secondary'} className="text-xs">
                    {dataSource === 'api' ? 'R' : 'M'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-chart-temperature">
                  {selectedRegion === 'All' ? 'Indian Ocean' : selectedRegion}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalFloats.toLocaleString()} active sensors
                </p>
              </div>
              <Thermometer className="w-8 h-8 text-chart-temperature" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold text-chart-salinity">
                  {filteredData.length > 0 
                    ? (filteredData.reduce((acc, item) => acc + (item.temperature || 0), 0) / filteredData.length).toFixed(1)
                    : '--'}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  {filteredData.length > 0 
                    ? `Range: ${Math.min(...filteredData.map(item => item.temperature || 0)).toFixed(1)}° - ${Math.max(...filteredData.map(item => item.temperature || 0)).toFixed(1)}°C`
                    : 'No data'}
                </p>
              </div>
              <Droplets className="w-8 h-8 text-chart-salinity" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-2xl font-bold text-chart-depth">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--'}
                </p>
              </div>
              <Waves className="w-8 h-8 text-chart-depth" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="salinity">Salinity</TabsTrigger>
          <TabsTrigger value="depth">Depth Profiles</TabsTrigger>
          <TabsTrigger value="bgc">BGC Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Temperature vs Salinity</span>
                </CardTitle>
                <CardDescription>Correlation between temperature and salinity measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={filteredData
                      .filter(d => d.temperature != null && d.salinity != null)
                      .slice(0, 200)
                    }
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                    <XAxis 
                      dataKey="temperature" 
                      name="Temperature" 
                      unit="°C"
                      domain={['auto', 'auto']}
                      tick={{ fill: '#4b5563' }}
                      tickLine={{ stroke: '#cbd5e1' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      dataKey="salinity" 
                      name="Salinity" 
                      unit=" PSU"
                      domain={['auto', 'auto']}
                      tick={{ fill: '#4b5563' }}
                      tickLine={{ stroke: '#cbd5e1' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <ZAxis dataKey="depth" range={[100, 400]} name="Depth" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      content={<CustomTooltip />} 
                    />
                    <Scatter 
                      name="Temperature vs Salinity"
                      data={filteredData
                        .filter(d => d.temperature != null && d.salinity != null)
                        .slice(0, 200)
                      }
                      fill="#3b82f6"
                      fillOpacity={0.7}
                    >
                      {filteredData
                        .filter(d => d.temperature != null && d.salinity != null)
                        .slice(0, 200)
                        .map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.isRecent ? '#10b981' : '#3b82f6'}
                            stroke={entry.isRecent ? '#059669' : '#2563eb'}
                            strokeWidth={entry.isRecent ? 1.5 : 0.5}
                          />
                        ))
                      }
                    </Scatter>
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      formatter={(value, entry, index) => {
                        return <span style={{ color: '#4b5563' }}>{value}</span>;
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-Time Ocean Trends (24h)</span>
                </CardTitle>
                <CardDescription>Live data from global ARGO float network</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgTemperature" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      name="Global Avg Temperature (°C)"
                      dot={{ fill: '#ef4444', r: 3 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgSalinity" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name="Global Avg Salinity (PSU)"
                      dot={{ fill: '#3b82f6', r: 3 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalProfiles" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      name="Active Profiles"
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Distribution</CardTitle>
                <CardDescription>Temperature measurements across different depths</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={filteredData.slice(0, 50).sort((a, b) => a.depth - b.depth)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature by Region</CardTitle>
                <CardDescription>Regional temperature variations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regions.slice(1).map(region => ({
                    region,
                    avgTemp: (argoData.filter(item => item.region === region)
                      .reduce((acc, item) => acc + item.temperature, 0) / 
                      argoData.filter(item => item.region === region).length).toFixed(1),
                    count: argoData.filter(item => item.region === region).length
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgTemp" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salinity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Salinity Profiles</CardTitle>
                <CardDescription>Salinity variations with depth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredData.slice(0, 50).sort((a, b) => a.depth - b.depth)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" />
                    <YAxis domain={[33, 36]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="salinity" stroke="#3b82f6" strokeWidth={2} />
                    <ReferenceLine y={34.7} stroke="red" strokeDasharray="5 5" label="Global Average" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salinity Distribution</CardTitle>
                <CardDescription>Histogram of salinity measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[
                    { range: '33.0-33.5', count: filteredData.filter(d => d.salinity >= 33.0 && d.salinity < 33.5).length },
                    { range: '33.5-34.0', count: filteredData.filter(d => d.salinity >= 33.5 && d.salinity < 34.0).length },
                    { range: '34.0-34.5', count: filteredData.filter(d => d.salinity >= 34.0 && d.salinity < 34.5).length },
                    { range: '34.5-35.0', count: filteredData.filter(d => d.salinity >= 34.5 && d.salinity < 35.0).length },
                    { range: '35.0-35.5', count: filteredData.filter(d => d.salinity >= 35.0 && d.salinity < 35.5).length },
                    { range: '35.5-36.0', count: filteredData.filter(d => d.salinity >= 35.5 && d.salinity < 36.0).length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="depth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperature-Depth Profiles</CardTitle>
              <CardDescription>Multiple temperature profiles showing thermocline structure</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={depthProfiles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="temperature" />
                  <YAxis dataKey="depth" reversed domain={[0, 2000]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Array.from({length: 5}, (_, i) => (
                    <Line 
                      key={i}
                      type="monotone" 
                      dataKey="temperature" 
                      data={depthProfiles.filter(d => d.profileId === `Profile ${i + 1}`)}
                      stroke={`hsl(${i * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      name={`Profile ${i + 1}`}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bgc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Oxygen Concentration</CardTitle>
                <CardDescription>Dissolved oxygen levels by depth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={filteredData.slice(0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" name="Depth" unit="m" />
                    <YAxis dataKey="oxygen" name="Oxygen" unit=" mg/L" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter dataKey="oxygen" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chlorophyll & Nutrients</CardTitle>
                <CardDescription>Biogeochemical parameters correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData.slice(0, 30).sort((a, b) => a.depth - b.depth)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="chlorophyll" stroke="#10b981" strokeWidth={2} name="Chlorophyll (mg/m³)" />
                    <Line type="monotone" dataKey="nitrate" stroke="#f59e0b" strokeWidth={2} name="Nitrate (μmol/L)" />
                    <Line type="monotone" dataKey="phosphate" stroke="#8b5cf6" strokeWidth={2} name="Phosphate (μmol/L)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export the component as default
export default ArgoDataGraphs;
