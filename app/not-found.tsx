import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          <Home className="mr-2 h-4 w-4" /> Go Home
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/sports" />}>
          <Search className="mr-2 h-4 w-4" /> Browse Sports
        </Button>
      </div>
    </div>
  );
}
