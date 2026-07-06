import { Heart, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fundraisers } from "@/lib/data";

export const metadata = {
  title: "Support Athletes - India Sports",
  description: "Fund Indian athletes for training, equipment, and tournament travel. Every contribution helps build India's sporting future.",
};

export default function DonatePage() {
  const totalRaised = fundraisers.reduce((sum, f) => sum + f.raised, 0);
  const totalTarget = fundraisers.reduce((sum, f) => sum + f.target, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Indian Athletes</h1>
        <p className="text-lg text-muted-foreground">
          Many talented Indian athletes lack the financial backing for training,
          equipment, and international travel. Your contribution directly helps
          them compete on the world stage.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{(totalRaised / 100000).toFixed(1)}L
              </p>
              <p className="text-sm text-muted-foreground">Total Raised</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{(totalTarget / 100000).toFixed(1)}L
              </p>
              <p className="text-sm text-muted-foreground">Total Target</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{fundraisers.length}</p>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fundraisers */}
      <h2 className="text-2xl font-bold mb-6">Active Fundraisers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundraisers.map((f) => {
          const percent = Math.min(100, Math.round((f.raised / f.target) * 100));
          return (
            <Card key={f.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {f.player.avatar ? (
                      <img
                        src={f.player.avatar}
                        alt={f.player.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.player.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.player.sport.name}
                    </p>
                  </div>
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4">
                  {f.description}
                </p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-green-600">
                      ₹{f.raised.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground">
                      of ₹{f.target.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Progress value={percent} className="h-2 mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {percent}% funded
                    </span>
                    {f.endDate && (
                      <span className="text-xs text-muted-foreground">
                        Ends{" "}
                        {new Date(f.endDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <Button className="w-full mt-4" size="sm" asChild>
                    <a
                      href={f.razorpayLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Heart className="mr-2 h-4 w-4" /> Contribute Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* For Athletes CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-800 text-white p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Are You an Athlete?</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Create your fundraiser and connect with supporters who believe in your
          journey. We help Indian athletes get the visibility and funding they
          deserve.
        </p>
        <Button
          size="lg"
          className="bg-white text-orange-700 hover:bg-white/90"
        >
          Start a Fundraiser
        </Button>
      </div>
    </div>
  );
}
