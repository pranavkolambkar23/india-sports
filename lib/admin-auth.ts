import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { verifyAdminSession } from "@/lib/admin-session";

export type AdminAuthResult =
  | { ok: true; userId: string; email?: string }
  | { ok: false; status: 401 | 403 | 500; error: string };

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, error: "Admin login required." };
  }

  const localSession = verifyAdminSession(token);
  if (localSession) {
    const profile = await prisma.profile.findUnique({
      where: { userId: localSession.userId },
      select: { role: true },
    });

    if (profile?.role !== "admin") {
      return { ok: false, status: 403, error: "Admin role required." };
    }

    return {
      ok: true,
      userId: localSession.userId,
      email: localSession.email,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, status: 500, error: "Supabase admin auth is not configured." };
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false, status: 401, error: "Invalid or expired admin session." };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: data.user.id },
    select: { role: true },
  });

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Admin role required." };
  }

  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email || undefined,
  };
}
