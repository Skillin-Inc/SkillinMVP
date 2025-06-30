import { Router, Request, Response } from "express";
import {
  createLesson,
  getAllLessons,
  getLessonById,
  getLessonsByTeacher,
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
  NewLesson,
} from "../db";

const router = Router();

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

router.post("/", async (req: Request<object, unknown, NewLesson>, res: Response): Promise<void> => {
  const body = req.body;
  const required: (keyof NewLesson)[] = ["teacher_id", "course_id", "title", "description"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (!isValidUUID(body.teacher_id) || !isValidUUID(body.course_id)) {
    res.status(400).json({ error: "teacher_id and course_id must be valid UUIDs" });
    return;
  }

  if (!body.title.trim() || !body.description.trim()) {
    res.status(400).json({ error: "Title and description cannot be empty" });
    return;
  }

  const video_url = body.video_url || "";

  try {
    const lessonData = {
      teacher_id: body.teacher_id,
      course_id: body.course_id,
      title: body.title.trim(),
      description: body.description.trim(),
      video_url,
    };
    const newLesson = await createLesson(lessonData);
    res.status(201).json(newLesson);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
});

router.get("/", async (req, res) => {
  try {
    const lessons = await getAllLessons();
    res.json(lessons);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/:teacherId", async (req, res) => {
  const teacherId = String(req.params.teacherId);

  if (!isValidUUID(teacherId)) {
    res.status(400).json({ error: "Invalid teacher ID format" });
    return;
  }

  try {
    const lessons = await getLessonsByTeacher(teacherId);
    res.json(lessons);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/course/:courseId", async (req, res) => {
  const courseId = String(req.params.courseId);

  if (!isValidUUID(courseId)) {
    res.status(400).json({ error: "Invalid course ID format" });
    return;
  }

  try {
    const lessons = await getLessonsByCourse(courseId);
    res.json(lessons);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id);
  const updateData = req.body;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid lesson ID format" });
    return;
  }

  const allowedFields = ["course_id", "title", "description", "video_url"];
  const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));

  if (providedFields.length === 0) {
    res.status(400).json({ error: "At least one field must be provided for update" });
    return;
  }

  if (updateData.course_id && (!isValidUUID(updateData.course_id) || typeof updateData.course_id !== "string")) {
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
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
