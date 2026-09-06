export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Collex AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Collex AI gives small sales teams an AI chatbot and follow-up system that captures leads, tracks pipelines, and reminds you to follow up  so no lead is forgotten.",
    offers: {
      "@type": "Offer",
      price: "1999",
      priceCurrency: "INR",
      priceValidUntil: "2027-12-31",
    },
    url: "https://collexai.vercel.app",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
