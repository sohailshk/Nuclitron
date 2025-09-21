"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Play, 
  Database, 
  MessageCircle, 
  Map, 
  BarChart3,
  Globe,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-ocean">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full ocean-wave"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full data-float"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full ocean-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-white/10 rounded-full ocean-wave"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Government Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>Official Government Platform</span>
          </div>

          <div className="data-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              FloatChat
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                INCOIS Argo AI Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Advanced AI-powered platform for accessing, analyzing, and visualizing 
              ARGO oceanographic data through natural language queries and interactive dashboards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/explorer">
              <Button className="btn-ocean text-lg px-8 py-4 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Explore Data</span>
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary-deep flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>AI Chat</span>
              </Button>
            </Link>
            <Link href="/map">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary-deep flex items-center space-x-2"
              >
                <Map className="w-5 h-5" />
                <span>Map Visualization</span>
              </Button>
            </Link>
            <Link href="/timeline">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary-deep flex items-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>View Timeline</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary-deep flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Globe className="w-5 h-5 text-cyan-200" />
              <span className="text-sm">Global Coverage</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Zap className="w-5 h-5 text-cyan-200" />
              <span className="text-sm">Real-time Data</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MessageCircle className="w-5 h-5 text-cyan-200" />
              <span className="text-sm">AI-Powered</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="w-5 h-5 text-cyan-200" />
              <span className="text-sm">Government Secure</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm ocean-pulse">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-200">4,000+</div>
                <div className="text-blue-100">Active ARGO Floats</div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm ocean-pulse">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-200">2M+</div>
                <div className="text-blue-100">Ocean Profiles</div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm ocean-pulse">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-200">24/7</div>
                <div className="text-blue-100">Real-time Monitoring</div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm ocean-pulse">
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-200">AI</div>
                <div className="text-blue-100">Natural Language</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
