import { httpClient } from "./httpClient";


import { ApiResponse, PageData } from "../types/common";
import {
    CreateKBRequest,
    KnowledgeItem,
    KnowledgeListParams,
    UpdateKBRequest,
    KnowledgeDocItem,
    KnowledgeDocListParams,
    DeleteKnowledgeDocsRequest,
    AddExistRequest,
    AddNewRequest,
    RetrieveRequest,
    RetrieveItem,
    KnowledgeChatStreamRequest
} from "../types/knowledge";


class KnowledgeService {
    private static instance: KnowledgeService;

    private constructor() { }

    public static getInstance(): KnowledgeService {
        if (!KnowledgeService.instance) {
            KnowledgeService.instance = new KnowledgeService();
        }
        return KnowledgeService.instance;
    }

    // 知识库相关
    // 获取知识库列表
    async getKnowledgeList(data: KnowledgeListParams): Promise<ApiResponse<PageData<KnowledgeItem>>> {
        return httpClient.get('/knowledge/page', { params: data });
    }

    // 创建知识库
    async createKnowledge(data: CreateKBRequest): Promise<ApiResponse<KnowledgeItem>> {
        return httpClient.post('/knowledge/create', data);
    }

    // 删除知识库
    async deleteKnowledge(kbID: string): Promise<ApiResponse<null>> {
        return httpClient.delete('/knowledge/delete', { params: { kb_id: kbID } });
    }

    // 获取知识库详情
    async getKnowledgeDetail(kbID: string): Promise<ApiResponse<KnowledgeItem>> {
        return httpClient.get('/knowledge/detail', { params: { kb_id: kbID } });
    }

    // 更新知识库
    async updateKnowledge(data: UpdateKBRequest): Promise<ApiResponse<null>> {
        return httpClient.post('/knowledge/update', data);
    }

    // 知识库文档相关
    // 获取知识库文档列表
    async getKnowledgeDocPage(data: KnowledgeDocListParams): Promise<ApiResponse<PageData<KnowledgeDocItem>>> {
        return httpClient.get('/knowledge/docPage', { params: data });
    }

    // 批量删除知识库文档
    async deleteKnowledgeDocs(data: DeleteKnowledgeDocsRequest): Promise<ApiResponse<null>> {
        return httpClient.post('/knowledge/docDelete', data);
    }

    // 导入云盘文件到知识库
    async importCloudFileToKnowledge(data: AddExistRequest): Promise<ApiResponse<null>> {
        return httpClient.post('/knowledge/add', data);
    }

    // 上传新文件到知识库
    async uploadFileToKnowledge(data: AddNewRequest): Promise<ApiResponse<null>> {
        const formData = new FormData();
        formData.append('kb_id', data.kb_id);
        formData.append('file', data.file);
        return httpClient.post('/knowledge/addNew', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }


    // RAG相关
    // 召回测试接口
    async retrieveKnowledge(data: RetrieveRequest): Promise<ApiResponse<RetrieveItem[]>> {
        return httpClient.post('/knowledge/retrieve', data);
    }
    
    // 问答接口
    async knowledgeChatStream(data: KnowledgeChatStreamRequest) :Promise<Response>{
        // 拦截器
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
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch stream' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      
        if (!response.body) {
          throw new Error('Response body is null');
        }
      
        return response; 
    }
}

export const knowledgeService = KnowledgeService.getInstance();