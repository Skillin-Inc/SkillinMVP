export const WEBSOCKET_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4040",

  options: {
    transports: ["websocket", "polling"],
    timeout: 20000,
    forceNew: true,
  },
};
