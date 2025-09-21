'use client'

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
// Remove the cluster import since we'll use a different approach
// import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Define types for your data
interface ProfileData {
  float_id: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  temperature?: number[];
  salinity?: number[];
}

interface UpdateMapViewProps {
  data: ProfileData[];
}

interface MapViewProps {
  data: ProfileData[];
}

// Fix for default marker icon issues with Webpack
// Use type assertion to avoid TypeScript errors
const defaultIcon = L.Icon.Default.prototype as any;
if (defaultIcon._getIconUrl) {
  delete defaultIcon._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// Ocean coordinate validation function

const isLikelyOcean = (lat: number, lon: number) => {
  // Enhanced checks for major continental landmasses and known problematic regions
  // This is a rough approximation; for perfect accuracy, a dedicated geospatial library or dataset would be needed.

  // Check for valid overall coordinate ranges
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;

  // General Landmasses (expanded/adjusted)
  // North America
  if (lon > -170 && lon < -50 && lat > 10 && lat < 85) return false;
  // South America
  if (lon > -90 && lon < -30 && lat > -60 && lat < 15) return false;
  // Europe & Asia (largely combined for simplicity in this approximation)
  if (lon > -10 && lon < 180 && lat > 0 && lat < 85) return false; // Covers most of Eurasia
  // Africa
  if (lon > -20 && lon < 60 && lat > -40 && lat < 40) return false;
  // Australia
  if (lon > 105 && lon < 160 && lat > -50 && lat < -10) return false;
  // Antarctica
  if (lat < -60) return false; // Covers the Antarctic continent and surrounding ice sheets

  // Specific problematic areas (e.g., large islands, narrow straits where general boxes fail)
  // Mediterranean Sea (often misidentified as ocean due to narrow land borders)
  if (lon > -6 && lon < 37 && lat > 30 && lat < 46) return false;
  // Red Sea / Arabian Peninsula
  if (lon > 30 && lon < 60 && lat > 12 && lat < 35) return false;
  // Southeast Asia / Indonesian archipelago (very complex, rough approximation)
  if (lon > 95 && lon < 150 && lat > -10 && lat < 20) return false;
  // Caribbean (some parts are very close to land)
  if (lon > -90 && lon < -60 && lat > 10 && lat < 28) return false;
  // Japan / Korea
  if (lon > 125 && lon < 148 && lat > 30 && lat < 46) return false;
  // UK/Ireland
  if (lon > -12 && lon < 3 && lat > 49 && lat < 60) return false;
  // New Zealand
  if (lon > 165 && lon < 180 && lat > -48 && lat < -33) return false;

  // If none of the above land checks returned false, it's likely ocean
  return true;
}


const UpdateMapView = ({ data }: UpdateMapViewProps) => {
  const map = useMap()

  useEffect(() => {
    if (data && data.length > 0) {
      // Filter for valid ocean coordinates
      const oceanProfiles = data.filter(profile => 
        isLikelyOcean(profile.latitude, profile.longitude)
      )

      if (oceanProfiles.length > 0) {
        const latitudes = oceanProfiles.map(item => item.latitude)
        const longitudes = oceanProfiles.map(item => item.longitude)

        const minLat = Math.min(...latitudes)
        const maxLat = Math.max(...latitudes)
        const minLon = Math.min(...longitudes)
        const maxLon = Math.max(...longitudes)

        if (isFinite(minLat) && isFinite(maxLat) && isFinite(minLon) && isFinite(maxLon)) {
          // Add some padding to the bounds
          const latPadding = (maxLat - minLat) * 0.1 || 5
          const lonPadding = (maxLon - minLon) * 0.1 || 5
          
          map.fitBounds([
            [minLat - latPadding, minLon - lonPadding], 
            [maxLat + latPadding, maxLon + lonPadding]
          ], { padding: [20, 20] })
        }
      } else {
        // Default global view if no valid ocean coordinates
        map.setView([0, 0], 2)
      }
    } else {
      // Default view if no data
      map.setView([0, 0], 2)
    }
  }, [data, map])

  return null
}

const MapView = ({ data }: MapViewProps) => {
  const profiles = data || []
  
  // Filter profiles to only show those in ocean areas
  const oceanProfiles = profiles.filter(profile => 
    profile.latitude && profile.longitude && 
    isLikelyOcean(profile.latitude, profile.longitude)
  )

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <h3>ARGO Float Locations ({oceanProfiles.length} ocean locations)</h3>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        // Prevent infinite horizontal scrolling and multiple world copies
        worldCopyJump={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        minZoom={2}
        maxZoom={12}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Prevent loading tiles outside bounds to avoid duplicate maps
          bounds={[[-85, -180], [85, 180]]}
          noWrap={true}
        />
        {/* Removed MarkerClusterGroup since the import was causing issues */}
        {/* You can install the proper types or use an alternative clustering solution */}
        {oceanProfiles.map((profile: ProfileData, index: number) => {
          const displayDate = profile.timestamp ? 
            new Date(profile.timestamp).toLocaleDateString() : 
            'No date available'
          
          return (
            <Marker key={`${profile.float_id}-${index}`} position={[profile.latitude, profile.longitude]}>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <strong>Float ID:</strong> {profile.float_id}<br/>
                  <strong>Timestamp:</strong> {displayDate}<br/>
                  <strong>Latitude:</strong> {profile.latitude.toFixed(2)}°<br/>
                  <strong>Longitude:</strong> {profile.longitude.toFixed(2)}°<br/>
                  {profile.temperature && profile.temperature.length > 0 && (
                    <>
                      <strong>Surface Temp:</strong> {profile.temperature[0].toFixed(1)}°C<br/>
                    </>
                  )}
                  {profile.salinity && profile.salinity.length > 0 && (
                    <>
                      <strong>Surface Salinity:</strong> {profile.salinity[0].toFixed(1)} psu<br/>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
        <UpdateMapView data={oceanProfiles} />
      </MapContainer>
      {profiles.length > oceanProfiles.length && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
          Note: {profiles.length - oceanProfiles.length} floats filtered out (likely on land)
        </div>
      )}
    </div>
  )
}

export default MapView