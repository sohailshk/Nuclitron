"use client";

import { Card } from "@/components/ui/card";
import { 
  Database, 
  Globe, 
  Clock, 
  TrendingUp,
  Thermometer,
  Droplets,
  Waves,
  Activity
} from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      icon: Database,
      value: "4,000+",
      label: "Active ARGO Floats",
      description: "Deployed globally across all oceans",
      color: "text-chart-temperature"
    },
    {
      icon: Globe,
      value: "2M+",
      label: "Ocean Profiles",
      description: "Temperature, salinity, and pressure data",
      color: "text-chart-salinity"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Real-time Monitoring",
      description: "Continuous data collection and updates",
      color: "text-chart-depth"
    },
    {
      icon: TrendingUp,
      value: "99.9%",
      label: "Data Accuracy",
      description: "Quality-controlled oceanographic measurements",
      color: "text-chart-bgc"
    },
    {
      icon: Thermometer,
      value: "0-2000m",
      label: "Depth Coverage",
      description: "From surface to deep ocean layers",
      color: "text-chart-temperature"
    },
    {
      icon: Droplets,
      value: "35 PSU",
      label: "Salinity Range",
      description: "Global ocean salinity measurements",
      color: "text-chart-salinity"
    },
    {
      icon: Waves,
      value: "10 Days",
      label: "Profile Cycle",
      description: "Regular data collection intervals",
      color: "text-chart-depth"
    },
    {
      icon: Activity,
      value: "AI-Powered",
      label: "Natural Language",
      description: "Query ocean data with simple questions",
      color: "text-chart-bgc"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-4">
            Ocean Data at Scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive oceanographic data collection and analysis through advanced 
            ARGO float technology and AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="card-data hover:shadow-ocean transition-all duration-300 group"
              >
                <div className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-primary-deep mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-primary mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="card-ocean max-w-4xl mx-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-primary-deep mb-4">
                Data Quality & Standards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-temperature mb-2">ISO 27001</div>
                  <div className="text-sm text-muted-foreground">Information Security</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-salinity mb-2">WMO</div>
                  <div className="text-sm text-muted-foreground">World Meteorological Organization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-depth mb-2">IOC-UNESCO</div>
                  <div className="text-sm text-muted-foreground">Oceanographic Standards</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
