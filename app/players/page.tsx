import Link from "next/link";
import { Users, Medal, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Players - India Sports",
  description: "Discover Indian athletes across Cricket, Football, Badminton, Hockey, Volleyball, and Wrestling/MMA.",
};

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    include: {
      sport: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Players</h1>
        <p className="text-muted-foreground text-lg">
          Meet the stars of Indian sports and rising talents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((player) => {
          const medals = player.medals as { gold?: number; silver?: number; bronze?: number } | null;
          return (
            <Card key={player.id} className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
              <Link href={`/players/${player.slug}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-muted group-hover:border-orange-300 transition-colors">
                      {player.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Users className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        style={{
                          backgroundColor: player.sport.color || '#ccc',
                          color: "white",
                        }}
                        className="text-xs"
                      >
                        {player.sport.icon} {player.sport.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {player.position}
                      </span>
                    </div>
                    {medals && (
                      <div className="flex items-center gap-3 mt-3 text-xs">
                        {(medals.gold || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-yellow-600 font-medium">
                            <Trophy className="h-3 w-3" /> {medals.gold}
                          </span>
                        )}
                        {(medals.silver || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-gray-500 font-medium">
                            <Medal className="h-3 w-3" /> {medals.silver}
                          </span>
                        )}
                        {(medals.bronze || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-700 font-medium">
                            <Medal className="h-3 w-3" /> {medals.bronze}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Link>
              <div className="border-t px-4 py-3">
                <AdminEntityActions
                  compact
                  edit={{ type: "player", href: `/admin/players/${player.id}/edit` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
