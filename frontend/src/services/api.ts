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

// Functional approach using closures
function createApiService() {
  const transformBackendUserToUser = (backendUser: BackendUser): User => {
    return {
      id: backendUser.id,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      email: backendUser.email,
      phoneNumber: backendUser.phone_number,
      username: backendUser.username,
      postalCode: backendUser.postal_code,
      createdAt: backendUser.created_at,
      isTeacher: false, // Default value since it's not in BackendUser
    };
  };

  const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
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
  };

  const register = async (userData: RegisterData): Promise<User> => {
    const backendUser = await makeRequest<BackendUser>(API_CONFIG.ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return transformBackendUserToUser(backendUser);
  };

  const login = async (loginData: LoginData): Promise<LoginResponse> => {
    const response = await makeRequest<{ success: boolean; user: BackendUser }>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    return {
      success: response.success,
      user: transformBackendUserToUser(response.user),
    };
  };

  const getUserById = async (id: number): Promise<BackendUser> => {
    return makeRequest<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  };

  const getAllUsers = async (): Promise<BackendUser[]> => {
    return makeRequest<BackendUser[]>(API_CONFIG.ENDPOINTS.USERS);
  };

  const getConversationsForUser = async (id: number): Promise<Conversation[]> => {
    return makeRequest<Conversation[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/conversations/${id}`);
  };

  const getMessagesBetweenUsers = async (id1: number, id2: number): Promise<BackendMessage[]> => {
    return makeRequest<BackendMessage[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/between/${id1}/${id2}`);
  };

  const createMessage = async (messageData: NewMessage): Promise<BackendMessage> => {
    return makeRequest<BackendMessage>(API_CONFIG.ENDPOINTS.MESSAGES, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  };

  const checkBackendConnection = async (): Promise<{ status: string; message: string; timestamp?: string }> => {
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
  };

  const checkDatabaseConnection = async (): Promise<{
    status: string;
    message: string;
    timestamp?: string;
    error?: string;
  }> => {
    return makeRequest<{ status: string; message: string; timestamp?: string; error?: string }>("/health/db");
  };

  // Return the public API
  return {
    register,
    login,
    getUserById,
    getAllUsers,
    getConversationsForUser,
    getMessagesBetweenUsers,
    createMessage,
    checkBackendConnection,
    checkDatabaseConnection,
  };
}

// Create and export a singleton instance
export const apiService = createApiService();
