// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000",
  ENDPOINTS: {
    USERS: "/users",
    LOGIN: "/users/login",
  },
  TIMEOUT: 10000,
};
