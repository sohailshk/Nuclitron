import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArgoDataGraphs from "./ArgoDataGraphs";
import { useArgoData } from "./ArgoDataGraphs";
import { ArgoDataPoint } from "@/types/argo";
import { BarChart3, Activity, Filter, TrendingUp, RefreshCw } from "lucide-react";

// Custom hook to get ARGO data
const useArgoStats = (timeRange = 'Last Month', selectedRegion = 'All') => {
  const { 
    data, 
    isLoading, 
    error, 
    totalFloats, 
    lastUpdated, 
    dataSource, 
    refetch 
  } = useArgoData(timeRange, selectedRegion);
  
  const stats = useMemo(() => {
    if (isLoading || !data?.length) {
      return {
        totalFloats: 0,
        dataPoints: 0,
        regions: 0,
        lastUpdated: null as Date | null,
        dataSource: 'mock' as 'api' | 'mock'
      };
    }
    
    const uniqueRegions = new Set(data.map((item) => item.region));
    
    return {
      totalFloats,
      dataPoints: data.length,
      regions: uniqueRegions.size,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : new Date(),
      dataSource
    };
  }, [data, isLoading, totalFloats, lastUpdated, dataSource]);
  
  return { 
    stats, 
    isLoading, 
    error, 
    refetch 
  };
};

export const ArgoExplorer = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [timeRange, setTimeRange] = useState<string>('Last Month');
  
  const { stats, isLoading, refetch } = useArgoStats(timeRange, selectedRegion);
  
  // Handle refresh action
  const handleRefresh = async () => {
    try {
      await refetch();
      // The UI will update automatically through the isLoading state
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };
  
  const regions = useMemo(() => ['All', 'Arabian Sea', 'Bay of Bengal', 'Indian Ocean', 'South China Sea'], []);
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: '🌡️', color: 'bg-chart-temperature' },
    { id: 'salinity', name: 'Salinity', icon: '🧂', color: 'bg-chart-salinity' },
    { id: 'depth', name: 'Depth', icon: '🌊', color: 'bg-chart-depth' },
    { id: 'bgc', name: 'BGC', icon: '🔬', color: 'bg-chart-bgc' }
  ];
  
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return '--';
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  return (
    <section className="py-16 bg-gradient-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-deep mb-4">ARGO Data Analytics</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive charts and data visualization for oceanographic measurements from autonomous ARGO floats
          </p>
        </div>

        {/* Control Panel */}
        <div className="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filter by:</span>
              </div>
              <select 
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={isLoading}
                aria-label="Select region"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
              
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Focus Parameter:</span>
              <div className="flex gap-2 flex-wrap">
                {parameters.map(param => (
                  <Badge 
                    key={param.id}
                    variant="secondary"
                    className={`cursor-pointer transition-all whitespace-nowrap ${
                      selectedParameter === param.id 
                        ? `${param.color} text-white hover:${param.color}/90` 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedParameter(param.id)}
                  >
                    {param.icon} {param.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing data from the {timeRange.toLowerCase()}
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                disabled={isLoading}
                aria-label="Select time range"
              >
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="All Time">All Time</option>
              </select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 transition-colors"
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">Active Floats</p>
                    {isLoading && <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>}
                  </div>
                  <p className="text-2xl font-bold text-primary-deep">
                    {isLoading ? '--' : stats.totalFloats.toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold text-chart-temperature">
                    {isLoading ? '--' : stats.dataPoints.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-chart-temperature" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Regions Covered</p>
                  <p className="text-2xl font-bold text-chart-salinity">
                    {isLoading ? '--' : stats.regions}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-chart-salinity" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-2xl font-bold text-chart-bgc">
                    {isLoading ? '--' : formatTimeAgo(stats.lastUpdated)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-chart-bgc" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-blue-500">🌊</span> Regional Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Lowest salinity detected in South China Sea (34.2 PSU) - optimal for marine biodiversity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Arabian Sea showing temperature anomaly (+2.3°C) in upper 100m layer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Bay of Bengal: Strong stratification observed, affecting vertical mixing</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-red-500">⚠️</span> Cautionary Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Indian Ocean (15°S-20°S): Oxygen minimum zone expanding - avoid deep fishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Arabian Sea coastal waters: High chlorophyll concentration indicating algal bloom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Bay of Bengal: Cyclonic conditions developing, navigation advisory issued</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Component */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-primary-deep">Interactive Data Analytics</h3>
              <p className="text-muted-foreground">
                {selectedRegion === 'All' 
                  ? 'Real-time global ARGO oceanographic data analysis' 
                  : `Real-time ARGO data analysis for ${selectedRegion} region`}
              </p>
            </div>
          </div>
          <ArgoDataGraphs />
        </div>
      </div>
    </section>
  );
};