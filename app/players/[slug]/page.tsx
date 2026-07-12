import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";

function getAge(birthDate: Date) {
  return Math.floor(
    (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const name = params.slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${name || "Player"} - India Sports`,
    description: "Indian athlete profile, achievements, tournaments, and verified source links.",
  };
}

export default async function PlayerPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const player = await prisma.player.findUnique({
    where: { slug: params.slug },
    include: {
      sport: true,
      team: true,
      achievements: true,
      tournaments: {
        include: {
          tournament: true,
        },
      },
    }
  });
  
  if (!player) return notFound();

  const playerAchievements = player.achievements;
  const fallbackTournaments =
    player.tournaments.length === 0
      ? await prisma.tournament.findMany({
          where: { sportId: player.sportId },
          orderBy: { startDate: "desc" },
          take: 4,
        })
      : [];

  const age = player.birthDate ? getAge(player.birthDate) : null;

  const medals = player.medals as { gold?: number; silver?: number; bronze?: number } | null;
  const socialLinks = player.socialLinks as
    | {
        twitter?: string;
        instagram?: string;
        facebook?: string;
        youtube?: string;
        website?: string;
      }
    | null;

  function socialHref(kind: string, value: string) {
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    const handle = value.replace("@", "");
    if (kind === "twitter") return `https://twitter.com/${handle}`;
    if (kind === "instagram") return `https://instagram.com/${handle}`;
    return value;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/players"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Players
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-orange-100">
                {player.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Trophy className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-2xl font-bold">{player.name}</h1>
                <AdminEntityActions
                  compact
                  edit={{ type: "player", href: `/admin/players/${player.id}/edit` }}
                />
              </div>
              <Badge
                className="mt-2 text-white"
                style={{
                  backgroundColor: player.sport.color || '#ccc',
                }}
              >
                {player.sport.icon} {player.sport.name}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {player.position}
              </p>

              {medals &&
                ((medals.gold || 0) > 0 ||
                  (medals.silver || 0) > 0 ||
                  (medals.bronze || 0) > 0) && (
                  <div className="flex items-center justify-center gap-4 mt-4 py-3 bg-muted/50 rounded-lg">
                    {(medals.gold || 0) > 0 && (
                      <div className="text-center">
                        <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                        <p className="text-xs font-bold mt-0.5">
                          {medals.gold}
                        </p>
                      </div>
                    )}
                    {(medals.silver || 0) > 0 && (
                      <div className="text-center">
                        <Medal className="h-5 w-5 text-gray-400 mx-auto" />
                        <p className="text-xs font-bold mt-0.5">
                          {medals.silver}
                        </p>
                      </div>
                    )}
                    {(medals.bronze || 0) > 0 && (
                      <div className="text-center">
                        <Medal className="h-5 w-5 text-amber-700 mx-auto" />
                        <p className="text-xs font-bold mt-0.5">
                          {medals.bronze}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              <div className="mt-6 space-y-3 text-left text-sm">
                {age && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">{age} years</span>
                  </div>
                )}
                {player.birthDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Born</span>
                    <span className="font-medium">
                      {new Date(player.birthDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {player.birthPlace && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Birthplace</span>
                    <span className="font-medium">{player.birthPlace}</span>
                  </div>
                )}
                {(player.team?.name || player.currentAcademy) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current club</span>
                    <span className="font-medium text-right">
                      {player.team?.name || player.currentAcademy}
                    </span>
                  </div>
                )}
                {player.height && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Height</span>
                    <span className="font-medium">{player.height} cm</span>
                  </div>
                )}
                {player.weight && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{player.weight} kg</span>
                  </div>
                )}
              </div>

              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {socialLinks.twitter && socialLinks.twitter.trim() && (
                    <Button variant="outline" size="sm" className="rounded-full gap-1" render={
                      <a href={socialHref("twitter", socialLinks.twitter)} target="_blank" rel="noopener noreferrer"></a>
                    }>
                      <Globe className="h-3 w-3" /> X
                    </Button>
                  )}
                  {socialLinks.instagram && socialLinks.instagram.trim() && (
                    <Button variant="outline" size="sm" className="rounded-full gap-1" render={
                      <a href={socialHref("instagram", socialLinks.instagram)} target="_blank" rel="noopener noreferrer"></a>
                    }>
                      <ExternalLink className="h-3 w-3" /> IG
                    </Button>
                  )}
                  {socialLinks.facebook && socialLinks.facebook.trim() && (
                    <Button variant="outline" size="sm" className="rounded-full gap-1" render={
                      <a href={socialHref("facebook", socialLinks.facebook)} target="_blank" rel="noopener noreferrer"></a>
                    }>
                      <ExternalLink className="h-3 w-3" /> FB
                    </Button>
                  )}
                  {socialLinks.youtube && socialLinks.youtube.trim() && (
                    <Button variant="outline" size="sm" className="rounded-full gap-1" render={
                      <a href={socialHref("youtube", socialLinks.youtube)} target="_blank" rel="noopener noreferrer"></a>
                    }>
                      <ExternalLink className="h-3 w-3" /> YT
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {player.bio || "No biography available yet."}
              </p>
            </CardContent>
          </Card>

          {playerAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {playerAchievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(a.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(player.tournaments.length > 0 || fallbackTournaments.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Tournaments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {player.tournaments.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{entry.tournament.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.notes || entry.tournament.location || "Details to be verified"}
                      </p>
                    </div>
                    <Badge>{entry.status}</Badge>
                  </div>
                ))}
                {fallbackTournaments.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.startDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        / {t.location}
                      </p>
                    </div>
                    <Badge
                      className={
                        t.status === "LIVE"
                          ? "bg-red-500"
                          : t.status === "UPCOMING"
                            ? "bg-blue-500"
                            : "bg-green-600"
                      }
                    >
                      {t.status}
                    </Badge>
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
