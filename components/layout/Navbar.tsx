"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Heart,
  MapPin,
  Menu,
  Trophy,
  Users,
} from "lucide-react";
import { AdminSessionIndicator } from "@/components/admin/AdminSessionIndicator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/tournaments", label: "Tournaments", icon: Calendar },
  { href: "/players", label: "Players", icon: Users },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/donate", label: "Support Athletes", icon: Heart },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
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
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground ${
                pathname === link.href ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <AdminSessionIndicator />
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
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground ${
                    pathname === link.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              <AdminSessionIndicator mobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
