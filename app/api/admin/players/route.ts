import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

type AchievementInput = {
  title: string;
  description?: string;
  date?: string;
  category?: "INTERNATIONAL" | "NATIONAL" | "DOMESTIC";
  sourceUrls?: string[];
};

type TournamentInput = {
  name: string;
  status?: "PAST" | "CURRENT" | "UPCOMING";
  notes?: string;
  sourceUrls?: string[];
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const players = await prisma.player.findMany({
    include: {
      sport: true,
      team: true,
      achievements: { orderBy: { date: "desc" } },
      tournaments: { include: { tournament: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Player name is required." }, { status: 400 });
  }

  const sport = body.sportId
    ? await prisma.sport.findUnique({ where: { id: String(body.sportId) } })
    : await prisma.sport.upsert({
        where: { slug: "football" },
        update: {},
        create: {
          name: "Football",
          slug: "football",
          description: "Indian football from grassroots academies to the national team.",
          icon: "Football",
          color: "#15803d",
        },
      });

  if (!sport) {
    return NextResponse.json({ error: "Sport not found." }, { status: 400 });
  }

  const existingTeam = body.teamId
    ? await prisma.team.findUnique({ where: { id: String(body.teamId) } })
    : null;
  const teamName = String(
    body.currentAcademy || existingTeam?.name || "Independent"
  ).trim();
  const team =
    existingTeam ||
    (teamName
      ? await prisma.team.upsert({
          where: { slug: slugify(teamName) },
          update: {},
          create: {
            name: teamName,
            slug: slugify(teamName),
            sportId: sport.id,
            country: "India",
            description: "Team/academy created from player profile.",
          },
        })
      : null);

  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  const player = await prisma.player.upsert({
    where: { slug },
    update: {
      name,
      avatar: body.avatar || null,
      heroImage: body.heroImage || null,
      bio: body.bio || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      birthPlace: body.birthPlace || null,
      position: body.position || null,
      ageGroup: body.ageGroup || null,
      currentAcademy: teamName,
      nationality: body.nationality || "India",
      verificationStatus: "SOURCE_LINKED",
      profileStatus: body.profileStatus || "REVIEW",
      sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
      socialLinks: body.socialLinks || {},
      sportId: sport.id,
      teamId: team?.id || null,
    },
    create: {
      name,
      slug,
      avatar: body.avatar || null,
      heroImage: body.heroImage || null,
      bio: body.bio || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      birthPlace: body.birthPlace || null,
      position: body.position || null,
      ageGroup: body.ageGroup || null,
      currentAcademy: teamName,
      nationality: body.nationality || "India",
      verificationStatus: "SOURCE_LINKED",
      profileStatus: body.profileStatus || "REVIEW",
      sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
      socialLinks: body.socialLinks || {},
      medals: { gold: 0, silver: 0, bronze: 0 },
      sportId: sport.id,
      teamId: team?.id || null,
    },
  });

  for (const achievement of (body.achievements || []) as AchievementInput[]) {
    if (!achievement.title) continue;
    await prisma.achievement.create({
      data: {
        title: achievement.title,
        description: [
          achievement.description,
          achievement.sourceUrls?.length
            ? `Sources: ${achievement.sourceUrls.join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n\n"),
        date: achievement.date ? new Date(achievement.date) : new Date(),
        category: achievement.category || "DOMESTIC",
        playerId: player.id,
        sportId: sport.id,
      },
    });
  }

  for (const tournamentInput of (body.tournaments || []) as TournamentInput[]) {
    if (!tournamentInput.name) continue;
    const tournament = await prisma.tournament.upsert({
      where: { slug: slugify(tournamentInput.name) },
      update: {},
      create: {
        name: tournamentInput.name,
        slug: slugify(tournamentInput.name),
        sportId: sport.id,
        status:
          tournamentInput.status === "PAST"
            ? "COMPLETED"
            : tournamentInput.status === "CURRENT"
              ? "LIVE"
              : "UPCOMING",
        startDate: new Date(),
        location: "To be verified",
        country: "India",
        streamingPlatforms: [],
      },
    });

    await prisma.playerTournament.upsert({
      where: {
        playerId_tournamentId: {
          playerId: player.id,
          tournamentId: tournament.id,
        },
      },
      update: {
        status: tournamentInput.status || "UPCOMING",
        notes: tournamentInput.notes || null,
        sourceUrls: tournamentInput.sourceUrls || [],
      },
      create: {
        playerId: player.id,
        tournamentId: tournament.id,
        status: tournamentInput.status || "UPCOMING",
        notes: tournamentInput.notes || null,
        sourceUrls: tournamentInput.sourceUrls || [],
      },
    });
  }

  return NextResponse.json(player);
}
