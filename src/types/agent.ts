export interface AgentLLMConfig {
  model_id: string;
  temperature: number;
  top_p: number;
  max_output_length: number;
  thinking: boolean;
}

export interface AgentMCPConfig {
  servers: string[];
}

export interface AgentToolsConfig {
  tool_ids: string[];
}

export interface AgentKnowledgeConfig {
  knowledge_ids: string[];
}

export interface AgentSchema {
  llm_config: AgentLLMConfig;
  mcp: AgentMCPConfig;
  tools: AgentToolsConfig;
  prompt: string;
  knowledge: AgentKnowledgeConfig;
}

export interface AgentItem {
  id: string;
  user_id: number;
  name: string;
  description: string;
  schema: AgentSchema;
  created_at: string;
  updated_at: string;
}

export interface AgentListResponse {
  list: AgentItem[];
  total: number;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
}

export interface CreateAgentResponse {
  id: string;
}

export interface UpdateAgentRequest {
  id: string;
  name?: string;
  description?: string;
  llm_config?: {
    model_id?: string;
    temperature?: number;
    top_p?: number;
    max_output_length?: number;
    thinking?: boolean;
  };
  mcp?: {
    servers?: string[];
  };
  tools?: {
    tool_ids?: string[];
  };
  prompt?: string;
  knowledge?: {
    knowledge_ids?: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExecuteAgentRequest {
  query: string;
  history: ChatMessage[];
}

export interface ExecuteAgentResponse {
  result: string;
}
