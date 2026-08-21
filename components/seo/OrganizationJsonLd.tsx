export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.degiftgrid.com/#organization",
    name: "GiftGrid",
    url: "https://www.degiftgrid.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.degiftgrid.com/images/logo-horizontal.png",
    },
    email: "support@degiftgrid.com",
    description:
      "GiftGrid helps e-commerce merchants prepare, review, and position their stores for corporate gifting, buyer, wholesale, and business opportunities.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@degiftgrid.com",
      contactType: "customer support",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
