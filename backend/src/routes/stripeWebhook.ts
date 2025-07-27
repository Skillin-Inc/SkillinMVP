import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { updateUserPaymentStatus } from "../db/";
import { stripeConfig } from "../config/environment";

const router = express.Router();
const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: "2025-06-30.basil",
});

router.post(
  "/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeConfig.webhookSecret);
    } catch {
      console.error("Webhook Error");
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
