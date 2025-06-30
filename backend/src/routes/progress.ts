import { Router, Request, Response } from "express";
import {
  createProgress,
  getProgressByUser,
  getProgressById,
  getProgressByUserAndLesson,
  deleteProgress,
  deleteProgressByUserAndLesson,
  NewProgress,
} from "../db";

const router = Router();

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

router.post("/", async (req: Request<object, unknown, NewProgress>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewProgress)[] = ["user_id", "lesson_id"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (typeof body.user_id !== "string" || !isValidUUID(body.user_id)) {
    res.status(400).json({ error: "user_id must be a valid UUID" });
    return;
  }

  if (typeof body.lesson_id !== "string" || !isValidUUID(body.lesson_id)) {
    res.status(400).json({ error: "lesson_id must be a valid UUID" });
    return;
  }

  try {
    const existingProgress = await getProgressByUserAndLesson(body.user_id, body.lesson_id);

    if (existingProgress) {
      res.status(200).json(existingProgress);
      return;
    }

    const progressData = {
      user_id: body.user_id,
      lesson_id: body.lesson_id,
    };

    const newProgress = await createProgress(progressData);
    res.status(201).json(newProgress);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
});

router.get("/user/:userId", async (req, res) => {
  const userId = String(req.params.userId);

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

  try {
    const progressList = await getProgressByUser(userId);
    res.json(progressList);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/user/:userId/lesson/:lessonId", async (req, res) => {
  const userId = String(req.params.userId);
  const lessonId = String(req.params.lessonId);

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

  if (!isValidUUID(lessonId)) {
    res.status(400).json({ error: "Invalid lesson ID format" });
    return;
  }

  try {
    const deleted = await deleteProgressByUserAndLesson(userId, lessonId);
    if (!deleted) {
      res.status(404).json({ error: "Progress record not found" });
      return;
    }
    res.json({ success: true, message: "Progress record deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid progress ID format" });
    return;
  }

  try {
    const progress = await getProgressById(id);
    if (!progress) {
      res.status(404).json({ error: "Progress record not found" });
      return;
    }
    res.json(progress);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid progress ID format" });
    return;
  }

  try {
    const deleted = await deleteProgress(id);
    if (!deleted) {
      res.status(404).json({ error: "Progress record not found" });
      return;
    }
    res.json({ success: true, message: "Progress record deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
