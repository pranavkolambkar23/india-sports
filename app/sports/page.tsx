import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Sports - India Sports",
  description: "Explore all sports covered by India Sports including Cricket, Football, Badminton, Hockey, Volleyball, and Wrestling/MMA.",
};

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sports</h1>
        <p className="text-muted-foreground text-lg">
          Discover tournaments, players, and events across Indian sports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => (
          <Link key={sport.id} href={`/sports/${sport.slug}`}>
            <Card className="h-full hover:shadow-xl transition-all cursor-pointer group overflow-hidden border-0 shadow-md">
              <div
                className="h-2"
                style={{ backgroundColor: sport.color || '#ccc' }}
              />
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {sport.icon || "🏅"}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold group-hover:text-orange-600 transition-colors">
                      {sport.name}
                    </h2>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {sport.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-4"
                      style={{ borderColor: sport.color || '#ccc', color: sport.color || '#ccc' }}
                    >
                      View Details →
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
