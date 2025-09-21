'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Create wrapper components with proper typing
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => {
    const RC = mod.ResponsiveContainer as any;
    return ({ children, width, height, ...props }: any) => 
      <RC width={width} height={height} {...props}>{children}</RC>;
  }),
  { ssr: false }
);

const LineChart = dynamic(
  () => import('recharts').then((mod) => {
    const LC = mod.LineChart as any;
    return ({ children, data, margin, ...props }: any) => 
      <LC data={data} margin={margin} {...props}>{children}</LC>;
  }),
  { ssr: false }
);

const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => {
    const CG = mod.CartesianGrid as any;
    return ({ strokeDasharray, ...props }: any) => 
      <CG strokeDasharray={strokeDasharray} {...props} />;
  }),
  { ssr: false }
);

const XAxis = dynamic(
  () => import('recharts').then((mod) => {
    const XA = mod.XAxis as any;
    return ({ dataKey, label, ...props }: any) => 
      <XA dataKey={dataKey} label={label} {...props} />;
  }),
  { ssr: false }
);

const YAxis = dynamic(
  () => import('recharts').then((mod) => {
    const YA = mod.YAxis as any;
    return ({ label, ...props }: any) => 
      <YA label={label} {...props} />;
  }),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip as any),
  { ssr: false }
);

const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend as any),
  { ssr: false }
);

const Line = dynamic(
  () => import('recharts').then((mod) => {
    const L = mod.Line as any;
    return ({ type, dataKey, stroke, activeDot, ...props }: any) => 
      <L type={type} dataKey={dataKey} stroke={stroke} activeDot={activeDot} {...props} />;
  }),
  { ssr: false }
);

interface ProfileData {
  depth: number
  temperature?: number | null
  salinity?: number | null
  pressure?: number | null
  [key: string]: number | null | undefined
}

interface ProfileChartProps {
  data: ProfileData[]
  parameter: string
}

interface ChartDataPoint {
  depth: number
  [key: string]: number
}

const ProfileChart = ({ data, parameter }: ProfileChartProps) => {
  // Ensure data is an array and has the expected structure
  const chartData: ChartDataPoint[] = data && Array.isArray(data) 
    ? data
        .map(profile => ({
          depth: profile.depth,
          [parameter]: profile[parameter]
        }))
        .filter(item => item[parameter] !== null && item[parameter] !== undefined)
        .map(item => ({ depth: item.depth, [parameter]: item[parameter] as number }))
    : []

  if (chartData.length === 0) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '200px' }}>
        <h3>Profile Chart ({parameter})</h3>
        <p>No {parameter} profile data available for charting.</p>
      </div>
    )
  }

  const parameterDisplayName = parameter.charAt(0).toUpperCase() + parameter.slice(1)

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '200px' }}>
      <h3>Profile Chart ({parameterDisplayName})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="depth" 
            label={{ value: 'Depth (meters)', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis 
            label={{ value: `${parameterDisplayName}`, angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={parameter} 
            stroke="#0070f3" 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProfileChart