import { API_CONFIG } from "../../config/api";
import { BackendUser, User } from "./types";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import { userPool } from "../../config/userPool";

const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
          if (err) reject(err);
          else if (session) resolve(session);
          else reject(new Error("No session available"));
        });
      });
      if (session && session.isValid()) {
        return session.getIdToken().getJwtToken();
      }
    }
  } catch {
    return undefined;
  }
};

export const makeRequest = async <T>(endpoint: string, options: RequestInit = {}, requireAuth = false): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const baseHeaders: Record<string, string> = { "Content-Type": "application/json" };
  const requestHeaders = options.headers as Record<string, string> | undefined;
  const headers: Record<string, string> = { ...baseHeaders, ...requestHeaders };

  let authToken: string | undefined;
  if (requireAuth) {
    authToken = await getAuthToken();
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  }
  const config: RequestInit = { ...options, headers };
  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) throw error;
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
