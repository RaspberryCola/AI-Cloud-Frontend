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