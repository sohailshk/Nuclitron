"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, 
  Droplets, 
  Waves, 
  Activity,
  MapPin,
  Clock,
  Download,
  Eye,
  BarChart3,
  Globe
} from "lucide-react";
import Link from "next/link";

export const DataOverview = () => {
  const dataTypes = [
    {
      icon: Thermometer,
      title: "Temperature Profiles",
      description: "High-resolution temperature measurements from surface to 2000m depth",
      parameters: ["Surface temperature", "Thermocline depth", "Deep ocean temperature", "Seasonal variations"],
      color: "text-chart-temperature",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      count: "1.2M profiles"
    },
    {
      icon: Droplets,
      title: "Salinity Data",
      description: "Precise salinity measurements for understanding ocean circulation patterns",
      parameters: ["Surface salinity", "Halocline structure", "Deep water salinity", "Freshwater influence"],
      color: "text-chart-salinity",
      bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50",
      count: "1.1M profiles"
    },
    {
      icon: Waves,
      title: "Pressure & Depth",
      description: "Accurate pressure measurements for depth profiling and ocean dynamics",
      parameters: ["Surface pressure", "Depth profiles", "Pressure gradients", "Ocean currents"],
      color: "text-chart-depth",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      count: "2.0M profiles"
    },
    {
      icon: Activity,
      title: "BGC Parameters",
      description: "Bio-geo-chemical measurements including oxygen, nutrients, and pH",
      parameters: ["Dissolved oxygen", "Nutrient levels", "pH measurements", "Chlorophyll-a"],
      color: "text-chart-bgc",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      count: "800K profiles"
    }
  ];

  const regions = [
    { name: "Indian Ocean", count: "1,200 floats", coverage: "85%" },
    { name: "Pacific Ocean", count: "1,800 floats", coverage: "92%" },
    { name: "Atlantic Ocean", count: "900 floats", coverage: "78%" },
    { name: "Southern Ocean", count: "300 floats", coverage: "65%" },
    { name: "Arctic Ocean", count: "150 floats", coverage: "45%" }
  ];

  const recentData = [
    { float: "ARGO-2901234", location: "Arabian Sea", time: "2 hours ago", status: "Active" },
    { float: "ARGO-2901235", location: "Bay of Bengal", time: "4 hours ago", status: "Active" },
    { float: "ARGO-2901236", location: "Indian Ocean", time: "6 hours ago", status: "Active" },
    { float: "ARGO-2901237", location: "South China Sea", time: "8 hours ago", status: "Maintenance" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-6">
            Comprehensive Ocean Data
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Access to the world's most comprehensive collection of ARGO float data, 
            covering all major ocean basins with real-time updates.
          </p>
        </div>

        {/* Data Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {dataTypes.map((dataType, index) => {
            const Icon = dataType.icon;
            return (
              <Card 
                key={index} 
                className={`${dataType.bgColor} border-0 shadow-subtle hover:shadow-ocean transition-all duration-300 group`}
              >
                <div className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-8 h-8 ${dataType.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-primary-deep">
                          {dataType.title}
                        </h3>
                        <span className="text-sm font-semibold text-muted-foreground bg-white px-3 py-1 rounded-full">
                          {dataType.count}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {dataType.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {dataType.parameters.map((param, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${dataType.color.replace('text-', 'bg-')}`}></div>
                            <span className="text-muted-foreground">{param}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Regional Coverage */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary-deep mb-4">
              Global Ocean Coverage
            </h3>
            <p className="text-lg text-muted-foreground">
              ARGO floats deployed across all major ocean basins
            </p>
          </div>

          <Card className="card-ocean">
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {regions.map((region, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-primary-deep mb-2">
                      {region.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {region.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {region.coverage} coverage
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Data Activity */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary-deep mb-4">
              Recent Data Activity
            </h3>
            <p className="text-lg text-muted-foreground">
              Latest ARGO float transmissions and data updates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="card-ocean">
              <div className="p-6">
                <h4 className="text-xl font-semibold text-primary-deep mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Latest Transmissions</span>
                </h4>
                <div className="space-y-3">
                  {recentData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-primary-deep">{data.float}</p>
                        <p className="text-sm text-muted-foreground">{data.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{data.time}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          data.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {data.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="card-ocean">
              <div className="p-6">
                <h4 className="text-xl font-semibold text-primary-deep mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Data Statistics</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Profiles Today</span>
                    <span className="font-semibold text-primary-deep">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Floats</span>
                    <span className="font-semibold text-primary-deep">4,123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Data Quality Score</span>
                    <span className="font-semibold text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Update</span>
                    <span className="font-semibold text-primary-deep">2 min ago</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Data Access Options */}
        <div className="text-center">
          <Card className="card-ocean max-w-4xl mx-auto">
            <div className="p-8">
              <h3 className="text-3xl font-bold text-primary-deep mb-4">
                Access Ocean Data
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Multiple ways to explore and download oceanographic data
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-primary-deep mb-2">
                    Visual Explorer
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interactive maps and visualizations
                  </p>
                  <Link href="/explorer">
                    <Button variant="outline" size="sm">
                      Explore Now
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-primary-deep mb-2">
                    Data Download
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download raw data in multiple formats
                  </p>
                  <Link href="/data">
                    <Button variant="outline" size="sm">
                      Download Data
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-ocean flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-primary-deep mb-2">
                    API Access
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Programmatic access to data
                  </p>
                  <Link href="/docs/api">
                    <Button variant="outline" size="sm">
                      View API Docs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
