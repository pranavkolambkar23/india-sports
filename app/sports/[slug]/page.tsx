import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Shield, Trophy } from "lucide-react";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const sport = await prisma.sport.findUnique({
    where: { slug: params.slug },
  });

  return {
    title: sport ? `${sport.name} - India Sports` : "Sport - India Sports",
    description: sport?.description,
  };
}

export default async function SportPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const sport = await prisma.sport.findUnique({
    where: { slug: params.slug },
    include: {
      teams: { orderBy: { name: "asc" } },
      tournaments: { orderBy: { startDate: "asc" } },
      players: { orderBy: { name: "asc" } },
    },
  });

  if (!sport) return notFound();

  const statusOrder: Record<string, number> = {
    LIVE: 0,
    UPCOMING: 1,
    COMPLETED: 2,
    CANCELLED: 3,
  };
  const sortedTournaments = [...sport.tournaments].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/sports"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Sports
      </Link>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-6xl">{sport.icon || "IN"}</span>
          <div>
            <h1 className="text-4xl font-bold">{sport.name}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{sport.description}</p>
          </div>
        </div>
        <AdminEntityActions
          creates={[
            { type: "team", href: `/admin/teams/new?sport=${sport.slug}`, label: "Create Team" },
            { type: "player", href: `/admin/players/new?sport=${sport.slug}`, label: "Create Player" },
            {
              type: "tournament",
              href: `/admin/tournaments/new?sport=${sport.slug}`,
              label: "Create Tournament",
            },
          ]}
        />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">{sport.teams.length}</p>
            <p className="text-sm text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">{sport.tournaments.length}</p>
            <p className="text-sm text-muted-foreground">Tournaments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">{sport.players.length}</p>
            <p className="text-sm text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">
              {sport.tournaments.filter((t) => t.status === "LIVE").length}
            </p>
            <p className="text-sm text-muted-foreground">Live Now</p>
          </CardContent>
        </Card>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Teams</h2>
        {sport.teams.length === 0 ? (
          <p className="py-8 text-muted-foreground">No teams listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sport.teams.map((team) => (
              <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/teams/${team.slug}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                        {team.logo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Shield className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold hover:text-orange-600 transition-colors">
                          {team.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {[team.city, team.state, team.country].filter(Boolean).join(", ")}
                        </p>
                        {team.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
                <div className="border-t px-4 py-3">
                  <AdminEntityActions
                    compact
                    edit={{ type: "team", href: `/admin/teams/${team.id}/edit` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Tournaments</h2>
        {sortedTournaments.length === 0 ? (
          <p className="py-8 text-muted-foreground">No tournaments listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedTournaments.map((t) => (
              <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/tournaments/${t.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge
                        className={
                          t.status === "LIVE"
                            ? "bg-red-500 text-white"
                            : t.status === "UPCOMING"
                              ? "bg-blue-500 text-white"
                              : "bg-green-600 text-white"
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg transition-colors hover:text-orange-600">
                      {t.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(t.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {t.endDate && (
                        <>
                          {" - "}
                          {new Date(t.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {t.location || "Location to be added"}
                    </div>
                    {t.streamingPlatforms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {t.streamingPlatforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Link>
                <div className="border-t px-4 py-3">
                  <AdminEntityActions
                    compact
                    edit={{
                      type: "tournament",
                      href: `/admin/tournaments/${t.id}/edit`,
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Players</h2>
        {sport.players.length === 0 ? (
          <p className="py-8 text-muted-foreground">No players listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sport.players.map((player) => (
              <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/players/${player.slug}`}>
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {player.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Trophy className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-xs text-muted-foreground">{player.position}</p>
                  </CardContent>
                </Link>
                <div className="border-t px-4 py-3">
                  <AdminEntityActions
                    compact
                    edit={{ type: "player", href: `/admin/players/${player.id}/edit` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
