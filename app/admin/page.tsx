"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Settings,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sports, tournaments, players, achievements, fundraisers } from "@/lib/data";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "players", label: "Players", icon: Users },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "achievements", label: "Achievements", icon: BarChart3 },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const totalRaised = fundraisers.reduce((sum, f) => sum + f.raised, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage players, tournaments, and content.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          ⚠️ Demo Mode - Connect to DB for full functionality
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          {navItems.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold">{sports.length}</p>
                <p className="text-sm text-muted-foreground">Sports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold">{tournaments.length}</p>
                <p className="text-sm text-muted-foreground">Tournaments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold">{players.length}</p>
                <p className="text-sm text-muted-foreground">Players</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-3xl font-bold">
                  ₹{(totalRaised / 100000).toFixed(1)}L
                </p>
                <p className="text-sm text-muted-foreground">Raised</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tournaments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tournaments.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.sport.name}
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">{a.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Players</CardTitle>
              <Button size="sm">Add Player</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.sport.name} · {p.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tournaments</CardTitle>
              <Button size="sm">Add Tournament</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.sport.name} · {t.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Achievements</CardTitle>
              <Button size="sm">Add Achievement</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · {a.category}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
