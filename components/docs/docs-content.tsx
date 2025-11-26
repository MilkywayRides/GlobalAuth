"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Calendar, Hash } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Table of Contents */}
      {doc.sections.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            On this page
          </h2>
          <ul className="space-y-2.5">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-12 pt-4">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20 group">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center gap-2">
              <a
                href={`#${section.id}`}
                className="hover:text-primary transition-colors"
              >
                {section.title}
              </a>
              <a
                href={`#${section.id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Hash className="h-5 w-5 text-muted-foreground" />
              </a>
            </h2>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                {section.content}
              </p>
            </div>

            {section.code && (
              <div className="mt-6 not-prose">
                <div className="relative group/code">
                  <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 rounded-t-lg">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      {section.language || 'code'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(section.code!, section.id)}
                      className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      {copiedCode === section.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-zinc-950 p-4 rounded-b-lg overflow-x-auto border border-zinc-800">
                    <code className={cn(
                      "text-sm font-mono",
                      section.language === 'json' && "text-blue-400",
                      section.language === 'bash' && "text-yellow-300",
                      section.language === 'javascript' && "text-green-400",
                      section.language === 'typescript' && "text-blue-300",
                      section.language === 'kotlin' && "text-purple-400",
                      !section.language && "text-green-400"
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

      {/* Footer */}
      <div className="pt-12 mt-12 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated on {new Date(doc.lastUpdated).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
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
    </div>
  );
}
