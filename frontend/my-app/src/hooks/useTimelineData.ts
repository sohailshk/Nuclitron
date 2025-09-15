import { useState, useEffect } from 'react'
import { fetchTimelineData, TimelineData } from '../lib/api'

interface UseTimelineDataProps {
  timeRange: [number, number] | null
  region?: string
  parameter?: string
}

interface UseTimelineDataReturn {
  data: TimelineData[] | null
  loading: boolean
  error: string | null
}

const useTimelineData = ({
  timeRange,
  region = 'global',
  parameter = 'temperature'
}: UseTimelineDataProps): UseTimelineDataReturn => {
  const [data, setData] = useState<TimelineData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!timeRange || timeRange.length !== 2) return
      
      setLoading(true)
      setError(null)
      
      try {
        const startDate = `${timeRange[0]}-01-01`
        const endDate = `${timeRange[1]}-12-31`
        
        const result = await fetchTimelineData(startDate, endDate, region, parameter)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        console.error('Error fetching timeline data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, region, parameter])

  return { data, loading, error }
}

export default useTimelineData