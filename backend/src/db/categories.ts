// Category database operations
import { executeQuery } from "./connection";
import { NewCategory, Category } from "./types";

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
