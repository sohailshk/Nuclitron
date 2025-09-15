'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/assets/css/leaflet.css';

// Correct way to import leaflet.heat
import 'leaflet.heat';

import { argoApiService, ArgoDataPoint } from '@/services/argoApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer, Droplets, Gauge, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface HeatmapDataPoint {
  lat: number;
  lng: number;
  weight: number;
}

interface ArgoHeatmapProps {
  selectedRegion?: string;
  selectedParameter?: string;
}

// Add typings for heatLayer
declare global {
  namespace L {
    function heatLayer(latlngs: any[], options?: any): any;
  }
}

// Convert ARGO data to heatmap format with validation
const convertArgoDataToHeatmap = (data: ArgoDataPoint[], parameter: string): HeatmapDataPoint[] => {
  return data
    .filter(point => {
      // Validate coordinates and data
      return point && 
        typeof point.latitude === 'number' && 
        typeof point.longitude === 'number' &&
        !isNaN(point.latitude) && 
        !isNaN(point.longitude) &&
        point.latitude >= -90 && point.latitude <= 90 &&
        point.longitude >= -180 && point.longitude <= 180;
    })
    .map(point => {
      let weight = 0.5;

      try {
        switch (parameter) {
          case 'temperature':
            if (typeof point.temperature === 'number' && !isNaN(point.temperature)) {
              weight = Math.min(Math.max(point.temperature / 30, 0), 1);
            }
            break;
          case 'salinity':
            if (typeof point.salinity === 'number' && !isNaN(point.salinity)) {
              weight = Math.min(Math.max((point.salinity - 30) / 10, 0), 1);
            }
            break;
          case 'depth':
            if (typeof point.depth === 'number' && !isNaN(point.depth)) {
              weight = Math.min(Math.max(point.depth / 2000, 0), 1);
            }
            break;
          default:
            weight = point.isRecent ? 0.8 : 0.5;
        }
      } catch (error) {
        console.warn('Error calculating weight for point:', error);
        weight = 0.5;
      }

      return {
        lat: point.latitude,
        lng: point.longitude,
        weight: Math.min(Math.max(weight, 0), 1) // Ensure weight is between 0 and 1
      };
    });
};

