// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  // Use your backend server URL here
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000",

  // Connection options
  options: {
    transports: ["websocket", "polling"],
    timeout: 20000,
    forceNew: true,
  },
};
