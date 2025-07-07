import { API_CONFIG } from "../../config/api";
import { NewCourse, Course } from "./types";
import { makeRequest } from "./utils";

export const createCourse = async (courseData: NewCourse): Promise<Course> => {
  return makeRequest<Course>(API_CONFIG.ENDPOINTS.COURSES, {
    method: "POST",
    body: JSON.stringify(courseData),
  });
};

export const getAllCourses = async (): Promise<Course[]> => {
  return makeRequest<Course[]>(API_CONFIG.ENDPOINTS.COURSES);
};

export const getCourseById = async (id: string): Promise<Course> => {
  return makeRequest<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`);
};

export const getCoursesByTeacher = async (teacherId: string): Promise<Course[]> => {
  return makeRequest<Course[]>(`${API_CONFIG.ENDPOINTS.COURSES}/teacher/${teacherId}`);
};

export const updateCourse = async (id: string, updateData: Partial<NewCourse>): Promise<Course> => {
  return makeRequest<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
};

export const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
  return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`, {
    method: "DELETE",
  });
};

export const getCoursesByCategory = async (categoryId: string, limit?: number, offset?: number): Promise<Course[]> => {
  let endpoint = `${API_CONFIG.ENDPOINTS.COURSES}/category/${categoryId}`;

  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.append("limit", limit.toString());
  }
  if (offset !== undefined) {
    params.append("offset", offset.toString());
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return makeRequest<Course[]>(endpoint);
};
