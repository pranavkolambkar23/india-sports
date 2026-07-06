"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Heart,
  LoaderCircle,
  MapPin,
  Menu,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/tournaments", label: "Tournaments", icon: Calendar },
  { href: "/players", label: "Players", icon: Users },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/donate", label: "Support Athletes", icon: Heart },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState<{
    href: string;
    fromPathname: string;
  } | null>(null);
  const pathname = usePathname();
  const loadingHref =
    loadingRoute?.fromPathname === pathname ? loadingRoute.href : null;

  function handleNavClick(href: string) {
    if (href !== pathname) setLoadingRoute({ href, fromPathname: pathname });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {loadingHref && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-orange-600/20">
          <div className="h-full w-full animate-pulse bg-orange-600" />
        </div>
      )}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 text-xl font-bold"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
            IN
          </span>
          <span className="hidden sm:inline">India Sports</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              aria-busy={loadingHref === link.href}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {loadingHref === link.href && (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-orange-600" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin" onClick={() => handleNavClick("/admin")}>
              {loadingHref === "/admin" && (
                <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin text-orange-600" />
              )}
              Admin
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    handleNavClick(link.href);
                    setOpen(false);
                  }}
                  aria-busy={loadingHref === link.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {loadingHref === link.href ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-orange-600" />
                  ) : (
                    <link.icon className="h-4 w-4" />
                  )}
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/admin"
                onClick={() => {
                  handleNavClick("/admin");
                  setOpen(false);
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {loadingHref === "/admin" && (
                  <LoaderCircle className="h-4 w-4 animate-spin text-orange-600" />
                )}
                Admin
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
