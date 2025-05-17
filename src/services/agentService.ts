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
      const response = await api.get(`/agent/get?agent_id=${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  },

  // Get a paginated list of agents
  getAgentList: async (params: { 
    page: number; 
    size: number; 
    name?: string 
  }): Promise<ApiResponse<AgentListResponse>> => {
    try {
      const response = await api.get('/agent/page', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent list:', error);
      throw error;
    }
  }
};
