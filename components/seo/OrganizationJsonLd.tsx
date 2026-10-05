export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.degiftgrid.com/#organization",
    name: "GiftGrid",
    url: "https://www.degiftgrid.com/",
    logo: {
      "@type": "ImageObject",
      url: "https://www.degiftgrid.com/images/logo-full.png",
    },
    email: "support@degiftgrid.com",
    description:
      "GiftGrid connects merchants and gifting teams through product listings, profiles and community conversations.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@degiftgrid.com",
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
