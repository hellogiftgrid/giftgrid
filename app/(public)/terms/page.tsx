import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/config/branding";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that govern use of ${siteConfig.name}.`,
};

export default function TermsOfUsePage() {
  return (
    <LegalPage title="Terms of Use" updated="August 17, 2026">
      <p>
        These Terms of Use govern your access to and use of {siteConfig.name}. By creating an account or using the
        platform, you agree to these terms.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be authorized to represent the business you register, and the store you submit must be a live,
        functioning e-commerce store that you own or are authorized to act on behalf of.
      </p>

      <h2>The service</h2>
      <p>
        {siteConfig.name} reviews merchant stores and, where a store is deemed ready, works to connect merchants
        with relevant corporate gifting, wholesale, bulk-buyer, and related commercial opportunities. Being
        reviewed or listed does not guarantee acceptance into any specific opportunity — final decisions rest with
        the opportunity partner.
      </p>

      <h2>Merchant responsibilities</h2>
      <ul>
        <li>Provide accurate information about your business and store.</li>
        <li>Keep your account credentials confidential.</li>
        <li>Fulfill any orders or commitments arising from opportunities you accept in good faith.</li>
      </ul>

      <h2>Fees</h2>
      <p>
        Any fees or commission arrangements will be disclosed to you before they apply. We do not charge merchants
        upfront to be reviewed or listed unless explicitly stated.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate an account that provides false information, misuses the platform, or violates
        these terms. You may close your account at any time by contacting us.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The platform is provided &quot;as is.&quot; We do not guarantee that any store review, match, or opportunity
        will result in a specific business outcome.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent to {siteConfig.supportEmail}.</p>
    </LegalPage>
  );
}
