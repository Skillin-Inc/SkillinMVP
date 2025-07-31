// Course database operations
import { executeQuery } from "./connection";
import { NewCourse, Course } from "./types";

export async function createCourse(data: NewCourse) {
  const { teacher_id, category_id, title, description } = data;

  const result = await executeQuery(
    `INSERT INTO public.courses
      ("teacher_id", "category_id", "title", "description")
     VALUES ($1, $2, $3, $4)
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`,
    [teacher_id, category_id, title, description]
  );

  return result.rows[0];
}

export async function getAllCourses(): Promise<Course[]> {
  const result = await executeQuery(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     ORDER BY c.created_at DESC`
  );

  return result.rows;
}

export async function getCourseById(id: string): Promise<Course | null> {
  const result = await executeQuery(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c."id" = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getCoursesByTeacher(teacherId: string): Promise<Course[]> {
  const result = await executeQuery(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.teacher_id = $1
     ORDER BY c.created_at DESC`,
    [teacherId]
  );

  return result.rows;
}

export async function getCoursesByCategory(categoryId: string, limit?: number, offset?: number): Promise<Course[]> {
  let query = `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.category_id = $1
     ORDER BY c.created_at DESC`;

  const params: (string | number)[] = [categoryId];

  if (limit !== undefined) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }

  if (offset !== undefined) {
    query += ` OFFSET $${params.length + 1}`;
    params.push(offset);
  }

  const result = await executeQuery(query, params);

  return result.rows;
}

export async function updateCourse(id: string, data: Partial<NewCourse>): Promise<Course | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.category_id !== undefined) {
    fields.push(`"category_id" = $${paramCount}`);
    values.push(data.category_id);
    paramCount++;
  }

  if (data.title !== undefined) {
    fields.push(`"title" = $${paramCount}`);
    values.push(data.title);
    paramCount++;
  }

  if (data.description !== undefined) {
    fields.push(`"description" = $${paramCount}`);
    values.push(data.description);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const result = await executeQuery(
    `UPDATE public.courses 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const result = await executeQuery(`DELETE FROM public.courses WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}
