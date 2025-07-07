import { API_CONFIG } from "../../config/api";
import { BackendMessage, NewMessage, Conversation } from "./types";
import { makeRequest } from "./utils";

export const getConversationsForUser = async (id: string): Promise<Conversation[]> => {
  return makeRequest<Conversation[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/conversations/${id}`);
};

export const getMessagesBetweenUsers = async (id1: string, id2: string): Promise<BackendMessage[]> => {
  return makeRequest<BackendMessage[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/between/${id1}/${id2}`);
};

export const createMessage = async (messageData: NewMessage): Promise<BackendMessage> => {
  return makeRequest<BackendMessage>(API_CONFIG.ENDPOINTS.MESSAGES, {
    method: "POST",
    body: JSON.stringify(messageData),
  });
};

export const markMessagesAsRead = async (
  userId: string,
  otherUserId: string
): Promise<{ message: string; count: number }> => {
  return makeRequest<{ message: string; count: number }>(
    `${API_CONFIG.ENDPOINTS.MESSAGES}/mark-read/${userId}/${otherUserId}`,
    {
      method: "PUT",
    }
  );
};
