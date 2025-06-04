import { io, Socket } from "socket.io-client";
import { WEBSOCKET_CONFIG } from "../config/websocket";

export interface SocketMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private currentUserId: number | null = null;

  connect(baseUrl: string = WEBSOCKET_CONFIG.baseUrl) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(baseUrl, WEBSOCKET_CONFIG.options);

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      // Register user with socket if we have a current user
      if (this.currentUserId) {
        this.registerUser(this.currentUserId);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  registerUser(userId: number) {
    this.currentUserId = userId;
    if (this.socket?.connected) {
      this.socket.emit("register", userId);
    }
  }

  sendMessage(senderId: number, receiverId: number, content: string) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
      });
    } else {
      console.error("WebSocket not connected");
    }
  }

  onNewMessage(callback: (message: SocketMessage) => void) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  onMessageSent(callback: (message: SocketMessage) => void) {
    if (this.socket) {
      this.socket.on("message_sent", callback);
    }
  }

  onMessageError(callback: (error: { error: string }) => void) {
    if (this.socket) {
      this.socket.on("message_error", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners("new_message");
      this.socket.removeAllListeners("message_sent");
      this.socket.removeAllListeners("message_error");
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();
