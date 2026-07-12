import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    userId: auth.userId,
    email: auth.email,
    role: "admin",
  });
}
