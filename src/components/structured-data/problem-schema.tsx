import { siteConfig } from "@/lib/site-config";

interface ProblemSchemaProps {
  title: string;
  description: string;
  url: string;
  category: string;
  categorySlug: string;
  author: {
    name: string | null;
  };
  createdAt: Date;
  voteCount: number;
  commentCount: number;
  solutionCount: number;
}

export function ProblemSchema({
  title,
  description,
  url,
  category,
  categorySlug,
  author,
  createdAt,
  voteCount,
  commentCount,
  solutionCount,
}: ProblemSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: title,
      text: description,
      dateCreated: createdAt.toISOString(),
      author: {
        "@type": "Person",
        name: author.name || "Anonymous",
      },
      acceptedAnswer:
        solutionCount > 0
          ? {
              "@type": "Answer",
              text: `This problem has ${solutionCount} solution${solutionCount !== 1 ? "s" : ""} available. Developers have built solutions for this validated problem.`,
            }
          : undefined,
      answerCount: solutionCount,
      upvoteCount: voteCount,
      commentCount: commentCount,
      about: {
        "@type": "Thing",
        name: "Validated Problem for Developers",
        description:
          "A real problem that developers can solve by building solutions",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category,
          item: `${siteConfig.url}/?category=${categorySlug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: url,
        },
      ],
    },
  };

  // Remove undefined properties
  if (!schema.mainEntity.acceptedAnswer) {
    delete schema.mainEntity.acceptedAnswer;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
