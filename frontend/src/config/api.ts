// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4040",
  ENDPOINTS: {
    USERS: "/users",
    REGISTER: "/register",
    LOGIN: "/users/login",
    MESSAGES: "/messages",
    LESSONS: "/lessons",
    COURSES: "/courses",
    CATEGORIES: "/categories",
    PROGRESS: "/progress",
  },
  TIMEOUT: 10000,
};
