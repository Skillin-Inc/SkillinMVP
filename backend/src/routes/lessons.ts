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

router.post("/", async (req: Request<object, unknown, NewLesson>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewLesson)[] = ["teacher_id", "course_id", "title", "description"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (typeof body.teacher_id !== "number") {
    res.status(400).json({ error: "teacher_id must be a number" });
    return;
  }

  if (typeof body.course_id !== "number") {
    res.status(400).json({ error: "course_id must be a number" });
    return;
  }

  if (!body.title.trim() || !body.description.trim()) {
    res.status(400).json({ error: "Title and description cannot be empty" });
    return;
  }

  // video_url is optional for now (will be added via file upload later)
  const video_url = body.video_url || "";

  try {
    const lessonData = {
      teacher_id: body.teacher_id,
      course_id: body.course_id,
      title: body.title.trim(),
      description: body.description.trim(),
      video_url: video_url,
    };

    const newLesson = await createLesson(lessonData);
    res.status(201).json(newLesson);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
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

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lesson ID" });
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

router.get("/teacher/:teacherId", async (req, res) => {
  const teacherId = Number(req.params.teacherId);

  if (isNaN(teacherId)) {
    res.status(400).json({ error: "Invalid teacher ID" });
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
  const courseId = Number(req.params.courseId);

  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
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

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const allowedFields = ["course_id", "title", "description", "video_url"];
  const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));

  if (providedFields.length === 0) {
    res
      .status(400)
      .json({ error: "At least one field (course_id, title, description, video_url) must be provided for update" });
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
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lesson ID" });
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
