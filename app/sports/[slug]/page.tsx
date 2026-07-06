import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Trophy, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      tournaments: true,
      players: true,
    }
  });
  
  if (!sport) return notFound();

  const sportTournaments = sport.tournaments;
  const sportPlayers = sport.players;

  const statusOrder: Record<string, number> = { LIVE: 0, UPCOMING: 1, COMPLETED: 2 };
  const sortedTournaments = [...sportTournaments].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/sports"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Sports
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-6xl">{sport.icon || "🏅"}</span>
        <div>
          <h1 className="text-4xl font-bold">{sport.name}</h1>
          <p className="text-muted-foreground text-lg mt-1">
            {sport.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">{sportTournaments.length}</p>
            <p className="text-sm text-muted-foreground">Tournaments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">{sportPlayers.length}</p>
            <p className="text-sm text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-3xl font-bold">
              {sportTournaments.filter((t) => t.status === "LIVE").length}
            </p>
            <p className="text-sm text-muted-foreground">Live Now</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
      {sortedTournaments.length === 0 ? (
        <p className="text-muted-foreground py-8">No tournaments listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {sortedTournaments.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
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
                <CardTitle className="text-lg">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(t.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {t.endDate && (
                    <>
                      {" "}-{" "}
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
                  {t.location}
                </div>
                {t.streamingPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {t.streamingPlatforms.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        📺 {p}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Players</h2>
      {sportPlayers.length === 0 ? (
        <p className="text-muted-foreground py-8">No players listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sportPlayers.map((p) => (
            <Link key={p.id} href={`/players/${p.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {p.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Trophy className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.position}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
