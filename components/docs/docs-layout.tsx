"use client";

import 'fumadocs-ui/style.css';
import { DocsLayout as FumaDocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider';
import { getAllDocs, getCategories } from "@/lib/docs";
import { Book, Code, Smartphone, Zap, Webhook } from "lucide-react";

const categoryIcons = {
  "Introduction": Book,
  "Authentication": Zap,
  "API": Code,
  "Mobile": Smartphone,
  "SDK": Code,
  "Integration": Webhook,
};

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocs();
  const categories = getCategories();

  const tree = {
    name: 'Documentation',
    children: categories.map((category) => {
      const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
      return {
        type: 'folder' as const,
        name: category,
        icon: <Icon className="h-4 w-4" />,
        children: docs
          .filter(doc => doc.category === category)
          .map(doc => ({
            type: 'page' as const,
            name: doc.title,
            url: `/docs/${doc.slug}`,
          })),
      };
    }),
  };

  // Create search index for Fumadocs
  const searchIndex = docs.map(doc => ({
    title: doc.title,
    description: doc.description,
    url: `/docs/${doc.slug}`,
    keywords: [doc.category, ...doc.sections.map(s => s.title)],
  }));

  return (
    <RootProvider
      search={{
        enabled: true,
      }}
    >
      <FumaDocsLayout
        tree={tree}
        nav={{
          title: 'BlazeNeuro',
          url: '/',
        }}
      >
        {children}
      </FumaDocsLayout>
    </RootProvider>
  );
}
