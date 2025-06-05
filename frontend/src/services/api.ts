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
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  postalCode: number;
  createdAt: string;
  isTeacher: boolean;
}

export interface BackendUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  postal_code: number;
  created_at: string;
  is_teacher: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface Conversation {
  other_user_id: number;
  other_user_first_name: string;
  other_user_last_name: string;
  last_message: string;
  last_message_time: string;
}

export interface BackendMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  receiver_first_name?: string;
  receiver_last_name?: string;
}

export interface NewMessage {
  sender_id: number;
  receiver_id: number;
  content: string;
}

class ApiService {
  private transformBackendUserToUser(backendUser: BackendUser): User {
    return {
      id: backendUser.id,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      email: backendUser.email,
      phoneNumber: backendUser.phone_number,
      username: backendUser.username,
      postalCode: backendUser.postal_code,
      createdAt: backendUser.created_at,
      isTeacher: backendUser.is_teacher,
    };
  }

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
    const backendUser = await this.makeRequest<BackendUser>(API_CONFIG.ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return this.transformBackendUserToUser(backendUser);
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await this.makeRequest<{ success: boolean; user: BackendUser }>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    return {
      success: response.success,
      user: this.transformBackendUserToUser(response.user),
    };
  }

  async getUserById(id: number): Promise<BackendUser> {
    return this.makeRequest<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  }

  async getAllUsers(): Promise<BackendUser[]> {
    return this.makeRequest<BackendUser[]>(API_CONFIG.ENDPOINTS.USERS);
  }

  async getConversationsForUser(id: number): Promise<Conversation[]> {
    return this.makeRequest<Conversation[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/conversations/${id}`);
  }

  async getMessagesBetweenUsers(id1: number, id2: number): Promise<BackendMessage[]> {
    return this.makeRequest<BackendMessage[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/between/${id1}/${id2}`);
  }

  async createMessage(messageData: NewMessage): Promise<BackendMessage> {
    return this.makeRequest<BackendMessage>(API_CONFIG.ENDPOINTS.MESSAGES, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  async checkBackendConnection(): Promise<{ status: string; message: string; timestamp?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/`);
      if (response.ok) {
        return {
          status: "healthy",
          message: "Backend connection successful",
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Backend connection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async checkDatabaseConnection(): Promise<{ status: string; message: string; timestamp?: string; error?: string }> {
    return this.makeRequest<{ status: string; message: string; timestamp?: string; error?: string }>("/health/db");
  }
}

export const apiService = new ApiService();
