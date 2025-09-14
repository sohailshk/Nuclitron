'use client';

import React, { useState, useRef, useMemo } from 'react';
import { GoogleMap, LoadScript, HeatmapLayer, Autocomplete } from '@react-google-maps/api';

const libraries = ['places', 'visualization'] as const;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

interface HeatmapDataPoint {
  location: google.maps.LatLng;
  weight: number;
}

interface RawHeatmapData {
  lat: number;
  lng: number;
  weight: number;
}

// Full rawHeatmapData array (200 synthetic ARGO points for Indian Ocean)
const rawHeatmapData: RawHeatmapData[] = [
  { lat: -5.648722, lng: 23.151355, weight: 0.40 },
  { lat: -41.027087, lng: 112.795373, weight: 0.73 },
  { lat: 15.835263, lng: 30.954293, weight: 0.52 },
  { lat: -57.467236, lng: 47.548385, weight: 0.59 },
  { lat: -57.744443, lng: 45.053544, weight: 0.71 },
  { lat: -13.679974, lng: 47.775518, weight: 0.66 },
  { lat: 8.801589, lng: 20.818844, weight: 0.84 },
  { lat: -0.658151, lng: 62.871565, weight: 0.30 },
  { lat: 21.363111, lng: 62.410913, weight: 0.24 },
  { lat: -51.779108, lng: 126.784290, weight: 0.67 },
  { lat: 8.605903, lng: 111.946205, weight: 0.61 },
  { lat: 22.714840, lng: 67.695332, weight: 0.63 },
  { lat: 10.499396, lng: 97.933489, weight: 0.88 },
  { lat: -10.925068, lng: 108.776051, weight: 0.20 },
  { lat: -40.628647, lng: 56.462883, weight: 0.23 },
  { lat: -40.212775, lng: 32.726180, weight: 0.40 },
  { lat: -5.966822, lng: 65.968855, weight: 0.48 },
  { lat: -42.191902, lng: 53.639206, weight: 0.95 },
  { lat: -4.916992, lng: 96.750507, weight: 0.31 },
  { lat: 1.975778, lng: 40.588714, weight: 0.48 },
  { lat: 24.109485, lng: 100.639970, weight: 0.63 },
  { lat: -1.807789, lng: 126.199342, weight: 0.81 },
  { lat: -40.530914, lng: 24.044631, weight: 0.43 },
  { lat: -37.242026, lng: 46.583838, weight: 0.95 },
  { lat: 14.491248, lng: 59.649413, weight: 0.71 },
  { lat: -26.371288, lng: 135.232996, weight: 0.55 },
  { lat: -37.485186, lng: 51.075066, weight: 0.63 },
  { lat: -37.666963, lng: 93.657835, weight: 0.91 },
  { lat: -26.050957, lng: 47.634416, weight: 1.00 },
  { lat: -16.690265, lng: 31.454586, weight: 0.21 },
  { lat: -50.679824, lng: 99.058201, weight: 0.83 },
  { lat: -24.116403, lng: 28.004491, weight: 0.48 },
  { lat: 24.670317, lng: 86.668407, weight: 0.98 },
  { lat: 13.166275, lng: 21.446609, weight: 0.77 },
  { lat: -2.054619, lng: 87.658262, weight: 0.39 },
  { lat: -5.518247, lng: 34.055574, weight: 0.53 },
  { lat: -21.433485, lng: 140.180807, weight: 0.90 },
  { lat: -37.611931, lng: 83.073850, weight: 0.32 },
  { lat: 17.573366, lng: 129.685340, weight: 0.42 },
  { lat: -5.689293, lng: 96.730247, weight: 0.29 },
  { lat: 4.813418, lng: 87.961758, weight: 0.82 },
  { lat: -14.919938, lng: 20.072059, weight: 0.44 },
  { lat: -58.344477, lng: 137.066426, weight: 0.90 },
  { lat: 10.691570, lng: 58.746780, weight: 0.21 },
  { lat: 14.630816, lng: 139.315630, weight: 0.24 },
  { lat: -18.690811, lng: 28.720777, weight: 0.80 },
  { lat: 5.095926, lng: 36.177325, weight: 0.56 },
  { lat: -13.266695, lng: 53.397135, weight: 0.89 },
  { lat: -24.033275, lng: 46.686574, weight: 0.62 },
  { lat: 2.044141, lng: 45.345034, weight: 0.43 },
  { lat: 24.587695, lng: 101.884635, weight: 0.53 },
  { lat: -16.006054, lng: 35.246529, weight: 0.35 },
  { lat: -31.262727, lng: 94.126899, weight: 0.36 },
  { lat: -41.281522, lng: 28.945129, weight: 0.69 },
  { lat: -40.539948, lng: 134.082922, weight: 0.88 },
  { lat: -53.977125, lng: 49.988584, weight: 0.72 },
  { lat: -41.789871, lng: 36.671293, weight: 0.95 },
  { lat: -11.461337, lng: 79.556549, weight: 0.82 },
  { lat: 8.637245, lng: 43.991649, weight: 0.25 },
  { lat: -23.360649, lng: 73.370907, weight: 0.56 },
  { lat: 1.971447, lng: 104.843933, weight: 0.99 },
  { lat: -51.634481, lng: 70.730282, weight: 0.45 },
  { lat: 13.242166, lng: 51.330698, weight: 0.33 },
  { lat: -21.867848, lng: 73.157087, weight: 0.40 },
  { lat: -38.766452, lng: 136.331466, weight: 0.54 },
  { lat: 13.214674, lng: 89.340989, weight: 0.21 },
  { lat: 24.939010, lng: 125.339476, weight: 0.97 },
  { lat: 18.741194, lng: 126.935663, weight: 0.31 },
  { lat: -18.720504, lng: 46.932160, weight: 0.50 },
  { lat: -55.015991, lng: 67.750613, weight: 0.99 },
  { lat: -37.457740, lng: 118.792896, weight: 0.55 },
  { lat: -24.044364, lng: 140.622023, weight: 0.55 },
  { lat: -12.759693, lng: 110.519443, weight: 0.30 },
  { lat: -34.779835, lng: 142.057380, weight: 0.65 },
  { lat: -13.913408, lng: 114.244921, weight: 0.21 },
  { lat: -10.344904, lng: 83.359148, weight: 0.88 },
  { lat: -46.618218, lng: 141.058142, weight: 0.23 },
  { lat: -44.204878, lng: 94.974423, weight: 0.73 },
  { lat: -40.007669, lng: 35.105713, weight: 0.91 },
  { lat: -39.071695, lng: 94.909413, weight: 0.68 },
  { lat: -24.365882, lng: 93.542708, weight: 0.60 },
  { lat: 19.450032, lng: 45.736659, weight: 0.76 },
  { lat: -39.711694, lng: 69.869017, weight: 0.73 },
  { lat: -34.500248, lng: 59.838327, weight: 0.79 },
  { lat: -53.833835, lng: 77.743976, weight: 1.00 },
  { lat: 24.668198, lng: 29.230851, weight: 0.34 },
  { lat: -37.457965, lng: 137.590682, weight: 0.90 },
  { lat: 14.737971, lng: 66.560413, weight: 0.30 },
  { lat: 10.868321, lng: 108.646031, weight: 0.68 },
  { lat: 23.914810, lng: 102.401016, weight: 0.17 },
  { lat: 9.453851, lng: 57.721723, weight: 0.72 },
  { lat: 19.809050, lng: 36.920680, weight: 0.26 },
  { lat: -50.901942, lng: 89.706179, weight: 0.39 },
  { lat: -8.589465, lng: 110.419136, weight: 0.34 },
  { lat: -6.089773, lng: 53.261972, weight: 0.57 },
  { lat: 16.953602, lng: 126.609068, weight: 0.24 },
  { lat: -23.996059, lng: 54.861708, weight: 0.17 },
  { lat: 5.545134, lng: 100.276286, weight: 0.38 },
  { lat: 3.004627, lng: 89.511733, weight: 0.52 },
  { lat: -59.178076, lng: 29.480726, weight: 0.90 },
  { lat: 16.833929, lng: 88.744376, weight: 0.86 },
  { lat: -10.486687, lng: 38.659817, weight: 0.27 },
  { lat: -33.798040, lng: 133.271668, weight: 0.83 },
  { lat: 13.159719, lng: 133.264504, weight: 0.34 },
  { lat: -38.789972, lng: 32.951996, weight: 0.82 },
  { lat: 15.151450, lng: 71.203551, weight: 0.68 },
  { lat: -46.862966, lng: 137.165008, weight: 0.89 },
  { lat: 22.977513, lng: 122.157237, weight: 0.90 },
  { lat: -57.893159, lng: 112.807123, weight: 0.44 },
  { lat: 19.119350, lng: 121.081628, weight: 0.89 },
  { lat: 8.913692, lng: 53.617519, weight: 0.82 },
  { lat: -50.811872, lng: 129.893015, weight: 0.88 },
  { lat: -41.093134, lng: 122.889912, weight: 0.55 },
  { lat: -34.058776, lng: 120.213533, weight: 0.36 },
  { lat: -57.988523, lng: 44.334353, weight: 0.44 },
  { lat: 13.470000, lng: 141.828027, weight: 0.40 },
  { lat: -5.474052, lng: 70.359476, weight: 0.98 },
  { lat: -14.421663, lng: 138.343880, weight: 0.26 },
  { lat: 22.484052, lng: 42.499545, weight: 0.97 },
  { lat: -37.435359, lng: 33.658721, weight: 0.53 },
  { lat: 1.926330, lng: 59.523342, weight: 0.67 },
  { lat: -16.529040, lng: 68.534625, weight: 0.65 },
  { lat: -38.348587, lng: 109.306946, weight: 0.17 },
  { lat: 18.673889, lng: 87.844952, weight: 0.77 },
  { lat: 3.065757, lng: 104.499192, weight: 0.47 },
  { lat: -54.052226, lng: 103.693948, weight: 0.44 },
  { lat: -33.317170, lng: 126.849925, weight: 0.77 },
  { lat: -34.472607, lng: 58.969867, weight: 0.51 },
  { lat: -25.795967, lng: 57.252556, weight: 0.27 },
  { lat: -24.262062, lng: 138.485823, weight: 0.73 },
  { lat: 16.738471, lng: 97.554879, weight: 0.42 },
  { lat: -13.425337, lng: 20.051148, weight: 0.41 },
  { lat: -23.459507, lng: 93.078082, weight: 0.71 },
  { lat: -20.476004, lng: 75.712135, weight: 0.34 },
  { lat: -19.779174, lng: 133.548784, weight: 0.83 },
  { lat: -45.576231, lng: 30.684238, weight: 0.60 },
  { lat: -6.200027, lng: 62.233720, weight: 0.85 },
  { lat: 3.846742, lng: 104.772254, weight: 0.35 },
  { lat: -43.073956, lng: 23.077599, weight: 0.37 },
  { lat: -19.613411, lng: 127.066950, weight: 0.23 },
  { lat: -24.772514, lng: 99.350438, weight: 0.33 },
  { lat: -0.809889, lng: 82.291523, weight: 0.37 },
  { lat: -4.235069, lng: 20.698647, weight: 0.79 },
  { lat: 5.453926, lng: 33.429999, weight: 0.52 },
  { lat: -45.049632, lng: 140.703721, weight: 0.60 },
  { lat: -55.731437, lng: 51.398983, weight: 0.87 },
  { lat: -21.200745, lng: 120.978492, weight: 0.72 },
  { lat: 23.970859, lng: 95.026992, weight: 0.96 },
  { lat: 15.771204, lng: 97.194193, weight: 0.77 },
  { lat: -17.093856, lng: 124.651715, weight: 0.62 },
  { lat: 16.262689, lng: 113.700586, weight: 0.56 },
  { lat: -37.968718, lng: 51.152207, weight: 0.70 },
  { lat: 5.094163, lng: 85.683776, weight: 0.69 },
  { lat: -36.659217, lng: 29.762903, weight: 0.40 },
  { lat: -36.904216, lng: 60.283406, weight: 0.62 },
  { lat: -48.238205, lng: 49.138946, weight: 0.74 },
  { lat: 0.045627, lng: 28.092835, weight: 0.51 },
  { lat: -13.878053, lng: 72.387553, weight: 0.34 },
  { lat: -24.287801, lng: 134.009648, weight: 0.65 },
  { lat: -0.880546, lng: 127.948236, weight: 0.80 },
  { lat: -27.667613, lng: 20.742907, weight: 0.46 },
  { lat: 4.045386, lng: 127.534442, weight: 0.96 },
  { lat: -24.383191, lng: 114.186974, weight: 0.62 },
  { lat: -8.723530, lng: 47.787875, weight: 0.35 },
  { lat: -22.953942, lng: 23.657127, weight: 0.45 },
  { lat: -2.272940, lng: 70.943900, weight: 0.30 },
  { lat: -20.271837, lng: 36.081102, weight: 0.69 },
  { lat: -57.707852, lng: 69.646552, weight: 0.64 },
  { lat: -57.696326, lng: 100.986456, weight: 0.28 },
  { lat: -20.755632, lng: 26.335864, weight: 0.48 },
  { lat: -42.008876, lng: 61.182571, weight: 0.80 },
  { lat: -27.774272, lng: 114.753238, weight: 0.86 },
  { lat: -38.556920, lng: 30.320185, weight: 0.18 },
  { lat: -14.149381, lng: 145.988386, weight: 0.46 },
  { lat: -4.737752, lng: 118.435364, weight: 0.71 },
  { lat: 4.109822, lng: 139.651078, weight: 0.33 },
  { lat: -58.267699, lng: 39.200176, weight: 0.27 },
  { lat: -3.095998, lng: 91.060167, weight: 0.35 },
  { lat: -0.545477, lng: 116.629160, weight: 0.31 },
  { lat: -8.383963, lng: 114.238632, weight: 0.26 },
  { lat: 9.640600, lng: 141.554817, weight: 0.26 },
  { lat: -57.817334, lng: 59.306613, weight: 0.73 },
  { lat: 21.444691, lng: 69.978460, weight: 0.76 },
  { lat: -53.540299, lng: 107.017416, weight: 0.69 },
  { lat: -51.338389, lng: 117.332592, weight: 0.88 },
  { lat: -8.965013, lng: 35.252938, weight: 0.99 },
  { lat: 6.524004, lng: 63.747674, weight: 0.52 },
  { lat: -28.501476, lng: 83.751059, weight: 0.45 },
  { lat: 12.213928, lng: 123.613696, weight: 0.25 },
  { lat: 21.666943, lng: 100.083723, weight: 0.86 },
  { lat: 0.121235, lng: 74.871380, weight: 0.78 },
  { lat: 22.065267, lng: 54.030382, weight: 0.84 },
  { lat: -14.255303, lng: 80.920685, weight: 0.53 },
  { lat: 2.137228, lng: 53.817838, weight: 0.88 },
  { lat: 10.612137, lng: 30.919525, weight: 0.90 },
  { lat: -39.271608, lng: 78.553267, weight: 0.68 },
  { lat: -27.785909, lng: 23.616200, weight: 0.88 },
  { lat: -44.543612, lng: 46.727101, weight: 0.83 },
  { lat: -31.071198, lng: 130.920317, weight: 0.75 },
  { lat: -36.517171, lng: 21.279040, weight: 0.96 },
];

const ArgoHeatmap: React.FC = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''; // Fallback to empty string if undefined

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const heatmapData = useMemo(() => {
    if (typeof google === 'undefined') return [];
    return rawHeatmapData.map(({ lat, lng, weight }) => ({
      location: new google.maps.LatLng(lat, lng),
      weight,
    }));
  }, []);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location && mapRef.current) {
        mapRef.current.panTo(place.geometry.location);
        mapRef.current.setZoom(10);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries as ["places", "visualization"]}
    >
      <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Autocomplete
            onLoad={(autocomplete: google.maps.places.Autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Search ARGO locations (e.g., Mumbai)"
              className="w-60 p-2 rounded-md shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </Autocomplete>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition w-60"
          >
            {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
        </div>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          center={{ lat: -20, lng: 80 }}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#193341" }]
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#2c5aa0" }]
              }
            ]
          }}
        >
          {showHeatmap && heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 20,
                opacity: 0.6,
                gradient: ['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 0.45)', 'rgba(0, 0, 255, 0.8)', 'rgba(255, 0, 0, 1)'],
              }}
            />
          )}
          {showHeatmap && heatmapData.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-500">
              Heatmap data loading...
            </div>
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default ArgoHeatmap;