const ArgoHeatmap: React.FC<ArgoHeatmapProps> = ({
  selectedRegion = 'Indian Ocean',
  selectedParameter = 'temperature'
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const heatmapRef = useRef<L.HeatLayer | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [argoData, setArgoData] = useState<ArgoDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const searchControlRef = useRef<any>(null);

  // Fetch ARGO data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`🗺️ Fetching ARGO data for map: ${selectedRegion} (${selectedParameter})`);
        const response = await argoApiService.fetchArgoData('Last Month', selectedRegion);
        setArgoData(response.data);
        setDataSource(response.dataSource);
        console.log(`✅ Map loaded ${response.data.length} ARGO data points`);
      } catch (error) {
        console.error('Failed to fetch ARGO data for map:', error);
        setArgoData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRegion]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map', {
        center: [-10, 80],
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | ARGO Data',
      }).addTo(map);

      const searchControl = new (GeoSearchControl as any)({
        provider: new (OpenStreetMapProvider as any)(),
        style: 'bar',
        showMarker: true,
        autoClose: true,
        searchLabel: 'Search locations (e.g., Mumbai, Chennai)...',
      });
      map.addControl(searchControl);
      searchControlRef.current = searchControl;

      markersRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    }
  }, []);

  // Update heatmap and markers when data/parameter changes
  useEffect(() => {
    if (mapRef.current && argoData.length > 0) {
      console.log(`🔄 Updating map layers for ${selectedParameter} with ${argoData.length} points`);
      
      // Update heatmap with error handling
      if (heatmapRef.current) {
        try {
          mapRef.current.removeLayer(heatmapRef.current);
        } catch (error) {
          console.warn('⚠️ Error removing existing heatmap:', error);
        }
        heatmapRef.current = null;
      }

      // Validate data before creating heatmap
      if (argoData.length > 0 && argoData.length < 5000) { // Reduced limit to prevent memory issues
        try {
          const heatmapData = convertArgoDataToHeatmap(argoData, selectedParameter);
          
          // Additional validation and sampling if needed
          let heatmapPoints = heatmapData.map(({ lat, lng, weight }) => [lat, lng, weight]);
          
          // If too many points, sample them to prevent memory issues
          if (heatmapPoints.length > 2000) {
            const sampleRate = 2000 / heatmapPoints.length;
            heatmapPoints = heatmapPoints.filter(() => Math.random() < sampleRate);
            console.log(`⚠️ Sampled heatmap points from ${heatmapData.length} to ${heatmapPoints.length}`);
          }

          if (heatmapPoints.length > 0) {
            const gradient = selectedParameter === 'temperature'
              ? {
                  0.0: 'rgba(0, 0, 255, 0.6)',
                  0.3: 'rgba(0, 255, 255, 0.7)',
                  0.5: 'rgba(0, 255, 0, 0.8)',
                  0.7: 'rgba(255, 255, 0, 0.9)',
                  1.0: 'rgba(255, 0, 0, 1)'
                }
              : selectedParameter === 'salinity'
              ? {
                  0.0: 'rgba(0, 100, 255, 0.6)',
                  0.5: 'rgba(0, 255, 200, 0.8)',
                  1.0: 'rgba(255, 100, 0, 1)'
                }
              : {
                  0.0: 'rgba(173, 216, 230, 0.6)',
                  0.5: 'rgba(0, 100, 200, 0.8)',
                  1.0: 'rgba(0, 0, 139, 1)'
                };

            // Create heatmap with very conservative settings to prevent memory issues
            const heatmapOptions = {
              radius: Math.min(20, Math.max(10, 25 - Math.floor(heatmapPoints.length / 50))), // Smaller dynamic radius
              blur: 10, // Reduced blur
              maxZoom: 12, // Further reduced maxZoom to prevent high-resolution rendering
              gradient,
              max: 0.8, // Reduced max intensity
              minOpacity: 0.05
            };
            
            console.log(`🎨 Creating heatmap with options:`, heatmapOptions);
            heatmapRef.current = L.heatLayer(heatmapPoints, heatmapOptions);

            if (showHeatmap && mapRef.current) {
              try {
                heatmapRef.current.addTo(mapRef.current);
                console.log(`✅ Heatmap created with ${heatmapPoints.length} points`);
              } catch (addError) {
                console.error('❌ Failed to add heatmap to map:', addError);
                heatmapRef.current = null;
              }
            }
          } else {
            console.warn('⚠️ No valid heatmap points after filtering');
          }
        } catch (heatmapError) {
          console.error('❌ Failed to create heatmap:', heatmapError);
          heatmapRef.current = null;
        }
      } else {
        console.warn(`⚠️ Skipping heatmap creation: ${argoData.length} data points (max: 5000)`);
        // Show markers instead when too many data points for heatmap
        if (argoData.length >= 5000) {
          console.log('📍 Too many points for heatmap, showing markers only');
        }
      }

      // Update markers with parameter-specific styling
      if (markersRef.current) {
        markersRef.current.clearLayers();

        if (showMarkers) {
          console.log(`🎯 Adding ${argoData.length} markers for ${selectedParameter}`);
          
          argoData.forEach((point, index) => {
            try {
              // Parameter-specific marker colors
              let markerColor = '#4444ff';
              let markerSize = 6;
              
              if (selectedParameter === 'temperature') {
                const tempNorm = Math.min(Math.max(point.temperature / 30, 0), 1);
                markerColor = tempNorm > 0.7 ? '#ff4444' : tempNorm > 0.4 ? '#ffaa44' : '#4444ff';
                markerSize = 5 + tempNorm * 4;
              } else if (selectedParameter === 'salinity') {
                const saltNorm = Math.min(Math.max((point.salinity - 30) / 10, 0), 1);
                markerColor = saltNorm > 0.7 ? '#ff6600' : saltNorm > 0.4 ? '#00aaff' : '#0066ff';
                markerSize = 5 + saltNorm * 4;
              } else if (selectedParameter === 'depth') {
                const depthNorm = Math.min(Math.max(point.depth / 2000, 0), 1);
                markerColor = depthNorm > 0.7 ? '#000080' : depthNorm > 0.4 ? '#4169E1' : '#87CEEB';
                markerSize = 5 + depthNorm * 4;
              }
              
              // Recent data gets special styling
              if (point.isRecent) {
                markerColor = '#ff0000';
                markerSize += 2;
              }

              const marker = L.circleMarker([point.latitude, point.longitude], {
                radius: markerSize,
                fillColor: markerColor,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              });

              marker.bindPopup(`
                <div style="padding: 12px; max-width: 300px; font-family: system-ui;">
                  <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">ARGO Float ${point.floatId}</h3>
                  <p style="margin: 4px 0;"><strong>Location:</strong> ${point.latitude.toFixed(3)}°N, ${point.longitude.toFixed(3)}°E</p>
                  <p style="margin: 4px 0;"><strong>Temperature:</strong> ${point.temperature}°C</p>
                  <p style="margin: 4px 0;"><strong>Salinity:</strong> ${point.salinity} PSU</p>
                  <p style="margin: 4px 0;"><strong>Depth:</strong> ${point.depth}m</p>
                  <p style="margin: 4px 0;"><strong>Region:</strong> ${point.region}</p>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">${new Date(point.timestamp).toLocaleString()}</p>
                  ${point.isRecent ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-top: 4px;">Recent Data</span>' : ''}
                </div>
              `);

              markersRef.current?.addLayer(marker);
            } catch (error) {
              console.error(`❌ Failed to create marker ${index}:`, error);
            }
          });
          
          console.log(`✅ Successfully added ${argoData.length} markers`);
        }
      }
      
      // Force map refresh to prevent tile issues
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
          // Force all tile layers to redraw
          mapRef.current.eachLayer((layer: any) => {
            if (layer._url && layer.redraw) {
              layer.redraw();
            }
          });
          console.log('🔄 Map tiles refreshed after marker update');
        }
      }, 100);
      
      // Additional refresh for stubborn tiles
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, 300);
    }
  }, [argoData, selectedParameter, showHeatmap, showMarkers]);

  // Handle heatmap visibility toggle
  useEffect(() => {
    if (mapRef.current && heatmapRef.current) {
      try {
        if (showHeatmap) {
          heatmapRef.current.addTo(mapRef.current);
          console.log('✅ Heatmap shown');
        } else {
          mapRef.current.removeLayer(heatmapRef.current);
          console.log('✅ Heatmap hidden');
        }
      } catch (error) {
        console.error('❌ Error toggling heatmap visibility:', error);
        // Reset heatmap reference if there's an error
        heatmapRef.current = null;
      }
      
      // Refresh map after heatmap toggle
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, 50);
    }
  }, [showHeatmap]);
  
  // Handle marker visibility toggle
  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      if (!showMarkers) {
        markersRef.current.clearLayers();
      } else if (argoData.length > 0) {
        // Re-add markers when toggled on
        markersRef.current.clearLayers();
        
        argoData.forEach((point, index) => {
          try {
            // Parameter-specific marker colors
            let markerColor = '#4444ff';
            let markerSize = 6;
            
            if (selectedParameter === 'temperature') {
              const tempNorm = Math.min(Math.max(point.temperature / 30, 0), 1);
              markerColor = tempNorm > 0.7 ? '#ff4444' : tempNorm > 0.4 ? '#ffaa44' : '#4444ff';
              markerSize = 5 + tempNorm * 4;
            } else if (selectedParameter === 'salinity') {
              const saltNorm = Math.min(Math.max((point.salinity - 30) / 10, 0), 1);
              markerColor = saltNorm > 0.7 ? '#ff6600' : saltNorm > 0.4 ? '#00aaff' : '#0066ff';
              markerSize = 5 + saltNorm * 4;
            } else if (selectedParameter === 'depth') {
              const depthNorm = Math.min(Math.max(point.depth / 2000, 0), 1);
              markerColor = depthNorm > 0.7 ? '#000080' : depthNorm > 0.4 ? '#4169E1' : '#87CEEB';
              markerSize = 5 + depthNorm * 4;
            }
            
            if (point.isRecent) {
              markerColor = '#ff0000';
              markerSize += 2;
            }

            const marker = L.circleMarker([point.latitude, point.longitude], {
              radius: markerSize,
              fillColor: markerColor,
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });

            marker.bindPopup(`
              <div style="padding: 12px; max-width: 300px; font-family: system-ui;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">ARGO Float ${point.floatId}</h3>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${point.latitude.toFixed(3)}°N, ${point.longitude.toFixed(3)}°E</p>
                <p style="margin: 4px 0;"><strong>Temperature:</strong> ${point.temperature}°C</p>
                <p style="margin: 4px 0;"><strong>Salinity:</strong> ${point.salinity} PSU</p>
                <p style="margin: 4px 0;"><strong>Depth:</strong> ${point.depth}m</p>
                <p style="margin: 4px 0;"><strong>Region:</strong> ${point.region}</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">${new Date(point.timestamp).toLocaleString()}</p>
                ${point.isRecent ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-top: 4px;">Recent Data</span>' : ''}
              </div>
            `);

            markersRef.current?.addLayer(marker);
          } catch (error) {
            console.error(`❌ Failed to create marker ${index}:`, error);
          }
        });
      }
      
      // Refresh map after marker toggle
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
          mapRef.current.eachLayer((layer: any) => {
            if (layer._url && layer.redraw) {
              layer.redraw();
            }
          });
        }
      }, 100);
    }
  }, [showMarkers, selectedParameter, argoData]);

  const refreshData = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Refreshing ARGO data for map...`);
      const response = await argoApiService.fetchArgoData('Last Month', selectedRegion);
      setArgoData(response.data);
      setDataSource(response.dataSource);
      console.log(`✅ Map refreshed with ${response.data.length} ARGO data points`);
    } catch (error) {
      console.error('Failed to refresh ARGO data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[700px] bg-gradient-to-br from-blue-900 to-blue-600 rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-700">Loading ARGO data...</span>
          </div>
        </div>
      )}

      {/* Map Controls - Moved to top */}
      <div className="bg-white/95 backdrop-blur-sm p-4 border-b border-white/20">
        <div className="flex flex-wrap items-center gap-4">
          {/* Data Source Info */}
          <div className={`px-3 py-2 rounded-md shadow-sm text-sm font-medium ${
            dataSource === 'api'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-orange-100 text-orange-800 border border-orange-200'
          }`}>
            {dataSource === 'api' ? '🌊 Real ARGO Data' : '🔄 Enhanced Data'} • {argoData.length} points
          </div>

          {/* Parameter Tabs */}
          <Tabs value={selectedParameter} className="flex-shrink-0">
            <TabsList className="grid grid-cols-3 bg-white">
              <TabsTrigger value="temperature" className="flex items-center gap-1 text-xs">
                <Thermometer className="w-3 h-3" /> Temp
              </TabsTrigger>
              <TabsTrigger value="salinity" className="flex items-center gap-1 text-xs">
                <Droplets className="w-3 h-3" /> Salt
              </TabsTrigger>
              <TabsTrigger value="depth" className="flex items-center gap-1 text-xs">
                <Gauge className="w-3 h-3" /> Depth
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowHeatmap(!showHeatmap)}
              variant={showHeatmap ? "default" : "outline"}
              className="flex items-center gap-2"
              size="sm"
            >
              {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
            </Button>

            <Button
              onClick={() => setShowMarkers(!showMarkers)}
              variant={showMarkers ? "default" : "outline"}
              className="flex items-center gap-2"
              size="sm"
            >
              {showMarkers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showMarkers ? 'Hide Markers' : 'Show Markers'}
            </Button>

            <Button
              onClick={refreshData}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">

        {/* Scale Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 rounded-lg p-3 shadow-md">
          <h4 className="text-sm font-semibold mb-2 capitalize">{selectedParameter} Scale</h4>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-16 rounded ${
              selectedParameter === 'temperature'
                ? 'bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500'
                : selectedParameter === 'salinity'
                ? 'bg-gradient-to-r from-blue-600 via-teal-400 to-orange-500'
                : 'bg-gradient-to-r from-blue-200 via-blue-500 to-blue-900'
            }`} />
            <div className="text-xs text-gray-600">
              {selectedParameter === 'temperature' ? '0°C → 30°C'
                : selectedParameter === 'salinity' ? '30 → 40 PSU'
                : '0m → 2000m'}
            </div>
          </div>
        </div>

        <div id="map" className="w-full h-full" />
      </div>
    </div>
  );
};

export default ArgoHeatmap;