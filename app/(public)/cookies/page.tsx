import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies and similar technologies.`,
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" updated="August 17, 2026">
      <p>
        This Cookie Policy explains how {siteConfig.name} uses cookies and similar technologies when you visit our
        website or use the merchant portal.
      </p>

      <h2>What cookies we use</h2>
      <ul>
        <li>
          <strong>Essential cookies</strong> — required to keep you signed in and to operate the merchant portal
          securely. These are set by our authentication provider (Supabase) and can&apos;t be disabled without
          affecting core functionality.
        </li>
        <li>
          <strong>Preference cookies</strong> — remember basic settings, like whether a mobile menu is open.
        </li>
      </ul>

      <p>We do not currently use third-party advertising or tracking cookies.</p>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking essential cookies will
        prevent you from signing in or using the merchant portal.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy can be sent to {siteConfig.supportEmail}.</p>
    </LegalPage>
  );
}
