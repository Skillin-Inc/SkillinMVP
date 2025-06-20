// src/db.ts
import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUserById(id: number) {
  const result = await pool.query('SELECT * FROM public.users WHERE "id" = $1', [id]);
  return result.rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM public.users WHERE username = $1", [username]);
  return result.rows[0] ?? null;
}

export async function getUserByPhone(phoneNumber: string) {
  const result = await pool.query('SELECT * FROM public.users WHERE "phone_number" = $1', [phoneNumber]);
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function getAllUsers() {
  const result = await pool.query(
    'SELECT "id", "first_name", "last_name", email, "phone_number", username, "postal_code", "created_at" FROM public.users ORDER BY "created_at" DESC'
  );
  return result.rows;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  postalCode: number;
  userType: "student" | "teacher" | "admin";
}

export async function createUser(data: NewUser) {
  const { firstName, lastName, email, phoneNumber, username, password, postalCode, userType = "student" } = data;

  const result = await pool.query(
    `INSERT INTO public.users
    ("first_name", "last_name", email, "phone_number", username, "hashed_password", "postal_code", "user_type")
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING "id", "first_name", "last_name", email, "phone_number", username, "postal_code", "user_type", "created_at"`,
    [firstName, lastName, email, phoneNumber, username, password, postalCode, userType]
  );

  return result.rows[0];
}

export async function verifyUser(emailOrPhone: string, password: string) {
  let user;

  if (emailOrPhone.includes("@")) {
    user = await getUserByEmail(emailOrPhone);
  } else {
    user = await getUserByPhone(emailOrPhone);
  }

  if (!user) {
    return null;
  }

  if (user.hashed_password !== password) {
    return null;
  }

  delete user.hashed_password;
  return user;
}

export interface NewMessage {
  sender_id: number;
  receiver_id: number;
  content: string;
}

export interface NewCategory {
  title: string;
}

export interface Category {
  id: number;
  title: string;
}

export interface NewCourse {
  teacher_id: number;
  category_id: number;
  title: string;
  description: string;
}

export interface Course {
  id: number;
  teacher_id: number;
  category_id: number;
  title: string;
  description: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
}

export interface NewLesson {
  teacher_id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
}

export interface Lesson {
  id: number;
  teacher_id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
}

export async function createMessage(data: NewMessage) {
  const { sender_id, receiver_id, content } = data;

  const result = await pool.query(
    `INSERT INTO public.messages
      ("sender_id", "receiver_id", "content")
     VALUES ($1, $2, $3)
     RETURNING "id", "sender_id", "receiver_id", "content", "is_read", "created_at"`,
    [sender_id, receiver_id, content]
  );

  return result.rows[0];
}

export async function createCategory(data: NewCategory) {
  const { title } = data;

  const result = await pool.query(
    `INSERT INTO public.categories
      ("title")
     VALUES ($1)
     RETURNING "id", "title"`,
    [title]
  );

  return result.rows[0];
}

export async function getAllCategories(): Promise<Category[]> {
  const result = await pool.query(`SELECT * FROM public.categories ORDER BY title ASC`);

  return result.rows;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await pool.query(`SELECT * FROM public.categories WHERE "id" = $1`, [id]);

  return result.rows[0] || null;
}

export async function updateCategory(id: number, data: Partial<NewCategory>): Promise<Category | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    fields.push(`"title" = $${paramCount}`);
    values.push(data.title);
    paramCount++;
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE public.categories 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "title"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM public.categories WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function createCourse(data: NewCourse) {
  const { teacher_id, category_id, title, description } = data;

  const result = await pool.query(
    `INSERT INTO public.courses
      ("teacher_id", "category_id", "title", "description")
     VALUES ($1, $2, $3, $4)
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`,
    [teacher_id, category_id, title, description]
  );

  return result.rows[0];
}

export async function getAllCourses(): Promise<Course[]> {
  const result = await pool.query(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     ORDER BY c.created_at DESC`
  );

  return result.rows;
}

export async function getCourseById(id: number): Promise<Course | null> {
  const result = await pool.query(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c."id" = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getCoursesByTeacher(teacherId: number): Promise<Course[]> {
  const result = await pool.query(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.teacher_id = $1
     ORDER BY c.created_at DESC`,
    [teacherId]
  );

  return result.rows;
}

export async function getCoursesByCategory(categoryId: number): Promise<Course[]> {
  const result = await pool.query(
    `SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.category_id = $1
     ORDER BY c.created_at DESC`,
    [categoryId]
  );

  return result.rows;
}

export async function updateCourse(id: number, data: Partial<NewCourse>): Promise<Course | null> {
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

  const result = await pool.query(
    `UPDATE public.courses 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCourse(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM public.courses WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function createLesson(data: NewLesson) {
  const { teacher_id, course_id, title, description, video_url } = data;

  const result = await pool.query(
    `INSERT INTO public.lessons
      ("teacher_id", "course_id", "title", "description", "video_url")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`,
    [teacher_id, course_id, title, description, video_url]
  );

  return result.rows[0];
}

export async function getAllLessons(): Promise<Lesson[]> {
  const result = await pool.query(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     ORDER BY l.created_at DESC`
  );

  return result.rows;
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  const result = await pool.query(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l."id" = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getLessonsByTeacher(teacherId: number): Promise<Lesson[]> {
  const result = await pool.query(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.teacher_id = $1
     ORDER BY l.created_at DESC`,
    [teacherId]
  );

  return result.rows;
}

export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
  const result = await pool.query(
    `SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.course_id = $1
     ORDER BY l.created_at DESC`,
    [courseId]
  );

  return result.rows;
}

export async function updateLesson(id: number, data: Partial<NewLesson>): Promise<Lesson | null> {
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

  const result = await pool.query(
    `UPDATE public.lessons 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteLesson(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM public.lessons WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const result = await pool.query(
    `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
            u1."first_name" as sender_first_name, u1."last_name" as sender_last_name,
            u2."first_name" as receiver_first_name, u2."last_name" as receiver_last_name
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at ASC`,
    [userId1, userId2]
  );

  return result.rows;
}

export async function getConversationsForUser(userId: number) {
  const result = await pool.query(
    `SELECT DISTINCT 
            CASE 
                WHEN m.sender_id = $1 THEN m.receiver_id 
                ELSE m.sender_id 
            END as other_user_id,
            CASE 
                WHEN m.sender_id = $1 THEN u2."first_name" 
                ELSE u1."first_name" 
            END as other_user_first_name,
            CASE 
                WHEN m.sender_id = $1 THEN u2."last_name" 
                ELSE u1."last_name" 
            END as other_user_last_name,
            m.content as last_message,
            m.created_at as last_message_time,
            (SELECT COUNT(*) 
             FROM public.messages unread 
             WHERE unread.receiver_id = $1 
               AND unread.sender_id = CASE 
                   WHEN m.sender_id = $1 THEN m.receiver_id 
                   ELSE m.sender_id 
               END
               AND unread.is_read = false) as unread_count
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function markMessagesAsRead(userId: number, otherUserId: number) {
  const result = await pool.query(
    `UPDATE public.messages 
     SET "is_read" = true 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false
     RETURNING "id"`,
    [userId, otherUserId]
  );

  return result.rows;
}

export async function getUnreadCount(userId: number, otherUserId: number) {
  const result = await pool.query(
    `SELECT COUNT(*) as unread_count
     FROM public.messages 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false`,
    [userId, otherUserId]
  );

  return Number(result.rows[0].unread_count);
}

export async function deleteUserByEmail(email: string) {
  const result = await pool.query(
    `DELETE FROM public.users
     WHERE email = $1
     RETURNING *`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function updateUserTypeByEmail(email: string, newUserType: "student" | "teacher" | "admin") {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const current = await client.query(`SELECT id AS user_id, user_type FROM public.users WHERE email = $1`, [email]);

    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const { user_id, user_type: currentUserType } = current.rows[0];

    // If the user type is already the same, no need to update
    if (currentUserType === newUserType) {
      await client.query("ROLLBACK");
      return null;
    }

    const result = await client.query(
      `UPDATE public.users
       SET user_type = $1
       WHERE email = $2
       RETURNING *`,
      [newUserType, email]
    );

    // Handle teachers table updates
    if (newUserType === "teacher") {
      // Promote: Add to teachers table if not already there
      await client.query(
        `INSERT INTO public.teachers (user_id, category_id)
         SELECT $1, 1
         WHERE NOT EXISTS (
           SELECT 1 FROM public.teachers WHERE user_id = $1
         )`,
        [user_id]
      );
    } else if (currentUserType === "teacher") {
      // Demote: Remove from teachers table if they were a teacher
      await client.query(`DELETE FROM public.teachers WHERE user_id = $1`, [user_id]);
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export interface NewProgress {
  user_id: number;
  lesson_id: number;
}

export interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  created_at: string;
}

export interface ProgressWithLessonDetails {
  id: number;
  user_id: number;
  lesson_id: number;
  created_at: string;
  lesson_title: string;
  lesson_description: string;
  lesson_video_url: string;
  course_id: number;
  course_title: string;
  teacher_first_name: string;
  teacher_last_name: string;
}

export async function createProgress(data: NewProgress): Promise<Progress> {
  const { user_id, lesson_id } = data;

  const result = await pool.query(
    `INSERT INTO public.progress ("user_id", "lesson_id")
     VALUES ($1, $2)
     ON CONFLICT ("user_id", "lesson_id") DO NOTHING
     RETURNING "id", "user_id", "lesson_id", "created_at"`,
    [user_id, lesson_id]
  );

  return result.rows[0];
}

export async function getProgressByUser(userId: number): Promise<ProgressWithLessonDetails[]> {
  const result = await pool.query(
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

export async function getProgressById(id: number): Promise<Progress | null> {
  const result = await pool.query(`SELECT * FROM public.progress WHERE "id" = $1`, [id]);

  return result.rows[0] || null;
}

export async function getProgressByUserAndLesson(userId: number, lessonId: number): Promise<Progress | null> {
  const result = await pool.query(`SELECT * FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
    userId,
    lessonId,
  ]);

  return result.rows[0] || null;
}

export async function deleteProgress(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM public.progress WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function deleteProgressByUserAndLesson(userId: number, lessonId: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
    userId,
    lessonId,
  ]);

  return (result.rowCount ?? 0) > 0;
}
