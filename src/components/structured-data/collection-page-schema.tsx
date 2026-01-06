import { siteConfig } from "@/lib/site-config";

interface CollectionPageSchemaProps {
  itemCount?: number;
}

export function CollectionPageSchema({ itemCount }: CollectionPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    numberOfItems: itemCount,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

