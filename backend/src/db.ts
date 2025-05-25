// src/db.ts
import { Pool } from "pg";
import "dotenv/config";

// export const pool = new Pool({
//   host: process.env.PG_HOST,
//   port: Number(process.env.PG_PORT) || 5432,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DATABASE,
// });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getUserById(id: number) {
  const result = await pool.query('SELECT * FROM public.users WHERE "userId" = $1', [id]);
  return result.rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM public.users WHERE username = $1", [username]);
  return result.rows[0] ?? null;
}

export async function getUserByPhone(phoneNumber: string) {
  const result = await pool.query('SELECT * FROM public.users WHERE "phoneNumber" = $1', [phoneNumber]);
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  postalCode: number;
}

export async function createUser(data: NewUser) {
  const { firstName, lastName, email, phoneNumber, username, password, postalCode } = data;

  const result = await pool.query(
    `INSERT INTO public.users
      ("firstName", "lastName", email, "phoneNumber", username, "hashedPassword", "postalCode")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING "userId", "firstName", "lastName", email, "phoneNumber", username, "postalCode", "createdAt"`,
    [
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      password, // currently plain text for testing
      postalCode,
    ]
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

  if (user.hashedPassword !== password) {
    return null;
  }

  delete user.hashedPassword;
  return user;
}

// Message-related functions
export interface NewMessage {
  sender_id: number;
  receiver_id: number;
  content: string;
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

export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const result = await pool.query(
    `SELECT m.*, 
            u1."firstName" as sender_first_name, u1."lastName" as sender_last_name,
            u2."firstName" as receiver_first_name, u2."lastName" as receiver_last_name
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."userId"
     JOIN public.users u2 ON m.receiver_id = u2."userId"
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
                WHEN m.sender_id = $1 THEN u2."firstName" 
                ELSE u1."firstName" 
            END as other_user_first_name,
            CASE 
                WHEN m.sender_id = $1 THEN u2."lastName" 
                ELSE u1."lastName" 
            END as other_user_last_name,
            m.content as last_message,
            m.created_at as last_message_time
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."userId"
     JOIN public.users u2 ON m.receiver_id = u2."userId"
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  return result.rows;
}
