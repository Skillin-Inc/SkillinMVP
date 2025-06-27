import { Router, Request, Response } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByTeacher,
  getCoursesByCategory,
  updateCourse,
  deleteCourse,
  NewCourse,
} from "../db";

const router = Router();

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

router.post("/", async (req: Request<object, unknown, NewCourse>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewCourse)[] = ["teacher_id", "category_id", "title", "description"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (typeof body.teacher_id !== "string" || !isValidUUID(body.teacher_id)) {
    res.status(400).json({ error: "teacher_id must be a valid UUID" });
    return;
  }

  if (typeof body.category_id !== "string" || !isValidUUID(body.category_id)) {
    res.status(400).json({ error: "category_id must be a valid UUID" });
    return;
  }

  if (!body.title.trim() || !body.description.trim()) {
    res.status(400).json({ error: "Title and description cannot be empty" });
    return;
  }

  try {
    const courseData = {
      teacher_id: body.teacher_id,
      category_id: body.category_id,
      title: body.title.trim(),
      description: body.description.trim(),
    };

    const newCourse = await createCourse(courseData);
    res.status(201).json(newCourse);
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
    const courses = await getAllCourses();
    res.json(courses);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid course ID format" });
    return;
  }

  try {
    const course = await getCourseById(id);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(course);
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
    const courses = await getCoursesByTeacher(teacherId);
    res.json(courses);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/category/:categoryId", async (req, res) => {
  const categoryId = String(req.params.categoryId);

  if (!isValidUUID(categoryId)) {
    res.status(400).json({ error: "Invalid category ID format" });
    return;
  }

  try {
    const courses = await getCoursesByCategory(categoryId);
    res.json(courses);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id);
  const updateData = req.body;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid course ID format" });
    return;
  }

  const allowedFields = ["category_id", "title", "description"];
  const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));

  if (providedFields.length === 0) {
    res.status(400).json({ error: "At least one field (category_id, title, description) must be provided for update" });
    return;
  }

  // Validate category_id if provided
  if (updateData.category_id && (!isValidUUID(updateData.category_id) || typeof updateData.category_id !== "string")) {
    res.status(400).json({ error: "category_id must be a valid UUID" });
    return;
  }

  try {
    const updatedCourse = await updateCourse(id, updateData);
    if (!updatedCourse) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json(updatedCourse);
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
  const id = String(req.params.id);

  if (!isValidUUID(id)) {
    res.status(400).json({ error: "Invalid course ID format" });
    return;
  }

  try {
    const deleted = await deleteCourse(id);
    if (!deleted) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
