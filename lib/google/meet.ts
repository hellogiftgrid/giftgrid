import { google } from "googleapis";
import { createGoogleOAuthClient } from "@/lib/google/calendar";

export async function createGiftGridMeetEvent(input: {
  refreshToken: string;
  calendarId?: string | null;
  guestName: string;
  guestEmail: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  bookingToken: string;
}) {
  const auth = createGoogleOAuthClient();
  auth.setCredentials({ refresh_token: input.refreshToken });
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.insert({
    calendarId: input.calendarId || "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: "GiftGrid five-minute merchant introduction",
      description: "GiftGrid moderated call. Keep contact details inside GiftGrid.",
      start: { dateTime: input.startAt.toISOString(), timeZone: input.timezone },
      end: { dateTime: input.endAt.toISOString(), timeZone: input.timezone },
      attendees: [{ email: input.guestEmail, displayName: input.guestName }],
      conferenceData: { createRequest: { requestId: `giftgrid-${input.bookingToken}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    },
  });
  const event = response.data;
  const meetUrl = event.hangoutLink || event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
  if (!event.id || !meetUrl) throw new Error("Google Calendar did not return a Meet link.");
  return { eventId: event.id, meetUrl };
}
