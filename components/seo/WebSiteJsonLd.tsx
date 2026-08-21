export default function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.degiftgrid.com/#website",
    url: "https://www.degiftgrid.com/",
    name: "GiftGrid",
    description:
      "GiftGrid helps e-commerce merchants improve store readiness and pursue corporate gifting and commercial opportunities.",
    publisher: {
      "@id": "https://www.degiftgrid.com/#organization",
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
