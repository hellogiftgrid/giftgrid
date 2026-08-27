import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("Calendly webhook:", JSON.stringify(payload));

    const event = payload?.event;
    const invitee = payload?.payload?.invitee;
    const scheduledEvent = payload?.payload?.scheduled_event;

    if (
      event !== "invitee.created" &&
      event !== "invitee.canceled"
    ) {
      return NextResponse.json(
        { received: true, ignored: true },
        { status: 200 }
      );
    }

    /*
     * TEMPORARY:
     * Confirm that Calendly can reach GiftGrid first.
     *
     * Next step will:
     * - fetch full invitee/event data from Calendly
     * - map the event to a GiftGrid admin
     * - upsert the booking into Supabase
     * - send GiftGrid email through Resend
     */

    console.log("Calendly event:", event);
    console.log("Invitee URI:", invitee?.uri);
    console.log(
      "Scheduled event URI:",
      scheduledEvent?.uri
    );

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Calendly webhook error:", error);

    return NextResponse.json(
      { received: false },
      { status: 400 }
    );
  }
}
