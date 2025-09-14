'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  ReferenceLine
} from 'recharts';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Droplets, 
  Waves, 
  Activity, 
  Calendar,
  MapPin,
  TrendingUp,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate comprehensive ARGO data with global ocean coverage
const generateArgoData = (timeRange: string, selectedRegion: string) => {
  const regions = [
    'North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic',
    'Indian Ocean', 'Southern Ocean', 'Arctic Ocean', 'Mediterranean Sea',
    'Arabian Sea', 'Bay of Bengal', 'South China Sea', 'Caribbean Sea',
    'Coral Sea', 'Tasman Sea', 'Norwegian Sea', 'Barents Sea'
  ];
  
  // Type definition for region base counts
  type RegionBaseCounts = {
    [key: string]: { base: number; count: number };
  };

  // Generate region-specific float IDs with unique counts per region
  const getRegionFloatIds = (region: string, timeRange: string) => {
    const regionBaseCounts: RegionBaseCounts = {
      'North Pacific': { base: 2901, count: 42 },
      'South Pacific': { base: 2902, count: 38 },
      'North Atlantic': { base: 2903, count: 45 },
      'South Atlantic': { base: 2904, count: 35 },
      'Indian Ocean': { base: 2905, count: 32 },
      'Southern Ocean': { base: 2906, count: 28 },
      'Arctic Ocean': { base: 2907, count: 15 },
      'Mediterranean Sea': { base: 2908, count: 22 },
      'Arabian Sea': { base: 2909, count: 18 },
      'Bay of Bengal': { base: 2910, count: 16 },
      'South China Sea': { base: 2911, count: 20 },
      'Caribbean Sea': { base: 2912, count: 15 },
      'Coral Sea': { base: 2913, count: 12 },
      'Tasman Sea': { base: 2914, count: 10 },
      'Norwegian Sea': { base: 2915, count: 8 },
      'Barents Sea': { base: 2916, count: 6 }
    };
    
    // Adjust count based on time range (more data points for longer time ranges)
    const rangeFactor = {
      'Last Week': 0.3,
      'Last Month': 0.6,
      'Last 3 Months': 0.8,
      'All Time': 1.0
    }[timeRange] || 0.6;
    
    const { base, count } = regionBaseCounts[region] || { base: 2900, count: 10 };
    const adjustedCount = Math.max(5, Math.floor(count * rangeFactor));
    
    return Array.from({length: adjustedCount}, (_, i) => {
      // Add some randomness to float IDs within each region
      const floatVariant = Math.floor(Math.random() * 100);
      return `${base}${String(100 + i).padStart(3, '0')}${String(floatVariant).padStart(2, '0')}`;
    });
  };
  const data = [];
  
  // Type definition for region characteristics
  type RegionCharacteristics = {
    [key: string]: {
      tempRange: [number, number];
      salinityRange: [number, number];
      depthRange: [number, number];
    };
  };

  // Regional characteristics for more realistic data
  const regionCharacteristics: RegionCharacteristics = {
    'North Pacific': { tempRange: [2, 20], salinityRange: [32, 35], depthRange: [0, 4000] },
    'South Pacific': { tempRange: [5, 25], salinityRange: [33, 36], depthRange: [0, 3500] },
    'North Atlantic': { tempRange: [0, 18], salinityRange: [34, 37], depthRange: [0, 5000] },
    'South Atlantic': { tempRange: [3, 22], salinityRange: [33, 36], depthRange: [0, 4500] },
    'Indian Ocean': { tempRange: [8, 30], salinityRange: [33, 37], depthRange: [0, 4000] },
    'Southern Ocean': { tempRange: [-2, 8], salinityRange: [33, 35], depthRange: [0, 6000] },
    'Arctic Ocean': { tempRange: [-2, 5], salinityRange: [28, 35], depthRange: [0, 3000] },
    'Mediterranean Sea': { tempRange: [12, 28], salinityRange: [36, 39], depthRange: [0, 2000] },
    'Arabian Sea': { tempRange: [18, 32], salinityRange: [35, 37], depthRange: [0, 3500] },
    'Bay of Bengal': { tempRange: [20, 30], salinityRange: [30, 35], depthRange: [0, 3000] },
    'South China Sea': { tempRange: [15, 30], salinityRange: [32, 35], depthRange: [0, 2500] },
    'Caribbean Sea': { tempRange: [22, 30], salinityRange: [35, 37], depthRange: [0, 2000] },
    'Coral Sea': { tempRange: [18, 28], salinityRange: [34, 36], depthRange: [0, 3000] },
    'Tasman Sea': { tempRange: [8, 22], salinityRange: [34, 36], depthRange: [0, 4000] },
    'Norwegian Sea': { tempRange: [-1, 12], salinityRange: [34, 36], depthRange: [0, 3500] },
    'Barents Sea': { tempRange: [-2, 8], salinityRange: [33, 35], depthRange: [0, 2000] }
  };

  // Determine time range parameters
  const now = new Date();
  let maxDaysBack, dataPoints;
  
  switch (timeRange) {
    case 'Last Week':
      maxDaysBack = 7;
      dataPoints = 200;
      break;
    case 'Last Month':
      maxDaysBack = 30;
      dataPoints = 400;
      break;
    case 'Last 3 Months':
      maxDaysBack = 90;
      dataPoints = 800;
      break;
    case 'All Time':
      maxDaysBack = 365;
      dataPoints = 1200;
      break;
    default:
      maxDaysBack = 30;
      dataPoints = 400;
  }
  
  // Filter regions based on selection and prepare float IDs
  const targetRegions = selectedRegion === 'All' ? regions : [selectedRegion];
  
  // Pre-generate float IDs for each region with time range consideration
  const regionFloats: { [key: string]: string[] } = targetRegions.reduce((acc, region) => ({
    ...acc,
    [region]: getRegionFloatIds(region, timeRange)
  }), {});
  
  // Calculate data points per region for balanced distribution
  const dataPointsPerRegion = Math.ceil(dataPoints / targetRegions.length);
  
  for (let region of targetRegions) {
    const regionDataPoints = region === targetRegions[targetRegions.length - 1] ? 
      dataPoints - (dataPointsPerRegion * (targetRegions.length - 1)) : 
      dataPointsPerRegion;
      
    for (let i = 0; i < regionDataPoints; i++) {
    const daysAgo = Math.floor(Math.random() * maxDaysBack);
    const hoursAgo = daysAgo * 24 + Math.floor(Math.random() * 24);
    const date = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
      const characteristics = regionCharacteristics[region];
      const regionFloatIds = regionFloats[region];
    
    const depth = Math.random() * characteristics.depthRange[1];
    const tempVariation = characteristics.tempRange[0] + 
      (characteristics.tempRange[1] - characteristics.tempRange[0]) * Math.random();
    const baseTemp = tempVariation - (depth / 200) + (Math.random() - 0.5) * 2;
    
    const salinityVariation = characteristics.salinityRange[0] + 
      (characteristics.salinityRange[1] - characteristics.salinityRange[0]) * Math.random();
    const baseSalinity = salinityVariation + (depth / 1000) + (Math.random() - 0.5) * 0.5;
    
    // Add seasonal variation based on actual date
    const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const seasonalTempAdjustment = seasonalFactor * 2;
    
    // Add historical trend (older data slightly different)
    const ageFactor = daysAgo / maxDaysBack;
    const historicalAdjustment = ageFactor * (Math.random() - 0.5) * 3;
    
    data.push({
      id: i,
      floatId: regionFloatIds[Math.floor(Math.random() * regionFloatIds.length)],
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('en-US', { hour12: false }),
      timestamp: date.getTime(),
      region,
      latitude: -80 + Math.random() * 160,
      longitude: -180 + Math.random() * 360,
      depth: Math.round(depth),
      temperature: Math.round((baseTemp + seasonalTempAdjustment + historicalAdjustment) * 100) / 100,
      salinity: Math.round((baseSalinity + historicalAdjustment * 0.1) * 100) / 100,
      pressure: Math.round(depth * 1.025),
      oxygen: Math.round((10 - depth/400 + Math.random() * 2 + historicalAdjustment * 0.5) * 100) / 100,
      chlorophyll: Math.round((Math.random() * 3 + depth/1000 + historicalAdjustment * 0.2) * 100) / 100,
      ph: Math.round((8.2 - depth/1500 + Math.random() * 0.3 + historicalAdjustment * 0.1) * 100) / 100,
      nitrate: Math.round((Math.random() * 20 + depth/200 + historicalAdjustment) * 100) / 100,
      phosphate: Math.round((Math.random() * 3 + depth/800 + historicalAdjustment * 0.3) * 100) / 100,
      isRecent: hoursAgo < 6 // Mark recent data for highlighting
    });
    }
  }
  
  // Shuffle data to mix regions (optional, can be removed if you want regions grouped)
  const shuffledData = data.sort(() => Math.random() - 0.5);
  return shuffledData.sort((a, b) => b.timestamp - a.timestamp); // Most recent first
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
  const chartRef = useRef<HTMLDivElement>(null);

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

  const argoData = useMemo(() => generateArgoData(timeRange, selectedRegion), [timeRange, selectedRegion]);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  const depthProfiles = useMemo(() => generateDepthProfiles(), []);

  const filteredData = useMemo(() => {
    return argoData.filter(item => 
      selectedRegion === 'All' || item.region === selectedRegion
    );
  }, [argoData, selectedRegion]);

  const regions = ['All', 'North Pacific', 'South Pacific', 'North Atlantic', 'South Atlantic', 'Indian Ocean', 'Southern Ocean', 'Arctic Ocean', 'Mediterranean Sea', 'Arabian Sea', 'Bay of Bengal', 'South China Sea', 'Caribbean Sea'];

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

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-white"
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-white"
          >
            <option value="Last Week">Last Week</option>
            <option value="Last Month">Last Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={handleExport}
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
                <p className="text-sm text-muted-foreground">Total Profiles</p>
                <p className="text-2xl font-bold text-primary-deep">{filteredData.length}</p>
                <p className="text-xs text-green-600">
                  {filteredData.filter(item => item.isRecent).length} live updates
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="text-2xl font-bold text-chart-temperature">
                  {(filteredData.reduce((acc, item) => acc + item.temperature, 0) / filteredData.length).toFixed(1)}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  Range: {Math.min(...filteredData.map(item => item.temperature)).toFixed(1)}° - {Math.max(...filteredData.map(item => item.temperature)).toFixed(1)}°C
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
                <p className="text-sm text-muted-foreground">Avg Salinity</p>
                <p className="text-2xl font-bold text-chart-salinity">
                  {(filteredData.reduce((acc, item) => acc + item.salinity, 0) / filteredData.length).toFixed(1)} PSU
                </p>
                <p className="text-xs text-muted-foreground">
                  Global ocean range
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
                <p className="text-sm text-muted-foreground">Ocean Regions</p>
                <p className="text-2xl font-bold text-chart-depth">
                  {new Set(filteredData.map(item => item.region)).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max depth: {Math.max(...filteredData.map(item => item.depth))}m
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
                  <ScatterChart data={filteredData.slice(0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" name="Temperature" unit="°C" />
                    <YAxis dataKey="salinity" name="Salinity" unit=" PSU" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter dataKey="salinity" fill="#3b82f6" />
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

export default ArgoDataGraphs;
