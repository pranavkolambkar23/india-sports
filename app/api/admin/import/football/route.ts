import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildFootballImport } from "@/lib/football-import";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const focus =
    typeof body.focus === "string" && body.focus.trim().length > 0
      ? body.focus.trim()
      : "Minerva Academy Indian youth football";

  const result = await buildFootballImport(focus);

  await prisma.importRun.create({
    data: {
      sportSlug: "football",
      focus,
      status: "COMPLETED",
      summary: `Found ${result.players.length} player drafts, ${result.people.length} contributor drafts, and ${result.tournaments.length} tournament leads.`,
      sources: result.sources.map((source) => source.url),
      payload: result as unknown as object,
    },
  });

  return NextResponse.json(result);
}
