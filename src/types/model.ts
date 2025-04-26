import { ApiResponse, PageData } from "./common";

export type ModelType = 'llm' | 'embedding';
export type ModelServer = 'openai' | 'ollama';

export interface ModelItem {
  ID: string;
  UserID: number;
  Type: ModelType;
  ShowName: string;
  Server: ModelServer;
  BaseURL: string;
  ModelName: string;
  APIKey: string;
  Dimension?: number;
  MaxOutputLength?: number;
  Function?: boolean;
  MaxTokens?: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ModelListParams {
  type?: ModelType;
}

export interface CreateLLMModelRequest {
  type: 'llm';
  name: string;
  server: ModelServer;
  base_url: string;
  model: string;
  api_key: string;
  max_tokens?: number;
  function?: boolean;
  max_output_length?: number;
}

export interface CreateEmbeddingModelRequest {
  type: 'embedding';
  name: string;
  server: ModelServer;
  base_url: string;
  model: string;
  api_key: string;
  dimension: number;
  max_tokens?: number;
}

export type CreateModelRequest = CreateLLMModelRequest | CreateEmbeddingModelRequest;

export interface UpdateLLMModelRequest {
  id: string;
  type: 'llm';
  name: string;
  server: ModelServer;
  base_url: string;
  model: string;
  api_key: string;
  max_tokens?: number;
  function?: boolean;
  max_output_length?: number;
}

export interface UpdateEmbeddingModelRequest {
  id: string;
  type: 'embedding';
  name: string;
  server: ModelServer;
  base_url: string;
  model: string;
  api_key: string;
  dimension: number;
  max_tokens?: number;
}

export type UpdateModelRequest = UpdateLLMModelRequest | UpdateEmbeddingModelRequest;