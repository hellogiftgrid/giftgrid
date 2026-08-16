import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 17, 2026">
      <p>
        This Privacy Policy explains how {siteConfig.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        collects, uses, and protects information when you use our website and merchant portal.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account information you provide when signing up: name, email, business name, and password.</li>
        <li>
          Store information you submit for review: store URL, platform, and product or business details relevant
          to opportunity matching.
        </li>
        <li>Usage data such as pages visited and actions taken within the merchant portal.</li>
        <li>Communications you send us through the contact form or support email.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create and manage your merchant account.</li>
        <li>To review your store and match it to relevant corporate gifting, wholesale, and buyer opportunities.</li>
        <li>To communicate with you about your application, review status, and opportunities.</li>
        <li>To improve the platform and troubleshoot issues.</li>
      </ul>

      <h2>When we share information</h2>
      <p>
        We share store and business information with an opportunity partner only when you have applied to or been
        matched with that opportunity. We do not sell merchant data to third parties, and we do not share it for
        unrelated marketing purposes.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain account and store information for as long as your account is active, and for a reasonable period
        afterward to comply with legal obligations and resolve disputes.
      </p>

      <h2>Your choices</h2>
      <p>
        You can request access to, correction of, or deletion of your personal information by contacting us at{" "}
        {siteConfig.supportEmail}.
      </p>

      <h2>Contact</h2>
      <p>Questions about this policy can be sent to {siteConfig.supportEmail}.</p>
    </LegalPage>
  );
}
