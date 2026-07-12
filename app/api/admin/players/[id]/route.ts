import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const params = await props.params;
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      sport: true,
      team: true,
      achievements: true,
      tournaments: { include: { tournament: true } },
    },
  });

  if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

  return NextResponse.json(player);
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const params = await props.params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const sportId = String(body.sportId || "").trim();

  if (!name || !sportId) {
    return NextResponse.json({ error: "Player name and sport are required." }, { status: 400 });
  }

  const teamId = body.teamId || null;
  const team = teamId
    ? await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } })
    : null;

  const player = await prisma.player.update({
    where: { id: params.id },
    data: {
      name,
      slug: body.slug ? slugify(String(body.slug)) : undefined,
      avatar: body.avatar || null,
      heroImage: body.heroImage || null,
      bio: body.bio || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      birthPlace: body.birthPlace || null,
      nationality: body.nationality || "India",
      ageGroup: body.ageGroup || null,
      height: body.height ? Number(body.height) : null,
      weight: body.weight ? Number(body.weight) : null,
      position: body.position || null,
      currentAcademy: body.currentAcademy || team?.name || null,
      profileStatus: body.profileStatus || "REVIEW",
      verificationStatus: body.verificationStatus || "SOURCE_LINKED",
      sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
      socialLinks: body.socialLinks || {},
      medals: body.medals || { gold: 0, silver: 0, bronze: 0 },
      sportId,
      teamId,
    },
  });

  return NextResponse.json(player);
}
