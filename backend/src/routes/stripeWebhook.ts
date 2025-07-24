import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { updateUserPaymentStatus, updateUserSubscriptionDetails} from "../../controller/userController"; 

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

router.post(
  "/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      console.error("Unknown Webhook Error:", err);
      res.status(400).send("Unknown Webhook Error");
      return;
    }
    console.log("!!! Received Stripe webhook event.type:", event.type);

    switch (event.type) {
  case "checkout.session.completed":
  case "invoice.paid": {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const customerId = session.customer?.toString() ?? "";

    if (userId) {
      console.log("✅ Updating is_paid for user:", userId);
      updateUserPaymentStatus(userId, true);
    }

    break;
  }

case "customer.subscription.created":
case "customer.subscription.updated":
case "customer.subscription.deleted": {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;
  const stripeCustomerId = subscription.customer?.toString() ?? "";
  let subscriptionStatus: string = subscription.status;
  const startDate = subscription.start_date ?? null;
  const endDate = (subscription as any).current_period_end ?? null;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  const now = Math.floor(Date.now() / 1000);

  let isPaid = false;

  if (
    subscriptionStatus === "active" &&
    cancelAtPeriodEnd &&
    endDate &&
    now > endDate
  ) {
    // exceeds endDate，turns inactive，isPaid = false
    subscriptionStatus = "inactive";
    isPaid = false;
  } else if (subscriptionStatus === "active") {
    isPaid = true;
  } else {
    isPaid = false;
    subscriptionStatus = "inactive";
  }

  if (userId) {
    await updateUserPaymentStatus(userId, isPaid);

    await updateUserSubscriptionDetails(
      userId,
      stripeCustomerId,
      subscriptionStatus,   
      startDate,
      endDate,
      cancelAtPeriodEnd
    );
  }
  break;
}


  default: {
    console.log(`Unhandled event type: ${event.type}`);
  }
}


    res.status(200).send("OK");
  }
);

export default router;
