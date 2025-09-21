'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  BarChart3, 
  Map, 
  FileImage,
  Bot,
  TrendingUp,
  Activity,
  Waves,
  Zap,
  Globe,
  Download,
  Clock,
  Thermometer,
  Droplets
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  component: React.ReactNode;
}

const AnimatedGraph: React.FC<{ isActive: boolean; type: 'line' | 'bar' | 'heatmap' }> = ({ isActive, type }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [plotPoints, setPlotPoints] = useState<Array<{ x: number; y: number; visible: boolean }>>([]);

  useEffect(() => {
    if (isActive) {
      // Reset and start animation
      setAnimationProgress(0);
      setPlotPoints([]);
      
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          const newProgress = prev >= 100 ? 0 : prev + 1.5;
          return newProgress;
        });
      }, 30);
      return () => clearInterval(interval);
    } else {
      setAnimationProgress(0);
      setPlotPoints([]);
    }
  }, [isActive]);

  // Generate stock-like data points with smooth progression
  useEffect(() => {
    if (isActive && animationProgress > 0) {
      const dataPoints = [
        { x: 20, y: 80 }, { x: 40, y: 65 }, { x: 60, y: 45 }, { x: 80, y: 35 },
        { x: 100, y: 50 }, { x: 120, y: 30 }, { x: 140, y: 25 }, { x: 160, y: 40 },
        { x: 180, y: 35 }, { x: 200, y: 20 }, { x: 220, y: 30 }, { x: 240, y: 25 },
        { x: 260, y: 35 }, { x: 280, y: 30 }
      ];
      
      const totalPoints = dataPoints.length;
      const progressRatio = animationProgress / 100;
      const visibleCount = Math.floor(progressRatio * totalPoints);
      const partialProgress = (progressRatio * totalPoints) % 1;
      
      let newPoints = dataPoints.slice(0, visibleCount).map((point, i) => ({
        ...point,
        visible: true
      }));
      
      // Add partially visible point for smooth animation
      if (visibleCount < totalPoints && partialProgress > 0) {
        const nextPoint = dataPoints[visibleCount];
        const prevPoint = visibleCount > 0 ? dataPoints[visibleCount - 1] : { x: 20, y: 80 };
        
        newPoints.push({
          x: prevPoint.x + (nextPoint.x - prevPoint.x) * partialProgress,
          y: prevPoint.y + (nextPoint.y - prevPoint.y) * partialProgress,
          visible: true
        });
      }
      
      setPlotPoints(newPoints);
    }
  }, [animationProgress, isActive]);

  if (type === 'line') {
    return (
      <div className="relative w-full h-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-xl p-4 overflow-hidden border border-blue-500/20">
        {/* Grid background */}
        <svg width="100%" height="100%" viewBox="0 0 300 100" className="absolute inset-0 opacity-30">
          <defs>
            <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        <svg width="100%" height="100%" viewBox="0 0 300 100" className="absolute inset-0">
          <defs>
            <linearGradient id="stockGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Animated line path with smooth drawing */}
          {plotPoints.length > 1 && (
            <>
              {/* Glow effect */}
              <path
                d={`M ${plotPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                stroke="url(#stockGradient)"
                strokeWidth="6"
                fill="none"
                opacity="0.3"
                filter="blur(2px)"
                strokeDasharray={`${plotPoints.length * 20}`}
                strokeDashoffset={`${(100 - animationProgress) * plotPoints.length * 0.2}`}
                className="transition-all duration-100 ease-linear"
              />
              {/* Main line with drawing animation */}
              <path
                d={`M ${plotPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                stroke="url(#stockGradient)"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-lg"
                strokeDasharray={`${plotPoints.length * 20}`}
                strokeDashoffset={`${(100 - animationProgress) * plotPoints.length * 0.2}`}
                style={{ 
                  transition: 'stroke-dashoffset 0.1s linear',
                  filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))'
                }}
              />
              {/* Fill area */}
              <path
                d={`M ${plotPoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${plotPoints[plotPoints.length-1]?.x},100 L ${plotPoints[0]?.x},100 Z`}
                fill="url(#glowGradient)"
                opacity="0.2"
                className="transition-opacity duration-500"
                style={{ opacity: animationProgress > 50 ? 0.2 : 0 }}
              />
            </>
          )}
          
          {/* Animated data points appearing sequentially */}
          {plotPoints.map((point, i) => {
            const shouldShow = i < Math.floor((animationProgress / 100) * 14) + 1;
            return (
              <g key={i} style={{ opacity: shouldShow ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#10b981"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    filter: 'drop-shadow(0 0 6px #10b981)',
                    transform: shouldShow ? 'scale(1)' : 'scale(0)',
                    transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                  }}
                />
                {/* Ripple effect */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  opacity="0.4"
                  className="animate-ping"
                  style={{ 
                    animationDelay: `${i * 100}ms`,
                    display: shouldShow ? 'block' : 'none'
                  }}
                />
                {/* Value popup */}
                {shouldShow && (
                  <g>
                    <rect
                      x={point.x - 15}
                      y={point.y - 25}
                      width="30"
                      height="12"
                      rx="6"
                      fill="rgba(16, 185, 129, 0.9)"
                      className="animate-fadeIn"
                      style={{ animationDelay: `${i * 100 + 200}ms` }}
                    />
                    <text
                      x={point.x}
                      y={point.y - 17}
                      textAnchor="middle"
                      fill="white"
                      fontSize="6"
                      className="font-mono animate-fadeIn"
                      style={{ animationDelay: `${i * 100 + 200}ms` }}
                    >
                      {(28.5 + Math.sin(i) * 2).toFixed(1)}°
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Current value indicator */}
          {plotPoints.length > 0 && (
            <g>
              <line
                x1={plotPoints[plotPoints.length - 1]?.x}
                y1="0"
                x2={plotPoints[plotPoints.length - 1]?.x}
                y2="100"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              <text
                x={plotPoints[plotPoints.length - 1]?.x + 5}
                y={plotPoints[plotPoints.length - 1]?.y - 5}
                fill="#10b981"
                fontSize="8"
                className="font-mono"
              >
                {(28.5 + Math.random() * 2).toFixed(1)}°C
              </text>
            </g>
          )}
        </svg>
        
        <div className="absolute bottom-2 left-2 text-xs text-cyan-400 font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Live Temperature Data
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="relative w-full h-32 bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 rounded-xl p-4 overflow-hidden border border-emerald-500/20">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-7 h-full">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="border-r border-emerald-400/30 last:border-r-0" />
            ))}
          </div>
        </div>
        
        <div className="relative flex items-end justify-between h-full gap-1">
          {[65, 45, 80, 35, 70, 55, 90].map((height, i) => (
            <div key={i} className="relative flex-1 flex flex-col items-center">
              {/* Bar with glow effect */}
              <div
                className="w-full bg-gradient-to-t from-emerald-600 via-green-500 to-emerald-400 rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden"
                style={{
                  height: isActive ? `${height}%` : '0%',
                  transitionDelay: `${i * 150}ms`,
                  boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              >
                {/* Animated shimmer effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 transition-transform duration-1000"
                  style={{
                    transform: isActive ? 'translateX(100%)' : 'translateX(-100%)',
                    transitionDelay: `${i * 150 + 500}ms`
                  }}
                />
              </div>
              
              {/* Value label */}
              {isActive && (
                <div 
                  className="absolute -top-6 text-xs text-emerald-400 font-mono font-bold animate-fadeIn"
                  style={{ animationDelay: `${i * 150 + 800}ms` }}
                >
                  {(30 + height/3).toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-2 left-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          Salinity Levels (PSU)
        </div>
      </div>
    );
  }

  if (type === 'heatmap') {
    return (
      <div className="relative w-full h-32 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-xl p-4 overflow-hidden border border-purple-500/20">
        <div className="grid grid-cols-8 grid-rows-4 gap-1 h-full">
          {[...Array(32)].map((_, i) => {
            const intensity = Math.sin(i * 0.5) * 0.5 + 0.5;
            const hue = 240 + (intensity * 60); // Blue to purple range
            const saturation = 70 + (intensity * 30);
            const lightness = 40 + (intensity * 40);
            
            return (
              <div
                key={i}
                className="rounded-sm transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  backgroundColor: isActive 
                    ? `hsl(${hue}, ${saturation}%, ${lightness}%)`
                    : '#374151',
                  transitionDelay: `${i * 30}ms`,
                  boxShadow: isActive ? `0 0 8px hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)` : 'none'
                }}
              >
                {/* Pulsing effect for high intensity areas */}
                {isActive && intensity > 0.7 && (
                  <div 
                    className="absolute inset-0 bg-white/20 animate-pulse"
                    style={{ animationDelay: `${i * 30 + 500}ms` }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Temperature scale */}
        <div className="absolute right-2 top-2 flex flex-col text-xs text-purple-300 font-mono">
          <span>30°C</span>
          <span className="text-pink-300">25°C</span>
          <span className="text-blue-300">20°C</span>
        </div>
        
        <div className="absolute bottom-2 left-2 text-xs text-purple-400 font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          Ocean Temperature Map
        </div>
      </div>
    );
  }

  return null;
};

const ChatInterface: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);

  useEffect(() => {
    if (isActive) {
      const messageSequence = [
        { text: "Show temperature in Arabian Sea", isBot: false },
        { text: "Analyzing ARGO data... Found 1,247 profiles", isBot: true },
        { text: "Generate visualization", isBot: false },
        { text: "Creating high-quality ocean visualization", isBot: true }
      ];

      messageSequence.forEach((msg, i) => {
        setTimeout(() => {
          setMessages(prev => [...prev, msg]);
        }, i * 1500);
      });
    } else {
      setMessages([]);
    }
  }, [isActive]);

  return (
    <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 overflow-hidden">
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
          >
            <div
              className={`max-w-[80%] px-3 py-1 rounded-lg text-xs ${
                msg.isBot
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-blue-600 font-medium">
        AI Chat Assistant
      </div>
    </div>
  );
};

const TimelineMap: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [activePoints, setActivePoints] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (isActive) {
      setActivePoints([]);
      setCurrentTime(0);
      
      const points = [0, 1, 2, 3, 4];
      points.forEach((point, i) => {
        setTimeout(() => {
          setActivePoints(prev => [...prev, point]);
          setCurrentTime(point);
        }, i * 600);
      });
    } else {
      setActivePoints([]);
      setCurrentTime(0);
    }
  }, [isActive]);

  const timeLabels = ['2020', '2021', '2022', '2023', '2024'];

  return (
    <div className="relative w-full h-32 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl p-4 overflow-hidden border border-indigo-500/20">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="timelineGrid" width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#6366f1" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timelineGrid)" />
        </svg>
      </div>
      
      <svg width="100%" height="100%" viewBox="0 0 300 100" className="relative z-10">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean/Map background */}
        <path
          d="M30,25 Q80,15 150,20 Q220,25 270,35 L280,55 Q220,75 150,80 Q80,75 30,65 Z"
          fill="url(#mapGradient)"
          opacity="0.3"
          className="transition-opacity duration-1000"
          style={{ opacity: isActive ? 0.6 : 0.1 }}
        />
        
        {/* Animated wave patterns */}
        {isActive && (
          <>
            <path
              d="M30,40 Q80,35 150,38 Q220,40 270,45"
              stroke="#60a5fa"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
              className="animate-pulse"
            />
            <path
              d="M30,50 Q80,45 150,48 Q220,50 270,55"
              stroke="#34d399"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}
        
        {/* Timeline points with enhanced animations */}
        {[
          { x: 60, y: 40, label: '2020' },
          { x: 100, y: 35, label: '2021' },
          { x: 150, y: 42, label: '2022' },
          { x: 200, y: 38, label: '2023' },
          { x: 240, y: 45, label: '2024' }
        ].map((point, i) => (
          <g key={i}>
            {/* Point glow effect */}
            {activePoints.includes(i) && (
              <circle
                cx={point.x}
                cy={point.y}
                r="15"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                opacity="0.3"
                className="animate-ping"
              />
            )}
            
            {/* Main point */}
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={activePoints.includes(i) ? "#6366f1" : "#64748b"}
              filter={activePoints.includes(i) ? "url(#glow)" : "none"}
              className="transition-all duration-500"
            />
            
            {/* Data visualization around active points */}
            {activePoints.includes(i) && (
              <>
                {/* Mini data bars */}
                {[...Array(3)].map((_, barIndex) => (
                  <rect
                    key={barIndex}
                    x={point.x - 8 + barIndex * 5}
                    y={point.y - 15}
                    width="2"
                    height={5 + Math.random() * 8}
                    fill="#10b981"
                    opacity="0.8"
                    className="animate-pulse"
                    style={{ animationDelay: `${barIndex * 100}ms` }}
                  />
                ))}
                
                {/* Year label */}
                <text
                  x={point.x}
                  y={point.y + 15}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="8"
                  className="font-mono animate-fadeIn"
                >
                  {point.label}
                </text>
              </>
            )}
          </g>
        ))}
        
        {/* Animated connection line */}
        <path
          d="M60,40 L100,35 L150,42 L200,38 L240,45"
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          strokeDasharray="300"
          strokeDashoffset={isActive ? 0 : 300}
          className="transition-all duration-2000 ease-out"
          filter="url(#glow)"
        />
        
        {/* Current time indicator */}
        {isActive && currentTime >= 0 && (
          <g>
            <line
              x1={60 + currentTime * 45}
              y1="10"
              x2={60 + currentTime * 45}
              y2="90"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.7"
              className="animate-pulse"
            />
            <text
              x={60 + currentTime * 45}
              y="8"
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="6"
              className="font-mono"
            >
              NOW
            </text>
          </g>
        )}
      </svg>
      
      <div className="absolute bottom-2 left-2 text-xs text-indigo-400 font-medium flex items-center gap-1">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        Historical Ocean Data
      </div>
    </div>
  );
};

const ReportGeneration: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 5));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-32 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
      <div className="space-y-3">
        {/* Document icon */}
        <div className="flex items-center gap-2">
          <FileImage className="w-6 h-6 text-orange-500" />
          <div className="text-sm font-medium text-orange-700">
            Generating Official Report
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-orange-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status */}
        <div className="text-xs text-orange-600">
          {progress < 30 && "Processing data..."}
          {progress >= 30 && progress < 70 && "Generating visualizations..."}
          {progress >= 70 && progress < 100 && "Creating PDF document..."}
          {progress === 100 && "✓ Report ready for download"}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-orange-600 font-medium">
        Report & Image Generation
      </div>
    </div>
  );
};

export const FeaturesShowcase: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const features: Feature[] = [
    {
      id: 'ai-chat',
      title: 'AI Chat Assistant',
      subtitle: 'Natural Language Queries',
      description: 'Interact with ARGO oceanographic data using natural language. Ask questions, get insights, and explore ocean data through intelligent conversations.',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-cyan-500',
      component: <ChatInterface isActive={currentFeature === 0} />
    },
    {
      id: 'data-viz',
      title: 'Data Visualizations',
      subtitle: 'Interactive Graphs & Heatmaps',
      description: 'Explore comprehensive oceanographic data through interactive temperature profiles, salinity distributions, and dynamic heatmaps.',
      icon: BarChart3,
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-emerald-500',
      component: <AnimatedGraph isActive={currentFeature === 1} type="bar" />
    },
    {
      id: 'timeline-maps',
      title: 'Timeline Mapping',
      subtitle: 'Temporal Ocean Analysis',
      description: 'Track oceanographic changes over time with interactive timeline maps showing historical data patterns and trends.',
      icon: Clock,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500 to-purple-500',
      component: <TimelineMap isActive={currentFeature === 2} />
    },
    {
      id: 'report-gen',
      title: 'Report Generation',
      subtitle: 'Official Documents & Images',
      description: 'Generate professional INCOIS reports and high-quality visualizations with official government formatting and branding.',
      icon: FileImage,
      color: 'text-orange-600',
      bgGradient: 'from-orange-500 to-red-500',
      component: <ReportGeneration isActive={currentFeature === 3} />
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % features.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, features.length]);

  const nextFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature(prev => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setIsAutoPlaying(false);
    setCurrentFeature(prev => (prev - 1 + features.length) % features.length);
  };

  const goToFeature = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentFeature(index);
  };

  const currentFeatureData = features[currentFeature];
  const Icon = currentFeatureData.icon;

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 text-sm text-blue-700 mb-4">
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Advanced Ocean Data Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore cutting-edge features designed for comprehensive oceanographic analysis and research
          </p>
        </div>

        {/* Main Feature Display */}
        <div className="relative max-w-6xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm ring-1 ring-white/20">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                {/* Feature Info */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentFeatureData.bgGradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {currentFeatureData.title}
                        </h3>
                        <p className={`text-lg font-medium ${currentFeatureData.color}`}>
                          {currentFeatureData.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {currentFeatureData.description}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <Button 
                        className={`bg-gradient-to-r ${currentFeatureData.bgGradient} hover:shadow-lg transition-all duration-300`}
                      >
                        Explore Feature
                      </Button>
                      <Button variant="outline" className="border-gray-300">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Feature Visualization */}
                <div className="p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="w-full max-w-md">
                    {currentFeatureData.component}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevFeature}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-6">
            <Button
              variant="outline"
              size="icon"
              onClick={nextFeature}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Feature Indicators */}
        <div className="flex justify-center items-center space-x-4 mt-12">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => goToFeature(index)}
              className={`group relative transition-all duration-300 ${
                index === currentFeature ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentFeature
                    ? `bg-gradient-to-r ${feature.bgGradient} shadow-lg`
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
              {index === currentFeature && (
                <div className="absolute -inset-2 rounded-full border-2 border-blue-300 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Auto-play Toggle */}
        <div className="flex justify-center mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
