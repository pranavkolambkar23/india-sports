"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

let adminCheck: Promise<boolean> | null = null;

async function isAdmin() {
  if (adminCheck) return adminCheck;

  adminCheck = (async () => {
    const token = localStorage.getItem("india-sports-admin-token");
    if (!token) return false;

    const response = await fetch("/api/admin/me", {
      headers: { authorization: `Bearer ${token}` },
    });

    return response.ok;
  })();

  return adminCheck;
}

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
  const [visible, setVisible] = useAdminVisible();

  if (!visible) return null;

  if (edit) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        nativeButton={false}
        render={<Link href={edit.href} onClick={() => setVisible(false)} />}
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

function useAdminVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      isAdmin().then((allowed) => {
        if (mounted) setVisible(allowed);
      });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return [visible, setVisible] as const;
}
