import { httpClient } from './httpClient';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
}

export interface ChatDebugRequest {
  agent_id: string;
  message: string;
}

export interface ChatCreateRequest {
  agent_id: string;
}

export interface ChatCreateResponse {
  conv_id: string;
}

export interface ChatStreamRequest {
  agent_id: string;
  conv_id: string;
  message: string;
}

export interface ConversationItem {
  ID: number;
  ConvID: string;
  UserID: number;
  AgentID: string;
  Title: string;
  CreatedAt: number;
  UpdatedAt: number;
  Settings: Record<string, any> | null;
  IsArchived: boolean;
  IsPinned: boolean;
}

export interface ConversationListResponse {
  list: ConversationItem[];
  total: number;
  page: number;
  size: number;
}

// Custom EventSource-like interface for POST requests
export interface CustomEventSource {
  addEventListener: (type: string, listener: (event: any) => void) => void;
  removeEventListener: (type: string, listener: (event: any) => void) => void;
  onmessage?: (event: MessageEvent) => void;
  onerror?: (event: Event) => void;
  onopen?: (event: Event) => void;
  close: () => void;
}

export const chatService = {
  // Debug mode: Chat without saving history
  debugChat: (data: ChatDebugRequest): CustomEventSource => {
    const url = `/api/chat/debug`;
    const eventTarget = new EventTarget();
    let abortController = new AbortController();
    let closed = false;

    const customEventSource: CustomEventSource = {
      addEventListener: (type, listener) => {
        eventTarget.addEventListener(type, listener);
      },
      removeEventListener: (type, listener) => {
        eventTarget.removeEventListener(type, listener);
      },
      close: () => {
        closed = true;
        abortController.abort();
      }
    };

    // Get auth token from localStorage
    let token = null;
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      }
    } catch (err) {
      console.error('Error parsing auth data from localStorage:', err);
    }
    
    console.log('Using token for auth:', token ? 'Token available' : 'No token');

    // Start fetch request to stream data
    (async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            agent_id: data.agent_id,
            message: data.message
          }),
          signal: abortController.signal,
          credentials: 'include',
          mode: 'cors'
        });

        console.log('Debug chat response status:', response.status);

        // Dispatch open event
        const openEvent = new Event('open');
        eventTarget.dispatchEvent(openEvent);
        if (customEventSource.onopen) {
          customEventSource.onopen(openEvent);
        }

        // Check for authentication errors
        if (response.status === 401) {
          console.error('Authentication error (401): Please check your token');
          throw new Error('Authentication failed. Please login again.');
        }
        
        // Check for other error statuses
        if (!response.ok) {
          console.error(`HTTP error (${response.status}): ${response.statusText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!closed) {
          const { value, done } = await reader.read();
          if (done) {
            // End of stream detected
            if (!closed) {
              const doneEvent = new MessageEvent('done', { data: '' });
              eventTarget.dispatchEvent(doneEvent);
              closed = true;
            }
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          console.log('Raw buffer data:', buffer);
          
          // Process complete messages from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
          
          for (const line of lines) {
            console.log('Processing SSE line:', line);
            
            if (line.trim() === '') continue; // Skip empty lines
            
            if (line.startsWith('data:')) {
              // Handle standard SSE data line
              const data = line.slice(5).trim();
              console.log('Extracted data part:', data);
              
              // Check if it's a special "done" message
              if (data === '[DONE]' || data === 'done') {
                const doneEvent = new MessageEvent('done', { data: '' });
                eventTarget.dispatchEvent(doneEvent);
                closed = true;
                break;
              }
              
              const messageEvent = new MessageEvent('message', { data });
              eventTarget.dispatchEvent(messageEvent);
              if (customEventSource.onmessage) {
                customEventSource.onmessage(messageEvent);
              }
            } else if (line.startsWith('event:')) {
              // Handle SSE event type line
              const eventType = line.slice(6).trim();
              const nextLine = lines[lines.indexOf(line) + 1];
              if (nextLine && nextLine.startsWith('data:')) {
                const data = nextLine.slice(5).trim();
                const event = new MessageEvent(eventType, { data });
                eventTarget.dispatchEvent(event);
                
                // If it's a done event, close the stream
                if (eventType === 'done') {
                  closed = true;
                  break;
                }
              }
            } else {
              // Try to parse as JSON if it's not a standard SSE format
              try {
                const data = line.trim();
                const messageEvent = new MessageEvent('message', { data });
                eventTarget.dispatchEvent(messageEvent);
                if (customEventSource.onmessage) {
                  customEventSource.onmessage(messageEvent);
                }
              } catch (e) {
                console.error('Failed to parse non-SSE line:', line, e);
              }
            }
          }
        }

        // If we exited the loop normally and haven't sent a done event yet
        if (!closed) {
          const doneEvent = new MessageEvent('done', { data: '' });
          eventTarget.dispatchEvent(doneEvent);
        }
      } catch (error) {
        if (!closed) {
          const errorEvent = new ErrorEvent('error', { 
            error, 
            message: error instanceof Error ? error.message : String(error) 
          });
          eventTarget.dispatchEvent(errorEvent);
          if (customEventSource.onerror) {
            customEventSource.onerror(errorEvent);
          }
        }
      }
    })();

    return customEventSource;
  },

  // Create a new conversation
  createConversation: (data: ChatCreateRequest): Promise<{ code: number; message: string; data: ChatCreateResponse }> => {
    return httpClient.post('/chat/create', data);
  },

  // Stream conversation with agent
  streamConversation: (data: ChatStreamRequest) => {
    const eventSource = new EventSource(`/api/chat/stream?agent_id=${data.agent_id}&conv_id=${data.conv_id}&message=${encodeURIComponent(data.message)}`);
    return eventSource;
  },

  // List user's conversations
  listConversations: (page: number = 1, size: number = 10): Promise<{ code: number; message: string; data: ConversationListResponse }> => {
    return httpClient.get(`/chat/list?page=${page}&size=${size}`);
  },

  // List agent's conversations
  listAgentConversations: (agent_id: string, page: number = 1, size: number = 10, sort_order: 'asc' | 'desc' = 'asc'): Promise<{ code: number; message: string; data: ConversationListResponse }> => {
    return httpClient.get(`/chat/list?page=${page}&size=${size}&agent_id=${agent_id}&sort_order=${sort_order}`);
  },

  // Get conversation history
  getConversationHistory: (conv_id: string, limit: number = 50): Promise<{ code: number; message: string; data: { messages: ChatMessage[] } }> => {
    return httpClient.get(`/chat/history?conv_id=${conv_id}&limit=${limit}`);
  }
}; 