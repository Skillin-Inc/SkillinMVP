import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /teachers — list all teachers
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.first_name, u.last_name, u.email, c.title AS category_title
      FROM public.teachers t
      JOIN public.users u ON t.user_id = u.id
      JOIN public.categories c ON t.category_id = c.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

// GET /teachers/:id
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      `SELECT t.*, u.first_name, u.last_name, u.email, c.title AS category_title
       FROM public.teachers t
       JOIN public.users u ON t.user_id = u.id
       JOIN public.categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
});

// PATCH /teachers/:id — update category
router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { category_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE public.teachers
       SET category_id = $1
       WHERE id = $2
       RETURNING *`,
      [category_id, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

// DELETE /teachers/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(`DELETE FROM public.teachers WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json({ message: "Teacher deleted", teacher: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

export default router;
