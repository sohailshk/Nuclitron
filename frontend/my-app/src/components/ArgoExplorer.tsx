import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArgoDataGraphs from "./ArgoDataGraphs";
import { useState } from "react";
import { BarChart3, Activity, Filter, TrendingUp } from "lucide-react";

export const ArgoExplorer = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');

  const regions = ['All', 'Arabian Sea', 'Bay of Bengal', 'Indian Ocean', 'South China Sea'];
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: '🌡️', color: 'bg-chart-temperature' },
    { id: 'salinity', name: 'Salinity', icon: '🧂', color: 'bg-chart-salinity' },
    { id: 'depth', name: 'Depth', icon: '🌊', color: 'bg-chart-depth' },
    { id: 'bgc', name: 'BGC', icon: '🔬', color: 'bg-chart-bgc' }
  ];

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
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex items-center space-x-4">
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
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Focus Parameter:</span>
              <div className="flex gap-2">
                {parameters.map(param => (
                  <Badge 
                    key={param.id}
                    className={`cursor-pointer transition-all ${
                      selectedParameter === param.id 
                        ? `${param.color} text-white` 
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

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Real-time Data</span>
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Floats</p>
                  <p className="text-2xl font-bold text-primary-deep">3,847</p>
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
                  <p className="text-2xl font-bold text-chart-temperature">500+</p>
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
                  <p className="text-2xl font-bold text-chart-salinity">4</p>
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
                  <p className="text-2xl font-bold text-chart-bgc">2h ago</p>
                </div>
                <TrendingUp className="w-8 h-8 text-chart-bgc" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Component */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary-deep">Interactive Data Analytics</h3>
              <p className="text-muted-foreground">
                Comprehensive analysis of ARGO oceanographic data - {selectedRegion} region
              </p>
            </div>
          </div>
          <ArgoDataGraphs />
        </div>
      </div>
    </section>
  );
};