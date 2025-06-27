// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000",
  ENDPOINTS: {
    USERS: "/users",
    LOGIN: "/users/login",
    MESSAGES: "/messages",
    LESSONS: "/lessons",
    COURSES: "/courses",
    CATEGORIES: "/categories",
    PROGRESS: "/progress",
    DATABASE_HEALTH: "/health/db",
  },
  TIMEOUT: 10000,
};
