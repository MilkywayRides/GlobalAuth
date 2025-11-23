import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocsLayout } from "@/components/docs/docs-layout";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function DocsNotFound() {
  return (
    <DocsLayout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Documentation Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The documentation page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/docs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Docs
            </Link>
          </Button>
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </DocsLayout>
  );
}
