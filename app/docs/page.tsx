import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocsLayout } from "@/components/docs/docs-layout";
import { getAllDocs, getCategories } from "@/lib/docs";
import { 
  Book, 
  Code, 
  Smartphone, 
  Zap, 
  Webhook, 
  ArrowRight, 
  Sparkles,
  Terminal,
  FileText,
  Rocket
} from "lucide-react";

const categoryIcons = {
  "Introduction": Book,
  "Authentication": Zap,
  "API": Code,
  "Mobile": Smartphone,
  "SDK": Terminal,
  "Integration": Webhook,
};

export default function DocsIndexPage() {
  const docs = getAllDocs();
  const categories = getCategories();

  const quickLinks = [
    { title: "Getting Started", href: "/docs/getting-started", icon: Rocket },
    { title: "Authentication", href: "/docs/authentication", icon: Zap },
    { title: "API Reference", href: "/docs/api-reference", icon: Code },
    { title: "SDK Guide", href: "/docs/sdk", icon: Terminal },
  ];

  return (
    <DocsLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Build with BlazeNeuro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Everything you need to integrate authentication, manage users, and build powerful applications.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how to get started
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryDocs = docs.filter(doc => doc.category === category);
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || FileText;
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{category}</h2>
                    <p className="text-sm text-muted-foreground">
                      {categoryDocs.length} {categoryDocs.length === 1 ? 'guide' : 'guides'}
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {categoryDocs.map((doc) => (
                    <Link key={doc.slug} href={`/docs/${doc.slug}`}>
                      <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200 group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {doc.title}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {doc.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {doc.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Follow our quickstart guide to integrate BlazeNeuro into your application in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/docs/getting-started">
                <Button size="lg" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Link href="/docs/api-reference">
                <Button size="lg" variant="outline" className="gap-2">
                  <Code className="h-4 w-4" />
                  API Reference
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </DocsLayout>
  );
}
