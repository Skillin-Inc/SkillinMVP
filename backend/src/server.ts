// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

import usersRouter from "./routes/users";
import sendEmailRouter from "./routes/sendEmail";
import messagesRouter from "./routes/messages";
import { pool } from "./db";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

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

app.use("/users", usersRouter);
app.use("/send-email", sendEmailRouter);
app.use("/messages", messagesRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
