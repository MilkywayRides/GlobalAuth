"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Book, Code, Smartphone, Zap, Webhook, Home, Search, ChevronRight } from "lucide-react";
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
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 mb-4 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-lg">BlazeNeuro</span>
        </Link>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search docs..." 
            className="pl-9 h-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          <Link 
            href="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <div className="h-px bg-border my-3" />

          {categories.map((category) => {
            const categoryDocs = docs.filter(doc => doc.category === category);
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
            const hasActiveDocs = categoryDocs.some(doc => pathname === `/docs/${doc.slug}`);
            
            return (
              <div key={category} className="space-y-1">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg",
                  hasActiveDocs ? "text-foreground" : "text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                  <span>{category}</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                </div>
                <div className="space-y-0.5 ml-6 border-l pl-3">
                  {categoryDocs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className={cn(
                        "block text-sm py-1.5 px-3 rounded-md transition-colors",
                        pathname === `/docs/${doc.slug}`
                          ? "text-primary font-medium bg-primary/10"
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

      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <Link href="/admin" className="block hover:text-foreground transition-colors">
            Admin Panel
          </Link>
          <Link href="/api/health" className="block hover:text-foreground transition-colors">
            API Status
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-primary/10">
              <Book className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">BlazeNeuro Docs</span>
          </Link>
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
        <div className="hidden lg:block w-72 border-r">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="container max-w-4xl mx-auto py-8 px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
