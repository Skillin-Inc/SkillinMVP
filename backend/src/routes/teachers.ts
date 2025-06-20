import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db";

const router = Router();

const readRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 read requests per windowMs
  message: "Too many read requests from this IP, please try again later.",
});

const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 write requests per windowMs
  message: "Too many write requests from this IP, please try again later.",
});

const deleteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 delete requests per hour
  message: "Too many delete requests from this IP, please try again later.",
});

// GET /teachers — list all teachers
router.get("/", readRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
  SELECT 
    t.*, 
    u.first_name, 
    u.last_name, 
    u.email, 
    u.username,
    u.phone_number,
    c.title AS category_title
  FROM public.teachers t
  JOIN public.users u ON t.user_id = u.id
  JOIN public.categories c ON t.category_id = c.id
`);

    res.json(result.rows);
  } catch {
    console.error("Failed to fetch teachers");
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

// GET /teachers/:id - Single teacher object
router.get("/:id", readRateLimiter, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      `SELECT t.*, u.first_name, u.last_name, u.username, u.email, c.title AS category_title

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
  } catch {
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
});

// PATCH /teachers/:id — update category
router.patch("/:id", writeRateLimiter, async (req: Request, res: Response) => {
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
  } catch {
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

// DELETE /teachers/:id
router.delete("/:id", deleteRateLimiter, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(`DELETE FROM public.teachers WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json({ message: "Teacher deleted", teacher: result.rows[0] });
  } catch {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

export default router;
