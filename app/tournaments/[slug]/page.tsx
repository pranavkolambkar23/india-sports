import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  PlayCircle,
  Trophy,
  Users,
} from "lucide-react";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

const statusColors: Record<string, string> = {
  LIVE: "bg-red-500 text-white",
  UPCOMING: "bg-blue-500 text-white",
  COMPLETED: "bg-green-600 text-white",
  CANCELLED: "bg-gray-500 text-white",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function cleanExternalUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const name = params.slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${name || "Tournament"} - India Sports`,
    description:
      "Tournament details, schedule, streaming links, matches, and participating Indian athletes.",
  };
}

export default async function TournamentPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tournament = await prisma.tournament.findUnique({
    where: { slug: params.slug },
    include: {
      sport: {
        include: {
          teams: {
            orderBy: { name: "asc" },
            take: 6,
          },
        },
      },
      matches: { orderBy: { matchDate: "asc" } },
      players: {
        include: {
          player: {
            include: {
              team: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tournament) return notFound();

  const venue = [
    tournament.location,
    tournament.city,
    tournament.state,
    tournament.country,
  ].filter(Boolean);
  const websiteUrl = tournament.websiteUrl ? cleanExternalUrl(tournament.websiteUrl) : null;
  const streamingUrl = tournament.streamingUrl ? cleanExternalUrl(tournament.streamingUrl) : null;
  const teams = tournament.sport.teams;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/tournaments"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tournaments
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative min-h-64 bg-muted">
              {tournament.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tournament.imageUrl}
                  alt={tournament.name}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-muted">
                  <Trophy className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      className="text-white"
                      style={{ backgroundColor: tournament.sport.color || "#666" }}
                    >
                      {tournament.sport.icon || "IN"} {tournament.sport.name}
                    </Badge>
                    <Badge className={statusColors[tournament.status] || ""}>
                      {tournament.status === "LIVE" && (
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      )}
                      {tournament.status}
                    </Badge>
                    {tournament.winner && (
                      <Badge variant="secondary">
                        Winner: {tournament.winner}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold md:text-4xl">{tournament.name}</h1>
                </div>
                <AdminEntityActions
                  compact
                  edit={{
                    type: "tournament",
                    href: `/admin/tournaments/${tournament.id}/edit`,
                  }}
                />
              </div>

              <p className="leading-relaxed text-muted-foreground">
                {tournament.description || "No tournament description has been added yet."}
              </p>

              {(websiteUrl || streamingUrl) && (
                <div className="flex flex-wrap gap-2">
                  {websiteUrl && (
                    <Button
                      variant="outline"
                      render={<a href={websiteUrl} target="_blank" rel="noreferrer" />}
                    >
                      <Globe className="h-4 w-4" /> Website
                    </Button>
                  )}
                  {streamingUrl && (
                    <Button render={<a href={streamingUrl} target="_blank" rel="noreferrer" />}>
                      <PlayCircle className="h-4 w-4" /> Watch
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.matches.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No match schedule has been added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {tournament.matches.map((match) => (
                    <div key={match.id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">
                            {match.teamA} vs {match.teamB}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateTime(match.matchDate)}
                            {match.venue ? ` / ${match.venue}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{match.status}</Badge>
                      </div>
                      {(match.scoreA !== null || match.scoreB !== null || match.streamingUrl) && (
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          {match.scoreA !== null || match.scoreB !== null ? (
                            <span className="font-medium">
                              Score: {match.scoreA ?? "-"} - {match.scoreB ?? "-"}
                            </span>
                          ) : null}
                          {match.streamingUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              render={
                                <a
                                  href={cleanExternalUrl(match.streamingUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                />
                              }
                            >
                              <ExternalLink className="h-3 w-3" /> Match stream
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.players.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No participating players have been linked yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tournament.players.map((entry) => (
                    <Link key={entry.id} href={`/players/${entry.player.slug}`}>
                      <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted">
                          {entry.player.avatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={entry.player.avatar}
                              alt={entry.player.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{entry.player.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[entry.role, entry.player.team?.name].filter(Boolean).join(" / ") ||
                              entry.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dates</p>
                  <p className="text-muted-foreground">
                    {formatDate(tournament.startDate)}
                    {tournament.endDate ? ` - ${formatDate(tournament.endDate)}` : ""}
                  </p>
                </div>
              </div>
              {tournament.winner && (
                <div className="flex gap-3">
                  <Award className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Winner</p>
                    <p className="text-muted-foreground">{tournament.winner}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">
                    {venue.length > 0 ? venue.join(", ") : "Location to be added"}
                  </p>
                </div>
              </div>
              {tournament.streamingPlatforms.length > 0 && (
                <div>
                  <p className="mb-2 font-medium">Streaming Platforms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tournament.streamingPlatforms.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.slug}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted"
                  >
                    <span className="font-medium">{team.name}</span>
                    <Badge variant="secondary">{team.shortName || team.city || "Team"}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
