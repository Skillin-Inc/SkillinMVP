import express, { Request, Response } from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

/**
 * ------------------------
 * Billing Portal Endpoint
 * ------------------------
 * Allows users to access Stripe's customer billing portal
 * where they can manage payment methods, see invoices, or cancel subscriptions.
 * Called from frontend when the user wants to manage their subscription.
 */
interface BillingPortalRequestBody {
  email: string;
  name?: string;
}

router.post(
  "/create-billing-portal-session",
  async (
    req: Request<Record<string, unknown>, Record<string, unknown>, BillingPortalRequestBody>,
    res: Response
  ): Promise<void> => {
    console.log(" [POST] /create-billing-portal-session triggered");
    const { email, name } = req.body;

    if (!email) {
      res.status(400).json({ error: "Missing user email" });
      return;
    }

    try {
      // Find existing customer by email or create new one if not exists
      const customers = await stripe.customers.list({ email, limit: 1 });
      let customer = customers.data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          email,
          name: name ?? "Unknown",
        });
      }

      // Create Stripe Billing Portal session for the customer
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${process.env.FRONTEND_URL}/settings`, // After managing billing, user returns here
      });

      res.json({ url: session.url });
      console.log("✅ Created portal session:", session.url);
    } catch (error: unknown) {
      // Error handling for debugging
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
  }
);

/**
 * ------------------------
 * Checkout Session Endpoint
 * ------------------------
 * Creates a Stripe Checkout session for the frontend, which redirects users
 * to Stripe's secure payment page for subscription payment.
 */
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    res.status(400).json({ error: "Missing userId or email" });
    return;
  }

  try {
    // Try to find an existing Stripe customer by email, otherwise create a new one
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { userId }, // Store userId for future lookup
      });
    }

    // Create a Stripe Checkout session for subscription payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // Your Stripe price/product ID from .env
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: `${process.env.FRONTEND_URL}/success`, // Redirect after payment
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,   // Redirect if canceled
    });

    res.json({ url: session.url });
    console.log("✅ Created checkout session:", session.url);
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
});


/**
 * ------------------------
 * Check Paid Status Endpoint
 * ------------------------
 * Checks if the user (by userId) currently has an active or trialing subscription in Stripe.
 * Used by frontend to lock/unlock premium features.
 */
router.post("/check-paid-status", async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  try {
    // Look up all Stripe customers (limit 1 for efficiency) and compare stored metadata.userId
    const customers = await stripe.customers.list({
      limit: 1,
      expand: ["data.subscriptions"],
      // Can't filter by metadata in the API, so must filter in code
    });

    // Debug log: Print all found userId metadata in Stripe customers
    const trimmedUserId = String(userId).trim();
    customers.data.forEach((c) => {
      console.log("→ Stripe metadata.userId:", JSON.stringify(c.metadata?.userId));
    });

    // Find customer by matching metadata.userId
    const customer = customers.data.find(
      (c) => String(c.metadata?.userId || "").trim() === trimmedUserId
    );

    if (!customer) {
      res.json({ isPaid: false }); // No Stripe customer found → definitely not paid
      return;
    }

    // Now check for active/trialing subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 1,
    });
    console.log("subscriptions data", subscriptions.data);

    // Find at least one subscription that's active or in trial period
    const activeSub = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // If found, isPaid=true, otherwise false
    res.json({ isPaid: !!activeSub });
  } catch (error) {
    console.error("❌ Error checking paid status:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

export default router;
