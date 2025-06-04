// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";

import usersRouter from "./routes/users";
import sendEmailRouter from "./routes/sendEmail";
import messagesRouter from "./routes/messages";
import { pool } from "./db";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"],
  },
});

const PORT = Number(process.env.PORT) || 4000;

// Store user socket connections
const userSockets = new Map<number, string>();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // change to 20mb if needed

// backend check
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

// db check
app.get("/health/db", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1 as test");
    if (result.rows.length > 0 && result.rows[0].test === 1) {
      res.status(200).json({
        status: "healthy",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        status: "unhealthy",
        message: "Database query returned unexpected result",
      });
    }
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user authentication/registration with socket
  socket.on("register", (userId: number) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data: { sender_id: number; receiver_id: number; content: string }) => {
    try {
      // Save message to database (you can reuse existing createMessage function)
      const { createMessage } = await import("./db");
      const newMessage = await createMessage({
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.content,
      });

      // Send message to receiver if they're online
      const receiverSocketId = userSockets.get(data.receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", {
          id: newMessage.id,
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          content: newMessage.content,
          created_at: newMessage.created_at,
        });
      }

      // Confirm message sent to sender
      socket.emit("message_sent", {
        id: newMessage.id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        content: newMessage.content,
        created_at: newMessage.created_at,
      });
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from active connections
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.use("/users", usersRouter);
app.use("/send-email", sendEmailRouter);
app.use("/messages", messagesRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
