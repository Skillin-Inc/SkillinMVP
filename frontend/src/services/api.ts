import { API_CONFIG } from "../config/api";

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  postalCode: number;
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  postalCode: number;
  createdAt: string;
  isTeacher: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async register(userData: RegisterData): Promise<User> {
    return this.makeRequest<User>(API_CONFIG.ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(loginData),
    });
  }

  async getUserById(userId: number): Promise<User> {
    return this.makeRequest<User>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`);
  }
}

export const apiService = new ApiService();
