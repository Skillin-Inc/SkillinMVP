import { API_CONFIG } from "../../config/api";
import { RegisterData, User, BackendUser, UpdateUserProfileData } from "./types";
import { makeRequest, transformBackendUserToUser } from "./utils";

export const register = async (userData: RegisterData): Promise<User> => {
  const backendUser = await makeRequest<BackendUser>(
    API_CONFIG.ENDPOINTS.USERS,
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
    true
  );
  return transformBackendUserToUser(backendUser);
};

export const getUserById = async (id: string): Promise<BackendUser> => {
  return makeRequest<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {}, true);
};

export const getAllUsers = async (): Promise<BackendUser[]> => {
  return makeRequest<BackendUser[]>(API_CONFIG.ENDPOINTS.USERS, {}, true);
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  return makeRequest<{ success: boolean; message: string }>(
    `${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
    {
      method: "DELETE",
    },
    true
  );
};

export const updateUserType = async (
  userId: string,
  userType: "student" | "teacher" | "admin"
): Promise<{ success: boolean; message: string }> => {
  return makeRequest<{ success: boolean; message: string }>(
    `${API_CONFIG.ENDPOINTS.USERS}/${userId}/user-type`,
    {
      method: "PATCH",
      body: JSON.stringify({ userType }),
    },
    true
  );
};

export const updateUserProfile = async (userId: string, updateData: UpdateUserProfileData): Promise<BackendUser> => {
  const response = await makeRequest<{ message: string; user: BackendUser }>(
    `${API_CONFIG.ENDPOINTS.USERS}/${userId}/profile`,
    {
      method: "PATCH",
      body: JSON.stringify(updateData),
    },
    true
  );
  return response.user;
};

export const checkUsernameAvailability = async (username: string, excludeUserId?: string): Promise<boolean> => {
  const response = await makeRequest<{ available: boolean }>(
    `${API_CONFIG.ENDPOINTS.USERS}/check-username/${encodeURIComponent(username)}`,
    {
      method: "POST",
      body: JSON.stringify({ excludeUserId }),
    }
  );
  return response.available;
};
