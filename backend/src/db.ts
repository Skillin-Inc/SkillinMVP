// src/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     Number(process.env.PG_PORT) || 5432,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

export async function getUserById(id: number) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getUserByAccount(account_name: string) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE account_name = $1",
    [account_name]
  );
  return result.rows[0] ?? null;
}

export async function getUserByPhone(phone_number: string) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE phone_number = $1",
    [phone_number]
  );
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}


export interface NewUser {
  firstname:    string;
  lastname:     string;
  email:        string;
  phone_number: number;
  account_name: string;
  password:     string;
  postal_code:  number;
}

// Create new user
export async function createUser(data: NewUser) {
  const {
    firstname,
    lastname,
    email,
    phone_number,
    account_name,
    password,
    postal_code,
  } = data;

  const result = await pool.query(
    `INSERT INTO public.users
      (firstname, lastname, email, phone_number, account_name, password, postal_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [firstname, lastname, email, phone_number, account_name, password, postal_code]
  );

  
  return result.rows[0];
}
