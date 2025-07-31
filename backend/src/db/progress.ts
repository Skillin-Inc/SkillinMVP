// Progress database operations
import { executeQuery } from "./connection";
import { NewProgress, Progress, ProgressWithLessonDetails } from "./types";

export async function createProgress(data: NewProgress): Promise<Progress> {
  const { user_id, lesson_id } = data;

  const result = await executeQuery(
    `INSERT INTO public.progress ("user_id", "lesson_id")
     VALUES ($1, $2)
     ON CONFLICT ("user_id", "lesson_id") DO NOTHING
     RETURNING "id", "user_id", "lesson_id", "created_at"`,
    [user_id, lesson_id]
  );

  return result.rows[0];
}

export async function getProgressByUser(userId: string): Promise<ProgressWithLessonDetails[]> {
  const result = await executeQuery(
    `SELECT p.*, 
            l.title as lesson_title, 
            l.description as lesson_description, 
            l.video_url as lesson_video_url,
            c.id as course_id,
            c.title as course_title,
            u.first_name as teacher_first_name, 
            u.last_name as teacher_last_name
     FROM public.progress p
     JOIN public.lessons l ON p.lesson_id = l.id
     JOIN public.courses c ON l.course_id = c.id
     JOIN public.users u ON l.teacher_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function getProgressById(id: string): Promise<Progress | null> {
  const result = await executeQuery(`SELECT * FROM public.progress WHERE "id" = $1`, [id]);

  return result.rows[0] || null;
}

export async function getProgressByUserAndLesson(userId: string, lessonId: string): Promise<Progress | null> {
  const result = await executeQuery(`SELECT * FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
    userId,
    lessonId,
  ]);

  return result.rows[0] || null;
}

export async function deleteProgress(id: string): Promise<boolean> {
  const result = await executeQuery(`DELETE FROM public.progress WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function deleteProgressByUserAndLesson(userId: string, lessonId: string): Promise<boolean> {
  const result = await executeQuery(`DELETE FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
    userId,
    lessonId,
  ]);

  return (result.rowCount ?? 0) > 0;
}
