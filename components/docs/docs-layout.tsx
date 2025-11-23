"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Book, Code, Smartphone, Zap, Webhook, Home } from "lucide-react";
import { getAllDocs, getCategories } from "@/lib/docs";
import { cn } from "@/lib/utils";

const categoryIcons = {
  "Introduction": Book,
  "Authentication": Zap,
  "API": Code,
  "Mobile": Smartphone,
  "SDK": Code,
  "Integration": Webhook,
};

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const docs = getAllDocs();
  const categories = getCategories();

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-6 border-b">
        <Book className="h-6 w-6" />
        <span className="font-semibold">Documentation</span>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-6">
          <div>
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Portal
            </Link>
          </div>

          {categories.map((category) => {
            const categoryDocs = docs.filter(doc => doc.category === category);
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" />
                  <h4 className="font-medium text-sm">{category}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {categoryDocs.length}
                  </Badge>
                </div>
                <div className="space-y-1 ml-6">
                  {categoryDocs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className={cn(
                        "block text-sm py-2 px-3 rounded-md transition-colors",
                        pathname === `/docs/${doc.slug}`
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {doc.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span className="font-semibold">Docs</span>
          </div>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-r bg-muted/10">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="container max-w-4xl mx-auto py-8 px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
