"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Search, 
  Filter, 
  Download,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Thermometer,
  Droplets,
  Waves,
  Activity,
  Globe,
  Clock,
  Eye,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square
} from "lucide-react";
import { useState, useEffect } from "react";

interface ArgoFloat {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdate: string;
  temperature: number;
  salinity: number;
  depth: number;
  region: string;
  cycle: number;
}

export default function Explorer() {
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'ocean'>('ocean');

  // Mock ARGO float data
  const argoFloats: ArgoFloat[] = [
    {
      id: 'ARGO-2901234',
      name: 'Arabian Sea Float 1',
      latitude: 15.5,
      longitude: 65.2,
      status: 'active',
      lastUpdate: '2 min ago',
      temperature: 28.5,
      salinity: 35.2,
      depth: 1500,
      region: 'Arabian Sea',
      cycle: 245
    },
    {
      id: 'ARGO-2901235',
      name: 'Bay of Bengal Float 2',
      latitude: 18.2,
      longitude: 88.1,
      status: 'active',
      lastUpdate: '5 min ago',
      temperature: 29.1,
      salinity: 34.8,
      depth: 1800,
      region: 'Bay of Bengal',
      cycle: 198
    },
    {
      id: 'ARGO-2901236',
      name: 'Indian Ocean Float 3',
      latitude: -5.3,
      longitude: 75.8,
      status: 'active',
      lastUpdate: '8 min ago',
      temperature: 27.8,
      salinity: 35.5,
      depth: 2000,
      region: 'Indian Ocean',
      cycle: 312
    },
    {
      id: 'ARGO-2901237',
      name: 'South China Sea Float 4',
      latitude: 12.1,
      longitude: 110.5,
      status: 'maintenance',
      lastUpdate: '12 min ago',
      temperature: 30.2,
      salinity: 34.2,
      depth: 1200,
      region: 'South China Sea',
      cycle: 156
    },
    {
      id: 'ARGO-2901238',
      name: 'Red Sea Float 5',
      latitude: 22.8,
      longitude: 38.9,
      status: 'active',
      lastUpdate: '15 min ago',
      temperature: 31.5,
      salinity: 38.1,
      depth: 800,
      region: 'Red Sea',
      cycle: 89
    }
  ];

  const regions = ['All', 'Arabian Sea', 'Bay of Bengal', 'Indian Ocean', 'South China Sea', 'Red Sea'];
  const statuses = ['All', 'active', 'inactive', 'maintenance'];

  const filteredFloats = argoFloats.filter(float => {
    const matchesSearch = float.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         float.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || float.region === selectedRegion;
    const matchesStatus = selectedStatus === 'All' || float.status === selectedStatus;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'maintenance': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary-deep mb-2">
                  ARGO Data Explorer
                </h1>
                <p className="text-muted-foreground">
                  Interactive map and data exploration for ARGO float network
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search floats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
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
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Map Container */}
            <div className="lg:col-span-3">
              <Card className="card-ocean h-[600px] relative overflow-hidden">
                {/* Map Header */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">ARGO Float Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex bg-white/90 backdrop-blur-sm rounded-lg">
                        {(['ocean', 'satellite', 'terrain'] as const).map((view) => (
                          <Button
                            key={view}
                            variant={mapView === view ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMapView(view)}
                            className="text-xs"
                          >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                          </Button>
                        ))}
                      </div>
                      <div className="flex bg-white/90 backdrop-blur-sm rounded-lg">
                        <Button variant="ghost" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Content */}
                <div className="w-full h-full bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-200 relative">
                  {/* Ocean Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600"></div>
                  </div>
                  
                  {/* ARGO Float Markers */}
                  {filteredFloats.map((float) => (
                    <div
                      key={float.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        left: `${((float.longitude + 180) / 360) * 100}%`,
                        top: `${((90 - float.latitude) / 180) * 100}%`
                      }}
                      onClick={() => setSelectedFloat(float)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                        selectedFloat?.id === float.id ? 'scale-150' : ''
                      } ${getStatusColor(float.status)} transition-transform duration-200`}></div>
                      {selectedFloat?.id === float.id && (
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
                          <div className="text-xs font-semibold text-primary-deep">{float.name}</div>
                          <div className="text-xs text-muted-foreground">{float.id}</div>
                          <div className="text-xs text-muted-foreground">{float.region}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Map Overlay Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm font-medium text-primary-deep mb-2">Map Info</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>View: {mapView.charAt(0).toUpperCase() + mapView.slice(1)}</div>
                      <div>Floats: {filteredFloats.length} visible</div>
                      <div>Active: {filteredFloats.filter(f => f.status === 'active').length}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Float Details */}
              {selectedFloat && (
                <Card className="card-ocean">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-primary-deep">Float Details</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFloat(null)}>
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-primary-deep">{selectedFloat.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedFloat.id}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedFloat.status)}`}></div>
                        <span className={`text-sm font-medium ${getStatusTextColor(selectedFloat.status)}`}>
                          {selectedFloat.status.charAt(0).toUpperCase() + selectedFloat.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Temperature</div>
                          <div className="font-medium text-chart-temperature">{selectedFloat.temperature}°C</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Salinity</div>
                          <div className="font-medium text-chart-salinity">{selectedFloat.salinity} PSU</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Depth</div>
                          <div className="font-medium text-chart-depth">{selectedFloat.depth}m</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Cycle</div>
                          <div className="font-medium text-chart-bgc">{selectedFloat.cycle}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground">Last Update: {selectedFloat.lastUpdate}</div>
                        <div className="text-xs text-muted-foreground">Region: {selectedFloat.region}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Profile
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Track
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Float List */}
              <Card className="card-ocean">
                <div className="p-4">
                  <h3 className="font-semibold text-primary-deep mb-4">ARGO Floats ({filteredFloats.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredFloats.map((float) => (
                      <div
                        key={float.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedFloat?.id === float.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50 hover:bg-blue-50/50'
                        }`}
                        onClick={() => setSelectedFloat(float)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-primary-deep">{float.name}</div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(float.status)}`}></div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{float.region}</div>
                          <div className="flex items-center justify-between">
                            <span>{float.temperature}°C</span>
                            <span>{float.salinity} PSU</span>
                            <span>{float.lastUpdate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="card-ocean">
                <div className="p-4">
                  <h3 className="font-semibold text-primary-deep mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Floats</span>
                      <span className="font-medium text-primary-deep">{argoFloats.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span className="font-medium text-green-600">
                        {argoFloats.filter(f => f.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Maintenance</span>
                      <span className="font-medium text-yellow-600">
                        {argoFloats.filter(f => f.status === 'maintenance').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Regions</span>
                      <span className="font-medium text-primary-deep">{regions.length - 1}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
