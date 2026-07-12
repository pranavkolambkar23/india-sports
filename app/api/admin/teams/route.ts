import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const teams = await prisma.team.findMany({
    include: { sport: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const name = String(body.name || "").trim();
  const sportId = String(body.sportId || "").trim();

  if (!name || !sportId) {
    return NextResponse.json({ error: "Team name and sport are required." }, { status: 400 });
  }

  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  const team = await prisma.team.upsert({
    where: { slug },
    update: {
      name,
      shortName: body.shortName || null,
      logo: body.logo || null,
      description: body.description || null,
      foundedYear: body.foundedYear ? Number(body.foundedYear) : null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || "India",
      website: body.website || null,
      socialLinks: body.socialLinks || {},
      sportId,
    },
    create: {
      name,
      slug,
      shortName: body.shortName || null,
      logo: body.logo || null,
      description: body.description || null,
      foundedYear: body.foundedYear ? Number(body.foundedYear) : null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || "India",
      website: body.website || null,
      socialLinks: body.socialLinks || {},
      sportId,
    },
  });

  return NextResponse.json(team);
}
