"use client";

import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Doc } from "@/lib/docs";
import { CodeBlock } from 'fumadocs-ui/components/codeblock';

interface DocsContentProps {
  doc: Doc;
}

export function DocsContent({ doc }: DocsContentProps) {
  const toc = doc.sections.map(section => ({
    title: section.title,
    url: `#${section.id}`,
    depth: 2,
  }));

  return (
    <DocsPage
      toc={toc}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <div className="space-y-4 pb-8 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {doc.category}
          </Badge>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(doc.lastUpdated).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {doc.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {doc.description}
          </p>
        </div>
      </div>

      <DocsBody>
        <div className="space-y-12 pt-8">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {section.title}
              </h2>
              
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap mb-6">
                {section.content}
              </p>

              {section.code && (
                <CodeBlock lang={section.language || 'typescript'}>
                  {section.code}
                </CodeBlock>
              )}
            </section>
          ))}
        </div>
      </DocsBody>
    </DocsPage>
  );
}
