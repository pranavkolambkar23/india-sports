import { Trophy, Medal, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Achievements - India Sports",
  description: "Recent achievements of Indian teams and athletes across Cricket, Football, Badminton, Hockey, Volleyball, and Wrestling/MMA.",
};

export default async function AchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    orderBy: {
      date: 'desc'
    }
  });

  const international = achievements.filter((a) => a.category === "INTERNATIONAL");
  const national = achievements.filter((a) => a.category === "NATIONAL");
  const domestic = achievements.filter((a) => a.category === "DOMESTIC");

  const categoryColors: Record<string, string> = {
    INTERNATIONAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
    NATIONAL: "bg-blue-100 text-blue-800 border-blue-200",
    DOMESTIC: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const renderCard = (achievement: typeof achievements[0]) => (
    <Card key={achievement.id} className="flex items-start gap-4 p-5 hover:shadow-md transition-shadow">
      <div className="mt-1 flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-orange-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{achievement.title}</h3>
          <Badge
            variant="outline"
            className={`text-xs flex-shrink-0 ${categoryColors[achievement.category]}`}
          >
            {achievement.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {achievement.description}
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(achievement.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recent Achievements</h1>
        <p className="text-muted-foreground text-lg">
          Celebrating the victories and milestones of Indian sports.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{international.length}</p>
              <p className="text-sm text-muted-foreground">International</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Medal className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{national.length}</p>
              <p className="text-sm text-muted-foreground">National</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{achievements.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
          <TabsTrigger value="international">
            🌍 International ({international.length})
          </TabsTrigger>
          <TabsTrigger value="national">
            🇮🇳 National ({national.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {achievements.map(renderCard)}
        </TabsContent>

        <TabsContent value="international" className="space-y-4">
          {international.map(renderCard)}
        </TabsContent>

        <TabsContent value="national" className="space-y-4">
          {national.map(renderCard)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
