// @ts-check
'use client'

import React, { useState, ChangeEvent, ReactElement } from 'react'
import dynamic from 'next/dynamic'
import TimelineSlider from '../../components/timeline/TimelineSlider'
import ProfileChart from '../../components/Visualizations/ProfileChart'
import useTimelineData from '../../hooks/useTimelineData'

const DynamicMapView = dynamic(() => import('../../components/Visualizations/MapView'), {
  ssr: false,
  loading: () => (
    <div style={styles.mapSkeleton}>
      <div>Loading map...</div>
    </div>
  )
})

interface Region {
  value: string;
  label: string;
  icon: string;
}

interface Parameter {
  value: string;
  label: string;
  icon: string;
  unit: string;
}

interface TimelineData {
  profiles: any[];
  metadata?: {
    data_points?: number;
    monthly_points?: number;
    time_range?: string;
  };
}

export default function TimelinePage(): ReactElement {
  const [timeRange, setTimeRange] = useState<[number, number]>([2020, 2025])
  const [region, setRegion] = useState<string>('global')
  const [parameter, setParameter] = useState<string>('temperature')
  
  const { data, loading, error } = useTimelineData({
    timeRange,
    region,
    parameter
  })

  const handleTimeChange = (newRange: [number, number]): void => {
    setTimeRange(newRange)
  }

  const regions: Region[] = [
    { value: 'global', label: 'Global Ocean', icon: '🌍' },
    { value: 'north_atlantic', label: 'North Atlantic', icon: '🌊' },
    { value: 'indian_ocean', label: 'Indian Ocean', icon: '🏝️' },
    { value: 'pacific', label: 'Pacific Ocean', icon: '🌺' },
    { value: 'atlantic', label: 'Atlantic Ocean', icon: '🐋' }
  ]

  const parameters: Parameter[] = [
    { value: 'temperature', label: 'Temperature', icon: '🌡️', unit: '°C' },
    { value: 'salinity', label: 'Salinity', icon: '🧂', unit: 'PSU' }
  ]

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRegion(e.target.value)
  }

  const handleParameterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setParameter(e.target.value)
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.pageContent}>
          <div style={styles.pageHeader}>
            <h1>ARGO Ocean Explorer</h1>
          </div>
          <div style={styles.errorCard}>
            <h3>⚠️ Error Loading Data</h3>
            <p>{error}</p>
            <p>Please try refreshing the page or selecting a different time range.</p>
          </div>
        </div>
      </div>
    )
  }

  const timelineData = data as TimelineData | null;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>ARGO Ocean Explorer</h1>
          <p style={styles.pageSubtitle}>Explore global ocean temperature and salinity data from autonomous floats</p>
        </div>

        <div style={styles.sliderSection}>
          <TimelineSlider onTimeChange={handleTimeChange} initialRange={timeRange} />
        </div>

        <div style={styles.controlsGrid}>
          <div style={styles.controlCard}>
            <h3 style={styles.controlTitle}><span>🗺️</span> Ocean Region</h3>
            <select
              value={region}
              onChange={handleRegionChange}
              style={styles.controlSelect}
            >
              {regions.map(r => (
                <option key={r.value} value={r.value}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.controlCard}>
            <h3 style={styles.controlTitle}><span>📊</span> Parameter</h3>
            <select
              value={parameter}
              onChange={handleParameterChange}
              style={styles.controlSelect}
            >
              {parameters.map(p => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div style={styles.controlCard}>
              <div style={styles.loadingIndicator}>
                <div style={styles.spinner}></div>
                <p>Loading ocean data...</p>
              </div>
            </div>
          )}
        </div>

        <div style={styles.visualizationsGrid}>
          <div style={styles.visualizationCard}>
            <React.Suspense fallback={
              <div style={styles.mapSkeleton}>
                <div>Loading map...</div>
              </div>
            }>
              <DynamicMapView 
                data={timelineData?.profiles || []}
              />
            </React.Suspense>
          </div>
          
          <div style={styles.visualizationCard}>
            <ProfileChart 
              data={timelineData?.profiles || []} 
              parameter={parameter}
            />
          </div>
        </div>

        {timelineData && (
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>📈 Dataset Statistics</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{timelineData.metadata?.data_points || 0}</div>
                <p style={styles.statLabel}>Total Profiles</p>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{timeRange[1] - timeRange[0]}</div>
                <p style={styles.statLabel}>Years Covered</p>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{timelineData.metadata?.monthly_points || 0}</div>
                <p style={styles.statLabel}>Monthly Averages</p>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{regions.find(r => r.value === region)?.icon || '🌍'}</div>
                <p style={styles.statLabel}>{regions.find(r => r.value === region)?.label}</p>
              </div>
            </div>

            <div style={styles.statsFooter}>
              <strong>Time Range:</strong> {timelineData.metadata?.time_range} • 
              <strong> Parameter:</strong> {parameters.find(p => p.value === parameter)?.label} • 
              <strong> Region:</strong> {regions.find(r => r.value === region)?.label}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem'
  },
  pageContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#2d3748'
  },
  pageHeader: {
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    color: '#2b6cb0'
  },
  pageSubtitle: {
    fontSize: '1.1rem',
    color: '#4a5568',
    margin: '0'
  },
  sliderSection: {
    marginBottom: '2rem'
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  controlCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  controlTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#2b6cb0'
  },
  controlSelect: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    fontSize: '1rem',
    background: 'white',
    color: '#2d3748',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loadingIndicator: {
    textAlign: 'center' as const
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(43, 108, 176, 0.2)',
    borderTop: '3px solid #2b6cb0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  visualizationsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    marginBottom: '2rem'
  },
  visualizationCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  mapSkeleton: {
    height: '500px',
    background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  statsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  statsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.4rem',
    textAlign: 'center' as const,
    color: '#2b6cb0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem'
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    background: '#f7fafc',
    borderRadius: '8px'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0',
    color: '#2b6cb0'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#718096',
    margin: '0'
  },
  statsFooter: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f7fafc',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#4a5568',
    textAlign: 'center' as const
  },
  errorCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    color: '#e53e3e'
  }
}