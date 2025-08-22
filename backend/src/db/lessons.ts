// Lesson database operations
import { executeQuery } from "./connection";
import { NewLesson, Lesson } from "./types";

export async function createLesson(data: NewLesson) {
  const { teacher_id, course_id, title, description, video_url } = data;

  const result = await executeQuery(
    `INSERT INTO public.lessons
      ("teacher_id", "course_id", "title", "description", "video_url")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`,
    [teacher_id, course_id, title, description, video_url]
  );

  return result.rows[0];
}

export async function getAllLessons(): Promise<Lesson[]> {
  const result = await executeQuery(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     ORDER BY l.created_at DESC`
  );

  return result.rows;
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const result = await executeQuery(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l."id" = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
  const result = await executeQuery(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.teacher_id = $1
     ORDER BY l.created_at DESC`,
    [teacherId]
  );

  return result.rows;
}

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const result = await executeQuery(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.course_id = $1
     ORDER BY l.created_at DESC`,
    [courseId]
  );

  return result.rows;
}

export async function updateLesson(id: string, data: Partial<NewLesson>): Promise<Lesson | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.course_id !== undefined) {
    fields.push(`"course_id" = $${paramCount}`);
    values.push(data.course_id);
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

  if (data.video_url !== undefined) {
    fields.push(`"video_url" = $${paramCount}`);
    values.push(data.video_url);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const result = await executeQuery(
    `UPDATE public.lessons 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const result = await executeQuery(`DELETE FROM public.lessons WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}
