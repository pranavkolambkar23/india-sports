import Link from "next/link";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournaments - India Sports",
  description:
    "Track current, upcoming, and past tournaments across Cricket, Football, Badminton, Hockey, Volleyball, and Wrestling/MMA.",
};

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      sport: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const live = tournaments.filter((t) => t.status === "LIVE");
  const upcoming = tournaments.filter((t) => t.status === "UPCOMING");
  const completed = tournaments.filter((t) => t.status === "COMPLETED");

  const statusColors: Record<string, string> = {
    LIVE: "bg-red-500 text-white",
    UPCOMING: "bg-blue-500 text-white",
    COMPLETED: "bg-green-600 text-white",
    CANCELLED: "bg-gray-500 text-white",
  };

  const renderCard = (tournament: (typeof tournaments)[0]) => (
    <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/tournaments/${tournament.slug}`}>
        <CardHeader className="pb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge
              style={{ backgroundColor: tournament.sport.color || "#ccc" }}
              className="text-white"
            >
              {tournament.sport.icon || "IN"} {tournament.sport.name}
            </Badge>
            <Badge className={statusColors[tournament.status] || ""}>
              {tournament.status === "LIVE" && (
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              )}
              {tournament.status}
            </Badge>
          </div>
          <CardTitle className="text-lg transition-colors hover:text-orange-600">
            {tournament.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(tournament.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {tournament.endDate && (
                  <>
                    {" "}
                    -{" "}
                    {new Date(tournament.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{tournament.location || "Location to be added"}</span>
            </div>
          </div>
          {tournament.streamingPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tournament.streamingPlatforms.map((platform) => (
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
            href: `/admin/tournaments/${tournament.id}/edit`,
          }}
        />
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Tournaments</h1>
        <p className="text-lg text-muted-foreground">
          Track live, upcoming, and past tournaments across Indian sports.
        </p>
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {live.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg">No live tournaments right now.</p>
              <p>Check the upcoming tab for what&apos;s next.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {live.map(renderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg">No upcoming tournaments listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(renderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Trophy className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg">No completed tournaments listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map(renderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
