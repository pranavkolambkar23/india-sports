import Link from "next/link";
import { ArrowRight, Trophy, MapPin, Calendar, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    LIVE: "bg-red-500 text-white",
    UPCOMING: "bg-blue-500 text-white",
    COMPLETED: "bg-green-500 text-white",
  };
  return (
    <Badge className={colors[status] || "bg-gray-500"}>
      {status === "LIVE" && (
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      )}
      {status}
    </Badge>
  );
}

export default async function HomePage() {
  const sports = await prisma.sport.findMany({ take: 6 });
  const featuredTournaments = await prisma.tournament.findMany({
    take: 4,
    orderBy: { startDate: 'asc' },
    include: { sport: true }
  });
  const featuredPlayers = await prisma.player.findMany({
    take: 4,
    include: { sport: true }
  });
  const recentAchievements = await prisma.achievement.findMany({
    take: 4,
    orderBy: { date: 'desc' }
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-green-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur">
              🇮🇳 For Indian Athletes, By India
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Celebrate Indian Sports.
              <br />
              <span className="text-yellow-300">Support Our Athletes.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Your complete hub for Indian sports. Track tournaments, discover
              players, explore events across India, and help fund our athletes&apos;
              dreams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-white text-orange-700 hover:bg-white/90"
                render={<Link href="/sports" />}
              >
                Explore Sports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                render={<Link href="/donate" />}
              >
                <Heart className="mr-2 h-4 w-4" /> Support Athletes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Sports</h2>
          <Link
            href="/sports"
            className="text-sm font-medium text-orange-600 hover:underline flex items-center"
          >
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <Link key={sport.id} href={`/sports/${sport.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{sport.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                        {sport.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sport.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Tournaments</h2>
            <Link
              href="/tournaments"
              className="text-sm font-medium text-orange-600 hover:underline flex items-center"
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTournaments.map((t) => (
              <Card key={t.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      style={{ backgroundColor: t.sport.color || '#ccc' }}
                      className="text-white"
                    >
                      {t.sport.name}
                    </Badge>
                    <StatusBadge status={t.status} />
                  </div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(t.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {t.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Players</h2>
          <Link
            href="/players"
            className="text-sm font-medium text-orange-600 hover:underline flex items-center"
          >
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPlayers.map((p) => (
            <Link key={p.id} href={`/players/${p.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {p.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {p.sport.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.position}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Achievements */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Achievements</h2>
            <Link
              href="/achievements"
              className="text-sm font-medium text-orange-600 hover:underline flex items-center"
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4 max-w-3xl">
            {recentAchievements.map((a) => (
              <Card key={a.id} className="flex items-start gap-4 p-4">
                <div className="mt-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{a.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {a.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(a.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {a.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-green-700 to-green-900 text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Help Fund Indian Athletes
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Many talented Indian athletes need financial support for training,
            equipment, and travel. Your contribution can help them reach the
            world stage.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-800 hover:bg-white/90"
            render={<Link href="/donate" />}
          >
            <Heart className="mr-2 h-4 w-4" /> Browse Fundraisers
          </Button>
        </div>
      </section>
    </div>
  );
}
