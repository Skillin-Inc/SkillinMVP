// src/server.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { pool } from "./db";

// Import route handlers
import userRoutes from "./routes/users";
import messageRoutes from "./routes/messages";
import categoryRoutes from "./routes/categories";
import courseRoutes from "./routes/courses";
import lessonRoutes from "./routes/lessons";
import progressRoutes from "./routes/progress";

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 4040;

const userSockets = new Map<string, string>();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    credentials: true,
  })
);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
app.get("/database-health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1");
    if (result.rows.length > 0) {
      res.json({
        status: "ok",
        message: "Database connection is healthy",
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error("No rows returned");
    }
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Serve favicon to prevent 404s
app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId: string) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("send_message", async (data: { sender_id: string; receiver_id: string; content: string }) => {
    try {
      const { createMessage } = await import("./db");
      const newMessage = await createMessage({
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.content,
      });

      const receiverSocketId = userSockets.get(data.receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", {
          id: newMessage.id,
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          content: newMessage.content,
          is_read: newMessage.is_read,
          created_at: newMessage.created_at,
        });
      }

      socket.emit("message_sent", {
        id: newMessage.id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        content: newMessage.content,
        is_read: newMessage.is_read,
        created_at: newMessage.created_at,
      });
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// API Routes
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/categories", categoryRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/progress", progressRoutes);

// 404 handler for unmatched routes
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
