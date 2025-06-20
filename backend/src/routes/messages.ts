// src/routes/messages.ts
import { Router, Request, Response } from "express";
import { createMessage, NewMessage, getMessagesBetweenUsers, getConversationsForUser, markMessagesAsRead } from "../db";

const router = Router();

router.post("/", async (req: Request<object, unknown, NewMessage>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewMessage)[] = ["sender_id", "receiver_id", "content"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (typeof body.sender_id !== "number" || typeof body.receiver_id !== "number") {
    res.status(400).json({ error: "sender_id and receiver_id must be numbers" });
    return;
  }

  if (!body.content.trim()) {
    res.status(400).json({ error: "Message content cannot be empty" });
    return;
  }

  try {
    const newMessage = await createMessage(body);
    res.status(201).json(newMessage);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
  return;
});

router.get("/between/:userId1/:userId2", async (req, res) => {
  const userId1 = Number(req.params.userId1);
  const userId2 = Number(req.params.userId2);

  if (isNaN(userId1) || isNaN(userId2)) {
    res.status(400).json({ error: "Invalid user IDs" });
    return;
  }

  try {
    const messages = await getMessagesBetweenUsers(userId1, userId2);
    res.json(messages);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  return;
});

router.get("/conversations/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const conversations = await getConversationsForUser(userId);
    res.json(conversations);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  return;
});

router.put("/mark-read/:userId/:otherUserId", async (req, res) => {
  const userId = Number(req.params.userId);
  const otherUserId = Number(req.params.otherUserId);

  if (isNaN(userId) || isNaN(otherUserId)) {
    res.status(400).json({ error: "Invalid user IDs" });
    return;
  }

  try {
    const markedMessages = await markMessagesAsRead(userId, otherUserId);
    res.json({ message: "Messages marked as read", count: markedMessages.length });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  return;
});

export default router;
