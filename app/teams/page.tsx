import Link from "next/link";
import { Shield, Users } from "lucide-react";
import { AdminEntityActions } from "@/components/admin/AdminEntityActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teams - India Sports",
  description: "Browse Indian sports teams, academies, clubs, and squads across sports.",
};

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      sport: true,
      _count: {
        select: {
          players: true,
          achievements: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Teams</h1>
        <p className="text-lg text-muted-foreground">
          Explore clubs, academies, and squads supporting Indian athletes across sports.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Shield className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-lg">No teams listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
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
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: team.sport.color || "#666" }}
                        >
                          {team.sport.icon || "IN"} {team.sport.name}
                        </Badge>
                      </div>
                      <h2 className="font-semibold transition-colors hover:text-orange-600">
                        {team.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {[team.city, team.state, team.country].filter(Boolean).join(", ") ||
                          "Base to be added"}
                      </p>
                      {team.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {team.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                          <Users className="h-3 w-3" />
                          {team._count.players} players
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1">
                          {team._count.achievements} achievements
                        </span>
                      </div>
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
    </div>
  );
}
