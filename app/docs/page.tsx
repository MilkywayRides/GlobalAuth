import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocsLayout } from "@/components/docs/docs-layout";
import { getAllDocs, getCategories } from "@/lib/docs";
import { Book, Code, Smartphone, Zap, Webhook, ArrowRight, Star } from "lucide-react";

const categoryIcons = {
  "Introduction": Book,
  "Authentication": Zap,
  "API": Code,
  "Mobile": Smartphone,
  "SDK": Code,
  "Integration": Webhook,
};

const categoryDescriptions = {
  "Introduction": "Get started with BlazeNeuro Developer Portal",
  "Authentication": "Secure authentication methods and flows",
  "API": "Complete API reference and examples",
  "Mobile": "Mobile app integration guides",
  "SDK": "SDK usage and implementation",
  "Integration": "Webhooks and third-party integrations",
};

export default function DocsIndexPage() {
  const docs = getAllDocs();
  const categories = getCategories();

  const featuredDocs = [
    docs.find(doc => doc.slug === "getting-started"),
    docs.find(doc => doc.slug === "authentication"),
    docs.find(doc => doc.slug === "api-reference"),
  ].filter(Boolean);

  return (
    <DocsLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Book className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Documentation</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate with BlazeNeuro Developer Portal. 
            From authentication to mobile apps, we've got you covered.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-8 border">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-semibold">Quick Start</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Get up and running in minutes with our step-by-step guide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/docs/getting-started">
              <Button className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/docs/api-reference">
              <Button variant="outline">
                API Reference
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Docs */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDocs.map((doc) => {
              if (!doc) return null;
              const Icon = categoryIcons[doc.category as keyof typeof categoryIcons] || Code;
              
              return (
                <Link key={doc.slug} href={`/docs/${doc.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <Badge variant="secondary">{doc.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Updated {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryDocs = docs.filter(doc => doc.category === category);
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
              const description = categoryDescriptions[category as keyof typeof categoryDescriptions];
              
              return (
                <Card key={category} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-6 w-6" />
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </div>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryDocs.slice(0, 3).map((doc) => (
                        <Link
                          key={doc.slug}
                          href={`/docs/${doc.slug}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          • {doc.title}
                        </Link>
                      ))}
                      {categoryDocs.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{categoryDocs.length - 3} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              Join Community
            </Button>
            <Button variant="outline">
              Report Issue
            </Button>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}
