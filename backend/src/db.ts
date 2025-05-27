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

  // TEMPORARY: compare plain text password
  if (user.hashedPassword !== password) {
    return null;
  }

  // OPTIONAL: remove this if you need hashedPassword on frontend (for now)
  // delete user.hashedPassword;

  return user;
}

// Delete Users
export async function deleteUserByEmail(email: string) {
  const result = await pool.query(
    `DELETE FROM public.users
     WHERE email = $1
     RETURNING *`,
    [email]
  );
  return result.rows[0] ?? null;
}
