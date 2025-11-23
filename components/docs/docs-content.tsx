"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Doc } from "@/lib/docs";
import { cn } from "@/lib/utils";

interface DocsContentProps {
  doc: Doc;
}

export function DocsContent({ doc }: DocsContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{doc.category}</Badge>
          <span className="text-sm text-muted-foreground">
            Updated {new Date(doc.lastUpdated).toLocaleDateString()}
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
          <p className="text-xl text-muted-foreground mt-2">{doc.description}</p>
        </div>
      </div>

      <Separator />

      {/* Table of Contents */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">On this page</h2>
        <ul className="space-y-2">
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              {section.title}
              <a
                href={`#${section.id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </h2>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-7">
                {formatContent(section.content)}
              </p>
            </div>

            {section.code && (
              <div className="mt-6">
                <div className="relative">
                  <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border">
                    <span className="text-sm font-medium">
                      {section.language || 'code'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(section.code!, section.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === section.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-black text-green-400 p-4 rounded-b-lg overflow-x-auto border border-t-0">
                    <code className={cn(
                      "text-sm",
                      section.language === 'json' && "text-blue-300",
                      section.language === 'bash' && "text-yellow-300",
                      section.language === 'javascript' && "text-green-300",
                      section.language === 'kotlin' && "text-purple-300"
                    )}>
                      {section.code}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Footer Navigation */}
      <Separator />
      <div className="flex justify-between items-center pt-8">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit on GitHub
          </Button>
          <Button variant="outline" size="sm">
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
