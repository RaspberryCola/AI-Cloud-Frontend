import { httpClient } from './httpClient';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ApiResponse 
} from '../types/api';

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.post('/users/login', data);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return httpClient.post('/users/register', data);
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth');
  }

  getAuthToken(): string | null {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      return token;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const userService = UserService.getInstance();