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

// Custom event source type for SSE handling
export interface CustomEventSource extends EventTarget {
  onmessage?: (event: MessageEvent) => void;
  addEventListener: (type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void;
  close: () => void;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export const chatService = {
  // Fetch conversation list for a specific agent
  listAgentConversations: async (
    agentId: string,
    page: number = 1,
    size: number = 10,
  ): Promise<ApiResponse<ConversationListResponse>> => {
    try {
      console.log(`Making API request to /chat/list/agent with agent_id=${agentId}, page=${page}, size=${size}`);
      const response = await api.get(`/chat/list/agent`, {
        params: { page, size, agent_id: agentId }
      });
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent conversations:', error);
      // Return a structured error response instead of throwing
      return {
        code: 1, // Non-zero code indicates error
        message: error instanceof Error ? error.message : 'Unknown error fetching conversations',
        data: { list: [], total: 0 } as ConversationListResponse
      };
    }
  },

  // Create a new conversation
  createConversation: async (
    agentId: string
  ): Promise<ApiResponse<CreateConversationResponse>> => {
    try {
      console.log(`Making API request to /chat/create with agent_id=${agentId}`);
      const response = await api.post('/chat/create', { agent_id: agentId });
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Return a structured error response
      return {
        code: 1,
        message: error instanceof Error ? error.message : 'Unknown error creating conversation',
        data: { conv_id: '' } as CreateConversationResponse
      };
    }
  },

  // Get conversation history
  getConversationHistory: async (
    convId: string
  ): Promise<ApiResponse<ConversationHistoryResponse>> => {
    try {
      console.log(`Making API request to /chat/history with conv_id=${convId}`);
      const response = await api.get('/chat/history', {
        params: { conv_id: convId }
      });
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      // Return structured error response
      return {
        code: 1,
        message: error instanceof Error ? error.message : 'Unknown error fetching history',
        data: { messages: [] } as ConversationHistoryResponse
      };
    }
  },

  // Delete a conversation
  deleteConversation: async (convId: string): Promise<ApiResponse<null>> => {
    try {
      console.log(`Making API request to /chat/delete with conv_id=${convId}`);
      const response = await api.delete('/chat/delete', {
        params: { conv_id: convId }
      });
      console.log('API response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // Return structured error response
      return {
        code: 1,
        message: error instanceof Error ? error.message : 'Unknown error deleting conversation',
        data: null
      };
    }
  },

  // Debug chat with an agent (without conversation context)
  debugChat: (data: { agent_id: string, message: string }): CustomEventSource => {
    const { agent_id, message } = data;
    const token = getToken();
    
    console.log(`Creating debug chat stream for agent ${agent_id} with message: ${message}`);
    
    // Create a custom event target to simulate EventSource
    const eventTarget = new EventTarget();
    
    // Add custom dispatch methods to make it easier to use
    const enhancedEventTarget = eventTarget as CustomEventSource;
    
    // Add custom methods
    enhancedEventTarget.onmessage = undefined;
    
    enhancedEventTarget.close = () => {
      // Cleanup - nothing to do for EventTarget
    };
    
    // Create headers for the request
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    });
    
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    // Make the POST request
    fetch(`/api/chat/debug`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ agent_id, message }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream body reader not available');
      }
      
      // Create a TextDecoder to convert Uint8Array to string
      const decoder = new TextDecoder();
      
      // Process chunks as they arrive
      const processStream = ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done) {
          console.log('Debug stream complete');
          const doneEvent = new Event('done');
          enhancedEventTarget.dispatchEvent(doneEvent);
          return Promise.resolve();
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received debug chat chunk:', chunk);
        
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            if (data) {
              const messageEvent = new MessageEvent('message', { data });
              enhancedEventTarget.dispatchEvent(messageEvent);
              if (enhancedEventTarget.onmessage) {
                enhancedEventTarget.onmessage(messageEvent);
              }
            }
          }
        }
        
        // Continue reading
        return reader.read().then(processStream);
      };
      
      // Start reading the stream
      return reader.read().then(processStream);
    })
    .catch(error => {
      console.error('Error in debug chat stream:', error);
      const errorEvent = new ErrorEvent('error', { error });
      enhancedEventTarget.dispatchEvent(errorEvent);
    });
    
    return enhancedEventTarget;
  },

  // Stream a conversation message
  streamConversation: (data: ConversationRequest): CustomEventSource => {
    const { agent_id, conv_id, message } = data;
    const token = getToken();
    
    console.log(`Creating stream for conversation ${conv_id} with message: ${message}`);
    
    // Create a custom event target to simulate EventSource
    const eventTarget = new EventTarget();
    
    // Add custom dispatch methods to make it easier to use
    const enhancedEventTarget = eventTarget as CustomEventSource;
    
    // Add custom methods
    enhancedEventTarget.onmessage = undefined;
    
    enhancedEventTarget.close = () => {
      // Cleanup - nothing to do for EventTarget
    };
    
    // Create headers for the request
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    });
    
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    // Make the POST request
    fetch(`/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ agent_id, conv_id, message }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream body reader not available');
      }
      
      // Create a TextDecoder to convert Uint8Array to string
      const decoder = new TextDecoder();
      
      // Process chunks as they arrive
      const processStream = ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done) {
          console.log('Stream complete');
          const doneEvent = new Event('done');
          enhancedEventTarget.dispatchEvent(doneEvent);
          return Promise.resolve();
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            if (data) {
              const messageEvent = new MessageEvent('message', { data });
              enhancedEventTarget.dispatchEvent(messageEvent);
              if (enhancedEventTarget.onmessage) {
                enhancedEventTarget.onmessage(messageEvent);
              }
            }
          }
        }
        
        // Continue reading
        return reader.read().then(processStream);
      };
      
      // Start reading the stream
      return reader.read().then(processStream);
    })
    .catch(error => {
      console.error('Error in stream:', error);
      const errorEvent = new ErrorEvent('error', { error });
      enhancedEventTarget.dispatchEvent(errorEvent);
    });
    
    return enhancedEventTarget;
  }
}; 