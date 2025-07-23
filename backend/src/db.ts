// src/db.ts
import { Pool } from "pg";
import "dotenv/config";
import { getRDSConnectionString } from "./aws-rds-config";

let pool: Pool | null = null;

async function initializePool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    const connectionString = await getRDSConnectionString();

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    await executeQuery("SELECT NOW()");

    return pool;
  } catch (error) {
    console.error("Failed to initialize database connection pool");
    pool = null;
    throw error;
  }
}

export async function getPool(): Promise<Pool> {
  if (!pool) {
    return await initializePool();
  }
  return pool;
}

type QueryParam = string | number | boolean | null | undefined;

async function executeQuery(text: string, params?: QueryParam[]) {
  const dbPool = await getPool();
  return await dbPool.query(text, params);
}

export async function getUserById(id: string) {
  const result = await executeQuery('SELECT * FROM public.users WHERE "id" = $1', [id]);
  return result.rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const result = await executeQuery("SELECT * FROM public.users WHERE username = $1", [username]);
  return result.rows[0] ?? null;
}

export async function getUserByPhone(phoneNumber: string) {
  const result = await executeQuery('SELECT * FROM public.users WHERE "phone_number" = $1', [phoneNumber]);
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const result = await executeQuery("SELECT * FROM public.users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function getIsPaidByUserId(id: string): Promise<boolean | null> {
  const result = await executeQuery("SELECT is_paid FROM public.users WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0].is_paid;
}

export async function getAllUsers() {
  const result = await executeQuery(
    'SELECT "id", "first_name", "last_name", email, "phone_number", username, "date_of_birth", "created_at" FROM public.users ORDER BY "created_at" DESC'
  );
  return result.rows;
}

export interface NewUser {
  id?: string; // Cognito userSub
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  userType: "student" | "teacher" | "admin";
  dateOfBirth?: string;
}

export async function createUser(data: NewUser) {
  const { id, firstName, lastName, email, phoneNumber, username, userType = "student", dateOfBirth } = data;

  const result = await executeQuery(
    `INSERT INTO public.users
    ("id", "first_name", "last_name", email, "phone_number", username, "user_type", "date_of_birth")
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING "id", "first_name", "last_name", email, "phone_number", username, "user_type", "date_of_birth", "created_at"`,
    [id, firstName, lastName, email, phoneNumber, username, userType, dateOfBirth]
  );

  return result.rows[0];
}

export interface NewMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
}

export interface NewCategory {
  title: string;
}

export interface Category {
  id: string;
  title: string;
}

export interface NewCourse {
  teacher_id: string;
  category_id: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  teacher_id: string;
  category_id: string;
  title: string;
  description: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_username?: string;
}

export interface NewLesson {
  teacher_id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
}

export async function createMessage(data: NewMessage) {
  const { sender_id, receiver_id, content } = data;

  const result = await executeQuery(
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

  const result = await executeQuery(
    `INSERT INTO public.categories
      ("title")
     VALUES ($1)
     RETURNING "id", "title"`,
    [title]
  );

  return result.rows[0];
}

export async function getAllCategories(): Promise<Category[]> {
  const result = await executeQuery(`SELECT * FROM public.categories ORDER BY title ASC`);

  return result.rows;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await executeQuery(`SELECT * FROM public.categories WHERE "id" = $1`, [id]);

  return result.rows[0] || null;
}

export async function updateCategory(id: string, data: Partial<NewCategory>): Promise<Category | null> {
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

  const result = await executeQuery(
    `UPDATE public.categories 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "title"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await executeQuery(`DELETE FROM public.categories WHERE "id" = $1`, [id]);

  return (result.rowCount ?? 0) > 0;
}

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

export async function getMessagesBetweenUsers(userId1: string, userId2: string) {
  const result = await executeQuery(
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

export async function getConversationsForUser(userId: string) {
  const result = await executeQuery(
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

export async function markMessagesAsRead(userId: string, otherUserId: string) {
  const result = await executeQuery(
    `UPDATE public.messages 
     SET "is_read" = true 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false
     RETURNING "id"`,
    [userId, otherUserId]
  );

  return result.rows;
}

export async function getUnreadCount(userId: string, otherUserId: string) {
  const result = await executeQuery(
    `SELECT COUNT(*) as unread_count
     FROM public.messages 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false`,
    [userId, otherUserId]
  );

  return Number(result.rows[0].unread_count);
}

export async function deleteUserByEmail(email: string) {
  const result = await executeQuery(
    `DELETE FROM public.users
     WHERE email = $1
     RETURNING *`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function updateUserTypeByEmail(email: string, newUserType: "student" | "teacher" | "admin") {
  const result = await executeQuery(
    `UPDATE public.users
     SET user_type = $1
     WHERE email = $2
     RETURNING *`,
    [newUserType, email]
  );

  return result.rows[0] ?? null;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  username?: string;
}

export async function updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  let paramCount = 1;

  if (updateData.firstName !== undefined) {
    fields.push(`first_name = $${paramCount++}`);
    values.push(updateData.firstName);
  }

  if (updateData.lastName !== undefined) {
    fields.push(`last_name = $${paramCount++}`);
    values.push(updateData.lastName);
  }

  if (updateData.phoneNumber !== undefined) {
    fields.push(`phone_number = $${paramCount++}`);
    values.push(updateData.phoneNumber);
  }

  if (updateData.dateOfBirth !== undefined) {
    fields.push(`date_of_birth = $${paramCount++}`);
    values.push(updateData.dateOfBirth);
  }

  if (updateData.username !== undefined) {
    fields.push(`username = $${paramCount++}`);
    values.push(updateData.username);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(userId);

  const result = await executeQuery(
    `UPDATE public.users
     SET ${fields.join(", ")}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
}

export async function checkUsernameAvailability(username: string, excludeUserId?: string) {
  let query = `SELECT id FROM public.users WHERE username = $1`;
  const values: string[] = [username];

  if (excludeUserId) {
    query += ` AND id != $2`;
    values.push(excludeUserId);
  }

  const result = await executeQuery(query, values);
  return result.rows.length === 0;
}

export async function updateUserPaymentStatus(userId: string, isPaid: boolean) {
  try {
    await executeQuery("UPDATE users SET is_paid = $1 WHERE id = $2", [isPaid, userId]);
    console.log(`✅ Updated payment status for user ${userId} to ${isPaid}`);
  } catch (error) {
    console.error(`❌ Failed to update user ${userId} payment status.`);
    throw error;
  }
}

export interface NewProgress {
  user_id: string;
  lesson_id: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
}

export interface ProgressWithLessonDetails {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
  lesson_title: string;
  lesson_description: string;
  lesson_video_url: string;
  course_id: string;
  course_title: string;
  teacher_first_name: string;
  teacher_last_name: string;
}

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
