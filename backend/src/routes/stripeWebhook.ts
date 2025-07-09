import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { updateUserPaymentStatus } from "../../controller/userController"; 

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

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          updateUserPaymentStatus(userId, true);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const uid = subscription.metadata?.userId;
        if (uid) {
          updateUserPaymentStatus(uid, status === "active");
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
