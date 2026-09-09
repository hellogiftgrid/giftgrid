"use client";

import { useEffect } from "react";

const COMMUNITY_URL = "https://community.degiftgrid.com/";
const REDIRECT_DELAY_MS = 30_000;

/** Gives every visitor time to see the public homepage before entering the community. */
export default function HomepageCommunityRedirect() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(COMMUNITY_URL);
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
