// Chat API Service for ARGO Conversational Platform
// Connects React frontend to FastAPI backend with RAG system

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response_text: string;
  intent: string;
  confidence: number;
  entities: any;
  data_results?: any[];
  sql_query?: string;
  response_time_ms: number;
  session_id: string;
  suggestions?: string[];
}

export interface HealthResponse {
  status: string;
  database: string;
  rag_system: string;
  data_points: number;
}

export interface DataSummaryResponse {
  total_floats: number;
  total_profiles: number;
  total_measurements: number;
  latest_data_date: string;
  regions_covered: string[];
  data_quality: string;
}

class ChatApiService {
  private readonly API_BASE_URL = 'http://localhost:8000';
  private readonly DEFAULT_SESSION_ID = 'webapp_session';

  /**
   * Send a chat message to the RAG system
   */
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          session_id: sessionId || this.DEFAULT_SESSION_ID
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      
      // Add some default suggestions if none provided
      if (!data.suggestions || data.suggestions.length === 0) {
        data.suggestions = this.getDefaultSuggestions(data.intent);
      }

      return data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw new Error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check API health and system status
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health Check Error:', error);
      throw new Error(`System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get data summary statistics
   */
  async getDataSummary(): Promise<DataSummaryResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/data/summary`);
      
      if (!response.ok) {
        throw new Error(`Data summary failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Data Summary Error:', error);
      throw new Error(`Failed to get data summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get float information
   */
  async getFloats(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/data/floats?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Floats data failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Floats API Error:', error);
      throw new Error(`Failed to get floats data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get profile information
   */
  async getProfiles(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/data/profiles?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Profiles data failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Profiles API Error:', error);
      throw new Error(`Failed to get profiles data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default suggestions based on intent
   */
  private getDefaultSuggestions(intent: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      'data_query': [
        'Show me recent temperature data',
        'What\'s the salinity in the Arabian Sea?',
        'Find floats near the equator',
        'Compare temperature profiles by depth'
      ],
      'location_query': [
        'Show floats in the Indian Ocean',
        'Find data near specific coordinates',
        'What regions have the most coverage?',
        'Plot float locations on a map'
      ],
      'analysis_request': [
        'Analyze temperature trends over time',
        'Compare salinity between regions',
        'Show depth profiles for temperature',
        'Generate a data quality report'
      ],
      'unknown': [
        'Ask about temperature or salinity data',
        'Request data from specific ocean regions',
        'Compare measurements between locations',
        'Get information about ARGO floats'
      ]
    };

    return suggestionMap[intent] || suggestionMap['unknown'];
  }

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const chatApi = new ChatApiService();
export default chatApi;