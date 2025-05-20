// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import usersRouter from "./routes/users";  // ← Import the users router

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

// Mount all /users routes
app.use("/users", usersRouter);


// Catch-all 404 for any unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
