//controller/userController.ts
import { pool } from "../src/db"; 

export const updateUserPaymentStatus = async (userId: string, isPaid: boolean) => {
  try {
    await pool.query(
      "UPDATE users SET is_paid = $1 WHERE id = $2",
      [isPaid, userId]
    );
    console.log(`✅ Updated payment status for user ${userId} to ${isPaid}`);
  } catch (error) {
    console.error(`❌ Failed to update user ${userId} payment status:`, error);
  }
};
