import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/server/services/payment.service";

/**
 * Payment webhook endpoint.
 *
 * In production, this must:
 * 1. Verify the webhook signature (HMAC)
 * 2. Only accept requests from the payment provider's IP range
 * 3. Process events idempotently (handled by the service layer)
 *
 * POST /api/webhooks/payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = request.headers.get("x-provider") || "razorpay";

    // TODO: In production, verify webhook signature here
    // const signature = request.headers.get("x-razorpay-signature");
    // if (!verifySignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const eventId = body.event_id || body.id || crypto.randomUUID();
    const eventType = body.event || body.type || "unknown";

    const result = await processPaymentWebhook({
      provider,
      eventId,
      eventType,
      payload: body,
      providerOrderId: body.payload?.payment?.entity?.order_id || body.data?.object?.metadata?.order_id || "",
      providerPaymentId: body.payload?.payment?.entity?.id || body.data?.object?.id || "",
    });

    return NextResponse.json({ status: result.status });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to prevent webhook retries on processing errors
    // The event is recorded regardless
    return NextResponse.json({ status: "error_recorded" }, { status: 200 });
  }
}

// Note: route segment config removed for cacheComponents compatibility.
// POST routes are not prerendered by default.
