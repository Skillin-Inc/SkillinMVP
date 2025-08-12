// src/server.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { serverConfig } from "./config/environment";
import { createServer } from "http";
import { Server } from "socket.io";

// Import route handlers

import userRoutes from "./routes/users";
import messageRoutes from "./routes/messages";
import categoryRoutes from "./routes/categories";
import courseRoutes from "./routes/courses";
import progressRoutes from "./routes/progress";

import lessonRoutes from "./routes/lessons";

// Import Cognito auth middleware
import { cognitoAuthMiddleware } from "./middleware/cognitoAuth";
import { validateEnvironmentConfig } from "./aws-rds-config";

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: serverConfig.frontendUrl,
    methods: ["GET", "POST"],
  },
});

const port = serverConfig.port;

const userSockets = new Map<string, string>();

app.use(express.json());
app.use(
  cors({
    origin: serverConfig.frontendUrl,
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

// Health check endpoint for CI/CD
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId: string) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("send_message", async (data: { sender_id: string; receiver_id: string; content: string }) => {
    try {
      const { createMessage } = await import("./db/");
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
    } catch {
      console.error("Error handling message");
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

// Public routes (no authentication required)

// Public registration endpoint (no authentication required)
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { createUser } = await import("./db");
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Public routes (no authentication required)
app.use("/categories", categoryRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/messages", messageRoutes);
app.use("/progress", progressRoutes);

// Protected routes (require Cognito authentication)
// i think its stuff that is locked to that account and that account only? idk yet
app.use("/users", cognitoAuthMiddleware, userRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

try {
  validateEnvironmentConfig();
} catch (error) {
  console.error("Server startup failed due to configuration issues:", error);
  process.exit(1);
}

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
