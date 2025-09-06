"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Map, 
  BarChart3, 
  Database,
  Brain,
  Globe,
  Shield,
  Zap,
  Download,
  Search,
  Filter,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

export const Features = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI-Powered Chat Interface",
      description: "Ask questions about ocean data in natural language. Get instant insights and visualizations.",
      features: ["Natural language queries", "Contextual responses", "Multi-language support", "Voice input"],
      color: "text-chart-temperature",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      icon: Map,
      title: "Interactive Data Explorer",
      description: "Explore ARGO float locations, trajectories, and oceanographic data on interactive maps.",
      features: ["Real-time float tracking", "Historical trajectories", "Ocean current visualization", "Depth profiles"],
      color: "text-chart-salinity",
      bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive dashboards with customizable charts, graphs, and data visualizations.",
      features: ["Custom dashboards", "Real-time monitoring", "Export capabilities", "Collaborative analysis"],
      color: "text-chart-depth",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50"
    },
    {
      icon: Database,
      title: "Comprehensive Data Portal",
      description: "Access to vast oceanographic datasets with advanced filtering and search capabilities.",
      features: ["Multi-format downloads", "API access", "Data quality metrics", "Metadata search"],
      color: "text-chart-bgc",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: Brain,
      title: "Machine Learning Insights",
      description: "AI-driven analysis and predictions based on historical and real-time ocean data.",
      features: ["Pattern recognition", "Anomaly detection", "Predictive modeling", "Trend analysis"],
      color: "text-chart-temperature",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      icon: Globe,
      title: "Global Ocean Monitoring",
      description: "Worldwide coverage with real-time monitoring of ocean conditions and climate patterns.",
      features: ["Global coverage", "Climate monitoring", "Seasonal analysis", "Regional comparisons"],
      color: "text-chart-salinity",
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50"
    }
  ];

  const capabilities = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find specific data points, floats, or regions with intelligent search algorithms."
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Filter data by time, location, depth, temperature, salinity, and other parameters."
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export data in multiple formats including NetCDF, CSV, JSON, and visualization formats."
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Analyze long-term trends and patterns in oceanographic data across different regions."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Government-grade security with encrypted data transmission and secure access controls."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and updates when new data becomes available."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-deep mb-6">
            Powerful Features for Ocean Research
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Comprehensive tools and AI-powered capabilities to explore, analyze, and understand 
            oceanographic data like never before.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`${feature.bgColor} border-0 shadow-subtle hover:shadow-ocean transition-all duration-300 group overflow-hidden`}
              >
                <div className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary-deep mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}`}></div>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Capabilities Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary-deep mb-4">
              Advanced Capabilities
            </h3>
            <p className="text-lg text-muted-foreground">
              Built for researchers, scientists, and ocean enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card 
                  key={index} 
                  className="card-ocean hover:shadow-ocean transition-all duration-300 group"
                >
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-ocean flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-primary-deep mb-2">
                      {capability.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="card-ocean max-w-4xl mx-auto">
            <div className="p-8">
              <h3 className="text-3xl font-bold text-primary-deep mb-4">
                Ready to Explore Ocean Data?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Start your journey into oceanographic research with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explorer">
                  <Button className="btn-ocean text-lg px-8 py-3">
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/chatbot">
                  <Button variant="outline" className="text-lg px-8 py-3">
                    Try AI Chat
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button variant="ghost" className="text-lg px-8 py-3">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
