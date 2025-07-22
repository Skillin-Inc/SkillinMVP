import { Router, Request, Response } from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, NewCategory } from "../db";
import { isValidId } from "../utils";

const router = Router();

// Helper function to validate UUID

router.post("/", async (req: Request<object, unknown, NewCategory>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewCategory)[] = ["title"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  if (!body.title.trim()) {
    res.status(400).json({ error: "Title cannot be empty" });
    return;
  }

  try {
    const categoryData = {
      title: body.title.trim(),
    };

    const newCategory = await createCategory(categoryData);
    res.status(201).json(newCategory);
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
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid category ID format" });
    return;
  }

  try {
    const category = await getCategoryById(id);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(category);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id);
  const updateData = req.body;

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid category ID format" });
    return;
  }

  const allowedFields = ["title"];
  const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));

  if (providedFields.length === 0) {
    res.status(400).json({ error: "Title field must be provided for update" });
    return;
  }

  try {
    const updatedCategory = await updateCategory(id, updateData);
    if (!updatedCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updatedCategory);
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

  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid category ID format" });
    return;
  }

  try {
    const deleted = await deleteCategory(id);
    if (!deleted) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
