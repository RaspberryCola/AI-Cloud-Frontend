import axios from 'axios';
import {
  ConversationListResponse,
  ConversationHistoryResponse,
  CreateConversationResponse,
  ConversationRequest
} from '../types/chat';
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

export const chatService = {
  // Fetch conversation list for a specific agent
  listAgentConversations: async (
    agentId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<ApiResponse<ConversationListResponse>> => {
    try {
      const response = await api.get(`/chat/list/agent`, {
        params: { page, size, agent_id: agentId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent conversations:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (
    agentId: string
  ): Promise<ApiResponse<CreateConversationResponse>> => {
    try {
      const response = await api.post('/chat/create', { agent_id: agentId });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Get conversation history
  getConversationHistory: async (
    convId: string
  ): Promise<ApiResponse<ConversationHistoryResponse>> => {
    try {
      const response = await api.get('/chat/history', {
        params: { conv_id: convId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (convId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete('/chat/delete', {
        params: { conv_id: convId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Stream a conversation message
  streamConversation: (data: ConversationRequest): EventSource => {
    const { agent_id, conv_id, message } = data;
    const encodedMessage = encodeURIComponent(message);
    const token = getToken();
    
    // Create a URL with query parameters
    const url = `/api/chat/stream?agent_id=${agent_id}&conv_id=${conv_id}&message=${encodedMessage}`;
    
    // Create EventSource with authorization header
    const eventSource = new EventSource(url, {
      withCredentials: true
    });
    
    // Create headers for the EventSource
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    // Note: We can't use headers with EventSource directly,
    // but the browser will handle credentials if withCredentials is true
    
    return eventSource;
  }
}; 