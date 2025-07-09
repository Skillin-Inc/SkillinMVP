import { API_CONFIG } from "../../config/api";
import { NewLesson, Lesson } from "./types";
import { makeRequest } from "./utils";

export const createLesson = async (lessonData: NewLesson): Promise<Lesson> => {
  return makeRequest<Lesson>(API_CONFIG.ENDPOINTS.LESSONS, {
    method: "POST",
    body: JSON.stringify(lessonData),
  });
};

export const getAllLessons = async (): Promise<Lesson[]> => {
  return makeRequest<Lesson[]>(API_CONFIG.ENDPOINTS.LESSONS);
};

export const getLessonById = async (id: string): Promise<Lesson> => {
  return makeRequest<Lesson>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`);
};

export const getLessonsByTeacher = async (teacherId: string): Promise<Lesson[]> => {
  return makeRequest<Lesson[]>(`${API_CONFIG.ENDPOINTS.LESSONS}/teacher/${teacherId}`);
};

export const updateLesson = async (id: string, updateData: Partial<NewLesson>): Promise<Lesson> => {
  return makeRequest<Lesson>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
};

export const deleteLesson = async (id: string): Promise<{ success: boolean; message: string }> => {
  return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`, {
    method: "DELETE",
  });
};

export const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  return makeRequest<Lesson[]>(`${API_CONFIG.ENDPOINTS.LESSONS}/course/${courseId}`);
};
