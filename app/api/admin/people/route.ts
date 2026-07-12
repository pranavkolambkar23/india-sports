import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const people = await prisma.person.findMany({
    include: { team: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(people);
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const sport = await prisma.sport.upsert({
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

  const organization = String(body.organization || "Minerva Academy").trim();
  const team = await prisma.team.upsert({
    where: { slug: slugify(organization) },
    update: {},
    create: {
      name: organization,
      slug: slugify(organization),
      sportId: sport.id,
      country: "India",
    },
  });

  const person = await prisma.person.upsert({
    where: { slug: body.slug ? slugify(String(body.slug)) : slugify(name) },
    update: {
      name,
      avatar: body.avatar || null,
      roleTitle: body.roleTitle || null,
      organization,
      bio: body.bio || null,
      contributionSummary: body.contributionSummary || null,
      socialLinks: body.socialLinks || {},
      sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
      sportId: sport.id,
      teamId: team.id,
      verificationStatus: "SOURCE_LINKED",
      profileStatus: body.profileStatus || "REVIEW",
    },
    create: {
      name,
      slug: body.slug ? slugify(String(body.slug)) : slugify(name),
      avatar: body.avatar || null,
      roleTitle: body.roleTitle || null,
      organization,
      bio: body.bio || null,
      contributionSummary: body.contributionSummary || null,
      socialLinks: body.socialLinks || {},
      sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
      sportId: sport.id,
      teamId: team.id,
      verificationStatus: "SOURCE_LINKED",
      profileStatus: body.profileStatus || "REVIEW",
    },
  });

  return NextResponse.json(person);
}
