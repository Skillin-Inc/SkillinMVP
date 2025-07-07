import { API_CONFIG } from "../../config/api";
import { NewCategory, Category } from "./types";
import { makeRequest } from "./utils";

export const createCategory = async (categoryData: NewCategory): Promise<Category> => {
  return makeRequest<Category>(API_CONFIG.ENDPOINTS.CATEGORIES, {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const getAllCategories = async (): Promise<Category[]> => {
  return makeRequest<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
};

export const getCategoryById = async (id: string): Promise<Category> => {
  return makeRequest<Category>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
};

export const updateCategory = async (id: string, updateData: Partial<NewCategory>): Promise<Category> => {
  return makeRequest<Category>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
};

export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
    method: "DELETE",
  });
};
