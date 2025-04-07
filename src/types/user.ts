import { ApiResponse } from './common';

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