// 知识库相关
export interface KnowledgeItem {
    ID: string;
    Name: string;
    Description: string;
    UserID: number;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface KnowledgeListParams {
    page: number;
    page_size: number;
    name?: string;
}

export interface CreateKBRequest {
    name: string;
    description?: string;
}

export interface UpdateKBRequest {
    kb_id: string;
    name?: string;
    description?: string;
}
// 知识库文档相关
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

export interface KnowledgeDocListParams {
    page: number;
    page_size: number;
    kb_id: string;
}

export interface DeleteKnowledgeDocsRequest {
    doc_ids: string[];
}

export interface AddExistRequest {
    kb_id: string;
    file_id: string;
}

export interface AddNewRequest {
    kb_id: string;
    file: File;
}

// RAG相关
export interface RetrieveRequest {
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

export interface KnowledgeChatStreamRequest {
    kbs: string[];
    query: string;
}