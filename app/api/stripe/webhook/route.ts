import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log("STRIPE WEBHOOK RECEIVED:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log("CHECKOUT COMPLETED:", session.id);

  const paymentId = session.metadata?.payment_id;

  if (!paymentId) {
    console.error("Checkout session is missing payment_id metadata");
    break;
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("loan_payments")
    .update({
      status: "succeeded",
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Failed to update loan payment:", error);
  } else {
    console.log("LOAN PAYMENT MARKED SUCCEEDED:", paymentId);
  }

  break;
}

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("PAYMENT SUCCEEDED:", paymentIntent.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("PAYMENT FAILED:", paymentIntent.id);
      break;
    }

    default:
      console.log("Unhandled Stripe event:", event.type);
  }

  return NextResponse.json({ received: true });
}