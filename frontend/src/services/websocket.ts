import { io, Socket } from "socket.io-client";
import { WEBSOCKET_CONFIG } from "../config/websocket";

export interface SocketMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

// Functional approach using closures
function createWebSocketService() {
  let socket: Socket | null = null;
  let currentUserId: number | null = null;

  const connect = (baseUrl: string = WEBSOCKET_CONFIG.baseUrl): Socket => {
    if (socket?.connected) {
      return socket;
    }

    socket = io(baseUrl, WEBSOCKET_CONFIG.options);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      if (currentUserId) {
        registerUser(currentUserId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("connect_error", (...args: unknown[]) => {
      const error = args[0] as Error;
      console.error("WebSocket connection error:", error);
    });

    return socket;
  };

  const disconnect = (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const registerUser = (userId: number): void => {
    currentUserId = userId;
    if (socket?.connected) {
      socket.emit("register", userId);
    }
  };

  const sendMessage = (senderId: number, receiverId: number, content: string): void => {
    if (socket?.connected) {
      socket.emit("send_message", {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
      });
    } else {
      console.error("WebSocket not connected");
    }
  };

  const onNewMessage = (callback: (message: SocketMessage) => void): void => {
    if (socket) {
      socket.on("new_message", (...args: unknown[]) => {
        const message = args[0] as SocketMessage;
        callback(message);
      });
    }
  };

  const onMessageSent = (callback: (message: SocketMessage) => void): void => {
    if (socket) {
      socket.on("message_sent", (...args: unknown[]) => {
        const message = args[0] as SocketMessage;
        callback(message);
      });
    }
  };

  const onMessageError = (callback: (error: { error: string }) => void): void => {
    if (socket) {
      socket.on("message_error", (...args: unknown[]) => {
        const error = args[0] as { error: string };
        callback(error);
      });
    }
  };

  const removeAllListeners = (): void => {
    if (socket) {
      socket.removeAllListeners("new_message");
      socket.removeAllListeners("message_sent");
      socket.removeAllListeners("message_error");
    }
  };

  const isConnected = (): boolean => {
    return socket?.connected ?? false;
  };

  // Return the public API
  return {
    connect,
    disconnect,
    registerUser,
    sendMessage,
    onNewMessage,
    onMessageSent,
    onMessageError,
    removeAllListeners,
    isConnected,
  };
}

// Create and export a singleton instance
export const websocketService = createWebSocketService();
