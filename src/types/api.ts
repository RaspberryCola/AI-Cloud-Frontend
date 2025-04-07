// 通用响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 用户相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  data: {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
  message: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface RegisterResponse {
  code: number;
  data: {
    id: number;
    username: string;
  };
  message: string;
}

export interface UserInfo {
  username: string;
  email: string;
}