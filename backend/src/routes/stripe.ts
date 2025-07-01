import express, { Request, Response } from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

interface BillingPortalRequestBody {
  email: string;
  name?: string;
}

const createBillingPortalSession = async (
  req: Request<Record<string, unknown>, Record<string, unknown>, BillingPortalRequestBody>,
  res: Response
): Promise<void> => {
  console.log("🔥 [POST] /create-billing-portal-session triggered");
  const { email, name } = req.body;

  if (!email) {
    res.status(400).json({ error: "Missing user email" });
    return;
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        name: name ?? "Unknown",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: "https://your-app.com/settings",  //todo
    });

    res.json({ url: session.url });
    console.log("✅ Created portal session:", session.url);
  } catch (error: unknown) {
  console.error("❌ Error creating billing portal session:");

  if (
    typeof error === "object" &&
    error !== null &&
    "raw" in error &&
    typeof (error as { raw: unknown }).raw === "object"
  ) {
    console.error("Stripe error:", (error as { raw: unknown }).raw);
  } else if (error instanceof Error) {
    console.error("General error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }

  res.status(500).json({ error: "Unable to create billing portal session" });
}

};

router.post("/create-billing-portal-session", createBillingPortalSession);

export default router;
