"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminSessionIndicator({ mobile = false }: { mobile?: boolean }) {
  const { checked, logout, user: adminUser } = useAdminAuth();

  if (!checked) return null;

  if (!adminUser) {
    return (
      <Button
        variant="outline"
        size={mobile ? "default" : "sm"}
        nativeButton={false}
        render={<Link href="/admin" />}
      >
        Admin Login
      </Button>
    );
  }

  if (mobile) {
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <Badge variant="secondary" className="w-fit gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
          Admin logged in
        </Badge>
        <p className="truncate text-xs text-muted-foreground">{adminUser.email}</p>
        <div className="flex gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/admin" />}>
            Admin Panel
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="max-w-56 gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
        <span className="truncate">Admin: {adminUser.email}</span>
      </Badge>
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin" />}>
        Panel
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={logout} title="Sign out admin">
        <LogOut />
      </Button>
    </div>
  );
}
