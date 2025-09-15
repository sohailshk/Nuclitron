// src/lib/api.ts

export interface TimelineData {
  timestamp: string
  value: number
  parameter: string
  depth?: number
  latitude?: number
  longitude?: number
  // Add other properties as needed based on your API response
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export const fetchTimelineData = async (
  startDate: string,
  endDate: string,
  region: string,
  parameter: string
): Promise<TimelineData[]> => {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      region: region,
      parameter: parameter,
    }).toString()
    
    const response = await fetch(`http://localhost:8000/api/data?${params}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error in fetchTimelineData:", error)
    throw error
  }
}

// You can also export other API functions as needed
export const api = {
  fetchTimelineData,
}