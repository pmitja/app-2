import { siteConfig } from "@/lib/site-config";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.title,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: siteConfig.url ? `${siteConfig.url}/problem-dock_logo.svg` : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

