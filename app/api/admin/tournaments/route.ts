import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

function platforms(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const tournaments = await prisma.tournament.findMany({
    include: { sport: true },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const name = String(body.name || "").trim();
  const sportId = String(body.sportId || "").trim();

  if (!name || !sportId || !body.startDate) {
    return NextResponse.json(
      { error: "Tournament name, sport, and start date are required." },
      { status: 400 }
    );
  }

  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  const tournament = await prisma.tournament.upsert({
    where: { slug },
    update: {
      name,
      description: body.description || null,
      status: body.status || "UPCOMING",
      winner: body.winner || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || "India",
      websiteUrl: body.websiteUrl || null,
      imageUrl: body.imageUrl || null,
      streamingUrl: body.streamingUrl || null,
      streamingPlatforms: platforms(body.streamingPlatforms),
      sportId,
    },
    create: {
      name,
      slug,
      description: body.description || null,
      status: body.status || "UPCOMING",
      winner: body.winner || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || "India",
      websiteUrl: body.websiteUrl || null,
      imageUrl: body.imageUrl || null,
      streamingUrl: body.streamingUrl || null,
      streamingPlatforms: platforms(body.streamingPlatforms),
      sportId,
    },
  });

  return NextResponse.json(tournament);
}
