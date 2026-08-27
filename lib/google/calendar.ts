import { google } from "googleapis";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    required("GOOGLE_CLIENT_ID"),
    required("GOOGLE_CLIENT_SECRET"),
    required("GOOGLE_REDIRECT_URI")
  );
}

export function googleCalendarScopes() {
  return [
    "https://www.googleapis.com/auth/calendar",
  ];
}
