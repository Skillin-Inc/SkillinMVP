// User database operations
import { executeQuery } from "./connection";
import { NewUser, UpdateUserProfileData } from "./types";

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
