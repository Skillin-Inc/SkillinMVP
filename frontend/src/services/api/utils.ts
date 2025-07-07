import { API_CONFIG } from "../../config/api";
import { BackendUser, User } from "./types";

export const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
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

export const transformBackendUserToUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    email: backendUser.email,
    phoneNumber: backendUser.phone_number,
    username: backendUser.username,
    createdAt: backendUser.created_at,
    userType: backendUser.user_type,
    stripeCustomerId: backendUser.stripe_customer_id,
    date_of_birth: backendUser.date_of_birth,
  };
};
