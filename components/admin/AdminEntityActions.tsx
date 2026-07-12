"use client";

import Link from "next/link";
import { Edit, Plus, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { Button } from "@/components/ui/button";

type CreateAction = {
  type: "player" | "team" | "tournament";
  href: string;
  label: string;
};

type EditAction = {
  type: "player" | "team" | "tournament";
  href: string;
  label?: string;
};

export function AdminEntityActions({
  creates = [],
  edit,
  compact = false,
}: {
  creates?: CreateAction[];
  edit?: EditAction;
  compact?: boolean;
}) {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) return null;

  if (edit) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        nativeButton={false}
        render={<Link href={edit.href} />}
      >
        <Edit />
        {edit.label || "Edit"}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
        Admin tools
      </div>
      {creates.map((action) => (
        <Button
          key={action.href}
          variant="outline"
          size={compact ? "sm" : "default"}
          nativeButton={false}
          render={<Link href={action.href} />}
        >
          <Plus />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
