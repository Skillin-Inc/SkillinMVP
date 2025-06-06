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
  isTeacher: boolean;
}

export async function createUser(data: NewUser) {
  const { firstName, lastName, email, phoneNumber, username, password, postalCode, isTeacher = false } = data;

  const result = await pool.query(
    `INSERT INTO public.users
    ("first_name", "last_name", email, "phone_number", username, "hashed_password", "postal_code", "is_teacher")
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING "id", "first_name", "last_name", email, "phone_number", username, "postal_code", "is_teacher", "created_at"`,
    [firstName, lastName, email, phoneNumber, username, password, postalCode, isTeacher]
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

export interface NewLesson {
  teacher_id: number;
  title: string;
  description: string;
  video_url: string;
}

export interface Lesson {
  id: number;
  teacher_id: number;
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
     RETURNING "id", "sender_id", "receiver_id", "content", "created_at"`,
    [sender_id, receiver_id, content]
  );

  return result.rows[0];
}

export async function createLesson(data: NewLesson) {
  const { teacher_id, title, description, video_url } = data;

  const result = await pool.query(
    `INSERT INTO public.lessons
      ("teacher_id", "title", "description", "video_url")
     VALUES ($1, $2, $3, $4)
     RETURNING "id", "teacher_id", "title", "description", "video_url", "created_at"`,
    [teacher_id, title, description, video_url]
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

export async function updateLesson(id: number, data: Partial<NewLesson>): Promise<Lesson | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

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
     RETURNING "id", "teacher_id", "title", "description", "video_url", "created_at"`,
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
    `SELECT m.*, 
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
            m.created_at as last_message_time
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  return result.rows;
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

// in Toggle Teacher Status
export async function toggleIsTeacherByEmail(email: string) {
  const current = await pool.query(`SELECT "is_teacher" FROM public.users WHERE email = $1`, [email]);

  if (current.rows.length === 0) return null;

  const flipped = !current.rows[0].is_teacher;

  const result = await pool.query(
    `UPDATE public.users
     SET "is_teacher" = $1
     WHERE email = $2
     RETURNING *`,
    [flipped, email]
  );

  return result.rows[0];
}
