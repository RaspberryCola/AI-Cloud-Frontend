import axios from 'axios';
import { Agent } from '../types/chat';
import { ApiResponse } from '../types/common';

// Get auth token from localStorage
const getToken = (): string | null => {
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token;
    }
  } catch (err) {
    console.error('Error parsing auth data from localStorage:', err);
  }
  return null;
};

// Create axios instance with auth headers
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface AgentListResponse {
  list: Agent[];
  total: number;
}

export const agentService = {
  // Get a specific agent by ID
  getAgent: async (agentId: string): Promise<ApiResponse<Agent>> => {
    try {
      console.log(`Making API request to /agent/get with agent_id=${agentId}`);
      const response = await api.get(`/agent/get`, {
        params: { agent_id: agentId }
      });
      
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      // Return a structured error response instead of throwing
      return {
        code: 1, // Non-zero code indicates error
        message: error instanceof Error ? error.message : 'Unknown error fetching agent',
        data: null as any
      };
    }
  },

  // Get a paginated list of agents
  getAgentList: async (params: { 
    page: number; 
    size: number; 
    name?: string 
  }): Promise<ApiResponse<AgentListResponse>> => {
    try {
      console.log('Making API request to /agent/page with params:', params);
      const response = await api.get('/agent/page', { params });
      
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent list:', error);
      // Return a structured error response instead of throwing
      return {
        code: 1, // Non-zero code indicates error
        message: error instanceof Error ? error.message : 'Unknown error fetching agent list',
        data: { list: [], total: 0 } as AgentListResponse
      };
    }
  }
};
