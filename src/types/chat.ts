export interface Message {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
}

export interface Conversation {
  id: string; // This is the ConvID
  title: string;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  isPinned: boolean;
}

export interface ConversationListResponse {
  total: number;
  list: {
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
  }[];
}

export interface ConversationHistoryResponse {
  messages: Message[];
}

export interface CreateConversationResponse {
  conv_id: string;
}

export interface ConversationRequest {
  agent_id: string;
  conv_id: string;
  message: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
} 