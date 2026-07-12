import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = await props.params;
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      sport: true,
      team: true,
      achievements: { orderBy: { date: "desc" } },
      tournaments: { include: { tournament: true } },
      mediaAssets: true,
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    imagePolicy: {
      maxBytes: 500 * 1024,
      storage: "Supabase Storage bucket `player-media` with local public/uploads fallback in development.",
    },
    player,
  });
}
