import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const name = params.slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${name || "Contributor"} - India Sports`,
    description: "Contributor profile for Indian sports development.",
  };
}

export default async function PersonPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const person = await prisma.person.findUnique({
    where: { slug: params.slug },
    include: { team: true },
  });

  if (!person) return notFound();

  const sourceUrls = person.sourceUrls || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/players"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Link>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {person.avatar ? (
                <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
              ) : (
                <Users className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold">{person.name}</h1>
            {person.roleTitle && <p className="mt-1 text-sm text-muted-foreground">{person.roleTitle}</p>}
            {person.organization && <Badge className="mt-3">{person.organization}</Badge>}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                {person.contributionSummary || "Contribution summary will be added after admin review."}
              </p>
              {person.bio && <p className="leading-relaxed">{person.bio}</p>}
            </CardContent>
          </Card>

          {sourceUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verified Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sourceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {url}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
