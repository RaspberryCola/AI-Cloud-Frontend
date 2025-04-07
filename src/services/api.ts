import axios from 'axios';

import { ApiResponse,PageData } from '../types/common';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果是二进制数据，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理错误响应
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权，清除认证信息并跳转到登录页
          localStorage.removeItem('auth');
          window.location.href = '/login';
          break;
        default:
          console.error('API Error:', data);
      }
    }
    return Promise.reject(error);
  }
);


// 知识库接口类型
export interface KnowledgeItem {
  ID: string;
  Name: string;
  Description: string;
  UserID: number;
  CreatedAt: string;
  UpdatedAt: string;
}

interface KnowledgeListParams {
  page: number;
  page_size: number;
  name?: string;
}

// 知识库文档接口类型
export interface KnowledgeDocItem {
  ID: string;
  UserID: number;
  KnowledgeBaseID: string;
  FileID: string;
  Title: string;
  DocType: string;
  Status: number;
  CreatedAt: string;
  UpdatedAt: string;
}

interface KnowledgeDocListParams {
  page: number;
  page_size: number;
  kb_id: string;
}

interface DeleteKnowledgeDocsRequest{
  doc_ids: string[];
}

// 批量删除知识库文档
export const deleteKnowledgeDocs = async (
  data: DeleteKnowledgeDocsRequest
): Promise<ApiResponse<null>> => {
  return api.post('/knowledge/docDelete', data);
};

// 知识库API
export const getKnowledgeList = async (
  params: KnowledgeListParams
): Promise<ApiResponse<PageData<KnowledgeItem>>> => {
  return api.get('/knowledge/page', { params });
};

export const createKnowledge = async (
  data: { Name: string; Description?: string }
): Promise<ApiResponse<KnowledgeItem>> => {
  return api.post('/knowledge/create', data);
};

export const updateKnowledge = async (
  id: string,
  data: { Name: string; Description?: string }
): Promise<ApiResponse<KnowledgeItem>> => {
  return api.put(`/knowledge/update/${id}`, data);
};

export const deleteKnowledge = async (
  id: string
): Promise<ApiResponse<null>> => {
  return api.delete(`/knowledge/delete/${id}`);
};

// 知识库文档API
export const getKnowledgeDocPage = async (
  params: KnowledgeDocListParams
): Promise<ApiResponse<PageData<KnowledgeDocItem>>> => {
  return api.get('/knowledge/docPage', { params });
};

export const getKnowledgeDetail = async (
  id: string
): Promise<ApiResponse<KnowledgeItem>> => {
  return api.get('/knowledge/detail', {
    params: {
      kb_id: id
    }
  });
};

// 导入云盘文件到知识库
export const importCloudFileToKnowledge = async (
  data: { file_id: string; kb_id: string }
): Promise<ApiResponse<null>> => {
  return api.post('/knowledge/add', data);
};

// 上传新文件到知识库
export const uploadFileToKnowledge = async (
  kb_id: string,
  file: File
): Promise<ApiResponse<null>> => {
  const formData = new FormData();
  formData.append('kb_id', kb_id);
  formData.append('file', file);
  return api.post('/knowledge/addNew', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 召回测试接口
interface RetrieveRequest {
  kb_id: string;
  query: string;
  top_k: number;
}

export interface RetrieveItem {
  id: string;
  content: string;
  kb_id: string;
  document_id: string;
  document_name: string;
  index: number;
  embeddings: any;
  score: number;
}

export const retrieveKnowledge = async (
  data: RetrieveRequest
): Promise<ApiResponse<RetrieveItem[]>> => {
  return api.post('/knowledge/retrieve', data);
};

// 知识库对话流式接口
interface KnowledgeChatStreamRequest {
  kbs: string[];
  query: string;
}

// Note: The response is a stream, so we don't define a specific response type here.
// The function will return the Response object directly for stream processing.
export const knowledgeChatStream = async (
  data: KnowledgeChatStreamRequest
): Promise<Response> => {
  const authData = localStorage.getItem('auth');
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authData) {
    const { token } = JSON.parse(authData);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch('http://localhost:8080/api/knowledge/stream', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Handle HTTP errors (e.g., 4xx, 5xx)
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch stream' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response; // Return the raw Response object
};
