import { Calendar, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Tournaments - India Sports",
  description: "Track current, upcoming, and past tournaments across Cricket, Football, Badminton, Hockey, Volleyball, and Wrestling/MMA.",
};

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      sport: true,
    },
    orderBy: {
      startDate: 'asc'
    }
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

  const renderCard = (tournament: typeof tournaments[0]) => (
    <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge
            style={{ backgroundColor: tournament.sport.color || '#ccc' }}
            className="text-white"
          >
            {tournament.sport.icon || "🏅"} {tournament.sport.name}
          </Badge>
          <Badge className={statusColors[tournament.status] || ""}>
            {tournament.status === "LIVE" && (
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            )}
            {tournament.status}
          </Badge>
        </div>
        <CardTitle className="text-lg">{tournament.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
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
            <span>{tournament.location}</span>
          </div>
        </div>
        {tournament.streamingPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tournament.streamingPlatforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs">
                📺 {platform}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tournaments</h1>
        <p className="text-muted-foreground text-lg">
          Track live, upcoming, and past tournaments across Indian sports.
        </p>
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="live">
            🔴 Live ({live.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            📅 Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            ✅ Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {live.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No live tournaments right now.</p>
              <p>Check the upcoming tab for what&apos;s next!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {live.map(renderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No upcoming tournaments listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(renderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No completed tournaments listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map(renderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
