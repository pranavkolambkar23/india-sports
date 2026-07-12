import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const params = await props.params;
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: { sport: true },
  });

  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  return NextResponse.json(team);
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const params = await props.params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const sportId = String(body.sportId || "").trim();

  if (!name || !sportId) {
    return NextResponse.json({ error: "Team name and sport are required." }, { status: 400 });
  }

  const team = await prisma.team.update({
    where: { id: params.id },
    data: {
      name,
      slug: body.slug ? slugify(String(body.slug)) : undefined,
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
