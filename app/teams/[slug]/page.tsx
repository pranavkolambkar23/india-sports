import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Shield, Trophy, Users } from "lucide-react";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    title: `${name || "Team"} - India Sports`,
    description: "Indian sports team profile, players, tournaments, and official links.",
  };
}

export default async function TeamPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: {
      sport: true,
      players: { orderBy: { name: "asc" } },
      achievements: { orderBy: { date: "desc" } },
    },
  });

  if (!team) return notFound();

  const tournaments = await prisma.tournament.findMany({
    where: { sportId: team.sportId },
    orderBy: { startDate: "desc" },
    take: 6,
  });
  const socialLinks = team.socialLinks as
    | { twitter?: string; instagram?: string; facebook?: string; youtube?: string }
    | null;

  function hrefFor(kind: string, value: string) {
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const handle = value.replace("@", "");
    if (kind === "twitter") return `https://twitter.com/${handle}`;
    if (kind === "instagram") return `https://instagram.com/${handle}`;
    return value;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={`/sports/${team.sport.slug}`}
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to {team.sport.name}
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {team.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={team.logo} alt={team.name} className="h-full w-full object-cover" />
              ) : (
                <Shield className="h-14 w-14 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <AdminEntityActions
                compact
                edit={{ type: "team", href: `/admin/teams/${team.id}/edit` }}
              />
            </div>
            <Badge
              className="mt-3 text-white"
              style={{ backgroundColor: team.sport.color || "#666" }}
            >
              {team.sport.icon} {team.sport.name}
            </Badge>

            <div className="mt-6 space-y-3 text-left text-sm">
              {team.shortName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Short name</span>
                  <span className="font-medium">{team.shortName}</span>
                </div>
              )}
              {[team.city, team.state, team.country].filter(Boolean).length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base</span>
                  <span className="text-right font-medium">
                    {[team.city, team.state, team.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {team.foundedYear && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Founded</span>
                  <span className="font-medium">{team.foundedYear}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Players</span>
                <span className="font-medium">{team.players.length}</span>
              </div>
            </div>

            {(team.website || socialLinks) && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {team.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    render={<a href={team.website} target="_blank" rel="noreferrer" />}
                  >
                    <Globe className="h-3 w-3" /> Website
                  </Button>
                )}
                {socialLinks &&
                  Object.entries(socialLinks).map(([kind, value]) =>
                    value ? (
                      <Button
                        key={kind}
                        variant="outline"
                        size="sm"
                        render={
                          <a href={hrefFor(kind, value)} target="_blank" rel="noreferrer" />
                        }
                      >
                        <ExternalLink className="h-3 w-3" /> {kind}
                      </Button>
                    ) : null
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {team.description || "No team description has been added yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              {team.players.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">No players linked yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {team.players.map((player) => (
                    <Link key={player.id} href={`/players/${player.slug}`}>
                      <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted">
                          {player.avatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.position}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {team.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.achievements.map((achievement) => (
                  <div key={achievement.id} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <Trophy className="mt-0.5 h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tournaments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Tournaments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{tournament.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tournament.startDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        / {tournament.location || "Location to be added"}
                      </p>
                    </div>
                    <Badge>{tournament.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
