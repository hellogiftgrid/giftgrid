import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const event = body?.event ?? null;
    const payload = body?.payload ?? {};
    const invitee = payload?.invitee ?? {};
    const scheduledEvent = payload?.scheduled_event ?? {};

    console.log(
      "CALENDLY_DIAGNOSTIC",
      JSON.stringify({
        event,
        invitee_uri: invitee?.uri ?? null,
        invitee_email: invitee?.email ?? null,
        invitee_name: invitee?.name ?? null,
        invitee_timezone: invitee?.timezone ?? null,
        scheduled_event:
          invitee?.scheduled_event ??
          scheduledEvent?.uri ??
          null,
      })
    );

    if (
      event === "invitee.created" ||
      event === "invitee.canceled"
    ) {
      return NextResponse.json(
        {
          received: true,
          event,
          diagnostic: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        received: true,
        ignored: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "CALENDLY_DIAGNOSTIC_ERROR",
      error instanceof Error
        ? error.message
        : "unknown error"
    );

    return NextResponse.json(
      {
        received: false,
        error: "Invalid webhook payload",
      },
      { status: 400 }
    );
  }
}
