import { notFound } from "next/navigation";
import { Metadata } from "next";
import { DocsLayout } from "@/components/docs/docs-layout";
import { DocsContent } from "@/components/docs/docs-content";
import { getDocBySlug, getAllDocs } from "@/lib/docs";

interface DocsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  
  if (!doc) {
    return {
      title: "Documentation Not Found",
    };
  }

  return {
    title: `${doc.title} - BlazeNeuro Docs`,
    description: doc.description,
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <DocsLayout>
      <DocsContent doc={doc} />
    </DocsLayout>
  );
}
