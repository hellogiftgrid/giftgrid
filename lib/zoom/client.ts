type ZoomTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

async function getAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom environment variables are not configured.");
  }

  const basic = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    "https://zoom.us/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "account_credentials",
        account_id: accountId,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Zoom token request failed: ${await response.text()}`
    );
  }

  const data =
    (await response.json()) as ZoomTokenResponse;

  return data.access_token;
}

export async function createZoomMeeting({
  userId = "me",
  topic,
  startAt,
  durationMinutes,
  timezone,
}: {
  userId?: string;
  topic: string;
  startAt: string;
  durationMinutes: number;
  timezone: string;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://api.zoom.us/v2/users/${encodeURIComponent(
      userId
    )}/meetings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        type: 2,
        start_time: startAt,
        duration: durationMinutes,
        timezone,
        settings: {
          join_before_host: true,
          waiting_room: true,
        },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Zoom meeting creation failed: ${await response.text()}`
    );
  }

  return response.json();
}
