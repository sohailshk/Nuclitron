"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArgoHeatmap from "@/components/ArgoHeatmap";
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
import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function MapVisualization() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedParameter, setSelectedParameter] = useState('Temperature');

  const regions = ['All', 'Arabian Sea', 'Bay of Bengal', 'Indian Ocean', 'South China Sea', 'Red Sea'];
  const parameters = ['Temperature', 'Salinity', 'Depth', 'BGC'];

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-primary-deep mb-2">
                      ARGO Map Visualization
                    </h1>
                    <p className="text-muted-foreground">
                      Interactive heatmap visualization of ARGO float data distribution
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
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <select 
                      value={selectedParameter}
                      onChange={(e) => setSelectedParameter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-white"
                    >
                      {parameters.map(param => (
                        <option key={param} value={param}>{param}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Main Map Container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-4">
                  <Card className="card-ocean h-[700px] relative overflow-hidden">
                    <ArgoHeatmap />
                  </Card>
                </div>
              </div>

              {/* Map Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="shadow-subtle">
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary-deep mb-2">200+</div>
                    <div className="text-muted-foreground">ARGO Data Points</div>
                    <div className="text-sm text-muted-foreground mt-1">Visualized on heatmap</div>
                  </div>
                </Card>
                <Card className="shadow-subtle">
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-chart-temperature mb-2">24-31°C</div>
                    <div className="text-muted-foreground">Temperature Range</div>
                    <div className="text-sm text-muted-foreground mt-1">Indian Ocean region</div>
                  </div>
                </Card>
                <Card className="shadow-subtle">
                  <div className="p-6 text-center">
                    <div className="text-3xl font-bold text-chart-salinity mb-2">34-38 PSU</div>
                    <div className="text-muted-foreground">Salinity Range</div>
                    <div className="text-sm text-muted-foreground mt-1">Practical Salinity Units</div>
                  </div>
                </Card>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="shadow-subtle">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary-deep mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Interactive Features
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center">
                        <Search className="w-4 h-4 mr-2 text-primary" />
                        Search locations (e.g., Mumbai, Chennai)
                      </li>
                      <li className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        Toggle heatmap visibility
                      </li>
                      <li className="flex items-center">
                        <ZoomIn className="w-4 h-4 mr-2 text-primary" />
                        Zoom and pan controls
                      </li>
                      <li className="flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-primary" />
                        Ocean-themed styling
                      </li>
                    </ul>
                  </div>
                </Card>
                <Card className="shadow-subtle">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary-deep mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Data Insights
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-chart-temperature" />
                        Global ARGO float distribution
                      </li>
                      <li className="flex items-center">
                        <Thermometer className="w-4 h-4 mr-2 text-chart-temperature" />
                        Temperature intensity mapping
                      </li>
                      <li className="flex items-center">
                        <Droplets className="w-4 h-4 mr-2 text-chart-salinity" />
                        Salinity concentration areas
                      </li>
                      <li className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-chart-bgc" />
                        Real-time data visualization
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
