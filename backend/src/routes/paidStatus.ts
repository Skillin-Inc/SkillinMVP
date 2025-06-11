// src/routes/paidStatus.ts
import { Router, Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const paidStatusRouter = Router();

paidStatusRouter.get("/", async (req: Request, res: Response) => {
  const email = (req.query.email as string) || "";
  if (!email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  try {
    // 1) find customer based on email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      res.json({ isPaid: false });
      return ;
    }
    const customer = customers.data[0];

    // 2) chk the subscription of this customer
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });

    // as long as there is at least one active subscription is seemed as payments
    const isPaid = subs.data.length > 0;
    res.json({ isPaid });
    return;
  } catch (err: any) {
    console.error("Stripe paid-status error:", err);
    res.status(500).json({ error: "Server error" });
    return;
  }
});
