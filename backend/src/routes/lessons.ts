import { Router, Request, Response } from "express";
import {
  createLesson,
  NewLesson,
  getAllLessons,
  getLessonById,
  getLessonsByTeacher,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
} from "../db";
import { isValidId } from "../utils";

const router = Router();

router.post("/", async (req: Request<object, unknown, NewLesson>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewLesson)[] = ["teacher_id", "course_id", "title", "description", "video_url"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (!isValidId(body.teacher_id) || !isValidId(body.course_id)) {
    res.status(400).json({ error: "teacher_id and course_id must be valid UUIDs" });
    return;
  }

  try {
    const newLesson = await createLesson(body);
    res.status(201).json(newLesson);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  return;
});

router.get("/", async (req, res) => {
  try {
    const lessons = await getAllLessons();
    res.json(lessons);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  return;
});

router.get("/teacher/:teacherId", async (req, res) => {
  const teacherId = String(req.params.teacherId);

  if (!isValidId(teacherId)) {
    res.status(400).json({ error: "Invalid teacher ID format" });
    return;
  }

  try {
    const lessons = await getLessonsByTeacher(teacherId);
    res.json(lessons);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  return;
});

router.get("/course/:courseId", async (req, res) => {
  const courseId = String(req.params.courseId);

  if (!isValidId(courseId)) {
    res.status(400).json({ error: "Invalid course ID format" });
    return;
  }

  try {
    const lessons = await getLessonsByCourse(courseId);
    res.json(lessons);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  return;
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid lesson ID format" });
    return;
  }

  try {
    const lesson = await getLessonById(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    res.json(lesson);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  return;
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id);
  const updateData = req.body;

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid lesson ID format" });
    return;
  }

  const allowedFields = ["course_id", "title", "description", "video_url"];
  const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));

  if (providedFields.length === 0) {
    res.status(400).json({ error: "At least one field must be provided for update" });
    return;
  }

  if (updateData.course_id && (!isValidId(updateData.course_id) || typeof updateData.course_id !== "string")) {
    res.status(400).json({ error: "course_id must be a valid UUID" });
    return;
  }

  try {
    const updatedLesson = await updateLesson(id, updateData);
    if (!updatedLesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    res.json(updatedLesson);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid lesson ID format" });
    return;
  }

  try {
    const deleted = await deleteLesson(id);
    if (!deleted) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
