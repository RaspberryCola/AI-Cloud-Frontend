import axios from 'axios';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        default:
          console.error('API Error:', data);
      }
    }
    return Promise.reject(error);
  }
);

// 接口类型定义
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  code: number;
  data: {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  message: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
}

interface RegisterResponse {
  code: number;
  data: {
    id: number;
    username: string;
  };
  message: string;
}

// 文件列表接口类型
export interface FileItem {
  ID: string;
  UserID: number;
  Name: string;
  Size: number;
  Hash: string;
  MIMEType: string;
  IsDir: boolean;
  ParentID: string | null;
  StorageType: string;
  StorageKey: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface FileListResponse {
  code: number;
  message: string;
  data: {
    total: number;
    list: FileItem[];
  };
}

interface FileListParams {
  parent_id?: string;
  page: number;
  page_size: number;
  sort?: string;
}

// 创建文件夹请求参数
interface CreateFolderRequest {
  name: string;
  parent_id?: string;
}

// 创建文件夹响应类型
interface CreateFolderResponse {
  code: number;
  message: string;
  data: FileItem;
}

// 删除文件响应类型
interface DeleteFileResponse {
  code: number;
  message: string;
}

// 上传文件响应类型
interface UploadFileResponse {
  code: number;
  message: string;
  data: FileItem;
}

// API函数
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return api.post('/users/login', data);
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return api.post('/users/register', data);
};

export const getFileList = async (params: FileListParams): Promise<FileListResponse> => {
  return api.get('/files/page', { params });
};

export const createFolder = async (data: CreateFolderRequest): Promise<CreateFolderResponse> => {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.parent_id) {
    formData.append('parent_id', data.parent_id);
  }
  return api.post('/files/folder', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFile = async (fileId: string): Promise<DeleteFileResponse> => {
  return api.delete(`/files/delete`, { params: { file_id: fileId } });
};

export const downloadFile = async (fileId: string): Promise<Blob> => {
  const response = await api.get(`/files/download`, {
    params: { file_id: fileId },
    responseType: 'blob',
    transformResponse: (data) => data, // 防止响应被处理
  });
  return response.data;
};

export const uploadFile = async (file: File, parentId?: string): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (parentId) {
    formData.append('parent_id', parentId);
  }
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 