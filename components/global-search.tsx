"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, Key, Settings, BarChart3, FileText, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'page' | 'user' | 'app' | 'setting';
  icon: React.ReactNode;
  score?: number;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle navigation within dialog (separate from global shortcuts)
  const handleDialogKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (results[selectedIndex]) {
          e.preventDefault();
          handleSelect(results[selectedIndex]);
        }
        break;
    }
  }, [open, results, selectedIndex]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleDialogKeyDown);
      return () => document.removeEventListener("keydown", handleDialogKeyDown);
    }
  }, [open, handleDialogKeyDown]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!query.trim()) {
        setResults(getDefaultResults());
        setSelectedIndex(0);
        return;
      }
      performSearch(query);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const getDefaultResults = (): SearchResult[] => [
    {
      id: "dashboard",
      title: "Dashboard",
      description: "View your main dashboard",
      url: "/dashboard",
      type: "page",
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      id: "oauth-apps",
      title: "OAuth Apps",
      description: "Manage your OAuth applications",
      url: "/dashboard/oauth",
      type: "page",
      icon: <Key className="h-4 w-4" />
    },
    {
      id: "users",
      title: "Users",
      description: "View authenticated users",
      url: "/dashboard/users",
      type: "page",
      icon: <Users className="h-4 w-4" />
    },
  ];

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.url);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'app': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'setting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, apps, users..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                    index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => handleSelect(result)}
                >
                  {result.icon}
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-muted-foreground">{result.description}</div>
                  </div>
                  <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                    {result.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {query ? `No results found for "${query}"` : "Start typing to search..."}
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          ↑↓ to navigate • Enter to select • Esc to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
