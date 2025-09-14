"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, 
  Droplets, 
  Waves, 
  Activity,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Database,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Indian Ocean");
  const [timeRange, setTimeRange] = useState("7 days");
  const router = useRouter();

  const stats = [
    {
      title: "Active Floats",
      value: "4,123",
      change: "+2.3%",
      trend: "up",
      icon: Globe,
      color: "text-chart-temperature",
      insight: "Highest concentration in Arabian Sea"
    },
    {
      title: "Profiles Today",
      value: "2,847",
      change: "+5.1%",
      trend: "up",
      icon: Database,
      color: "text-chart-salinity",
      insight: "Peak data collection at 06:00 UTC"
    },
    {
      title: "Data Quality",
      value: "99.2%",
      change: "+0.1%",
      trend: "up",
      icon: Activity,
      color: "text-chart-depth",
      insight: "All sensors operating normally"
    },
    {
      title: "Coverage",
      value: "87.5%",
      change: "-1.2%",
      trend: "down",
      icon: MapPin,
      color: "text-chart-bgc",
      insight: "Gap detected in Southern Indian Ocean"
    }
  ];

  const recentFloats = [
    { id: "ARGO-2901234", location: "Arabian Sea", lastUpdate: "2 min ago", status: "Active", temp: "28.5°C", salinity: "35.2 PSU" },
    { id: "ARGO-2901235", location: "Bay of Bengal", lastUpdate: "5 min ago", status: "Active", temp: "29.1°C", salinity: "34.8 PSU" },
    { id: "ARGO-2901236", location: "Indian Ocean", lastUpdate: "8 min ago", status: "Active", temp: "27.8°C", salinity: "35.5 PSU" },
    { id: "ARGO-2901237", location: "South China Sea", lastUpdate: "12 min ago", status: "Maintenance", temp: "30.2°C", salinity: "34.2 PSU" },
    { id: "ARGO-2901238", location: "Red Sea", lastUpdate: "15 min ago", status: "Active", temp: "31.5°C", salinity: "38.1 PSU" }
  ];

  const oceanRegions = [
    { name: "Indian Ocean", floats: 1200, coverage: "85%", color: "bg-blue-500" },
    { name: "Pacific Ocean", floats: 1800, coverage: "92%", color: "bg-cyan-500" },
    { name: "Atlantic Ocean", floats: 900, coverage: "78%", color: "bg-green-500" },
    { name: "Southern Ocean", floats: 300, coverage: "65%", color: "bg-purple-500" },
    { name: "Arctic Ocean", floats: 150, coverage: "45%", color: "bg-orange-500" }
  ];

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-deep mb-2">
                ARGO Data Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time monitoring of global ARGO float network and oceanographic data
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => window.location.reload()}  // Refresh page on click
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-white"
              >
                <option value="Indian Ocean">Indian Ocean</option>
                <option value="Pacific Ocean">Pacific Ocean</option>
                <option value="Atlantic Ocean">Atlantic Ocean</option>
                <option value="Southern Ocean">Southern Ocean</option>
                <option value="Arctic Ocean">Arctic Ocean</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-white"
              >
                <option value="24 hours">Last 24 hours</option>
                <option value="7 days">Last 7 days</option>
                <option value="30 days">Last 30 days</option>
                <option value="90 days">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-ocean">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-primary-deep">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-3">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">from last week</span>
                  </div>
                  {stat.insight && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{stat.insight}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Key Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-deep mb-4 flex items-center gap-2">
                <span className="text-blue-500">🌊</span> Ocean Health Indicators
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">Arabian Sea:</span> Optimal oxygen levels (&gt;5 mg/L) at 200m depth
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">Bay of Bengal:</span> Temperature anomaly detected (+1.8°C above average)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">Indian Ocean:</span> Strong monsoon currents affecting upper layers
                  </div>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary-deep mb-4 flex items-center gap-2">
                <span className="text-orange-500">⚠️</span> Advisory Notices
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">South China Sea:</span> Avoid fishing zones 15°N-18°N due to low oxygen
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">Red Sea:</span> High salinity levels (&gt;40 PSU) affecting marine life
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <div>
                    <span className="font-medium">Arabian Gulf:</span> Algal bloom detected, navigation caution advised
                  </div>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ocean Regions Chart */}
          <Card className="card-ocean lg:col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-deep">Ocean Coverage by Region</h3>
                <Button variant="outline" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
              <div className="space-y-4">
                {oceanRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${region.color}`}></div>
                      <span className="font-medium text-primary-deep">{region.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">{region.floats} floats</span>
                      <span className="text-sm font-semibold text-primary-deep">{region.coverage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="card-ocean">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary-deep mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-deep">New data received</p>
                    <p className="text-xs text-muted-foreground">ARGO-2901234, Arabian Sea</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-deep">Float deployed</p>
                    <p className="text-xs text-muted-foreground">ARGO-2901239, Bay of Bengal</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-deep">Maintenance alert</p>
                    <p className="text-xs text-muted-foreground">ARGO-2901237, South China Sea</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-deep">Data quality check</p>
                    <p className="text-xs text-muted-foreground">Batch processing completed</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Floats Table */}
        <Card className="card-ocean mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-primary-deep">Recent Float Data</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search floats..."
                    className="pl-10 pr-4 py-2 border border-border rounded-md bg-white"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Float ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Last Update</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Temperature</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-deep">Salinity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFloats.map((float, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-blue-50/50">
                      <td className="py-3 px-4 font-medium text-primary-deep">{float.id}</td>
                      <td className="py-3 px-4 text-muted-foreground">{float.location}</td>
                      <td className="py-3 px-4 text-muted-foreground">{float.lastUpdate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          float.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {float.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-chart-temperature font-medium">{float.temp}</td>
                      <td className="py-3 px-4 text-chart-salinity font-medium">{float.salinity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-ocean">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-primary-deep mb-2">Analytics</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced data analysis and visualization tools
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/explorer')}
              >
                View Analytics
              </Button>
            </div>
          </Card>

          <Card className="card-ocean">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-primary-deep mb-2">Map Explorer</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive maps with real-time float locations
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/map')}
              >
                Open Map
              </Button>
            </div>
          </Card>

          <Card className="card-ocean">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                <LineChart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-primary-deep mb-2">Trends</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Long-term trends and pattern analysis
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/explorer')}
              >
                View Trends
              </Button>
            </div>
          </Card>
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
