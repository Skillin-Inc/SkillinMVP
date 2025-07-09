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

export const updateUserSubscriptionDetails = async (
  userId: string,
  stripeCustomerId: string,
  subscriptionStatus: string,
  startDate: number,
  endDate: number | null,
  cancelAtPeriodEnd: boolean
) => {
  try {
    await pool.query(
      `UPDATE users 
       SET 
         stripe_customer_id = $1,
         subscription_status = $2,
         subscription_start_date = to_timestamp($3),
         subscription_end_date = ${endDate ? "to_timestamp($4)" : "NULL"},
         cancel_at_period_end = $5
       WHERE id = $6`,
      endDate
        ? [stripeCustomerId, subscriptionStatus, startDate, endDate, cancelAtPeriodEnd, userId]
        : [stripeCustomerId, subscriptionStatus, startDate, cancelAtPeriodEnd, userId]
    );

    console.log(`✅ Updated subscription for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to update subscription for user ${userId}:`, error);
  }
};
