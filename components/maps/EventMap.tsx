"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tournaments, sports } from "@/lib/data";

const customIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea580c" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>`
    ),
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

const statusColors: Record<string, string> = {
  LIVE: "bg-red-500",
  UPCOMING: "bg-blue-500",
  COMPLETED: "bg-green-600",
};

export default function EventMap() {
  const [selectedSport, setSelectedSport] = useState<string>("all");

  const filteredTournaments = useMemo(() => {
    if (selectedSport === "all") return tournaments;
    return tournaments.filter((t) => t.sport.slug === selectedSport);
  }, [selectedSport]);

  const tournamentsWithCoords = filteredTournaments.filter(
    (t) => t.latitude && t.longitude
  );

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Events Map</h1>
          <p className="text-muted-foreground">
            Explore tournaments and events across the globe.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSport("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedSport === "all"
                ? "bg-orange-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedSport === sport.slug
                  ? "text-white"
                  : "bg-muted hover:bg-muted/80"
              }`}
              style={
                selectedSport === sport.slug
                  ? { backgroundColor: sport.color }
                  : undefined
              }
            >
              {sport.icon} {sport.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border shadow-sm min-h-[500px]">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={4}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {tournamentsWithCoords.map((t) => (
            <Marker
              key={t.id}
              position={[t.latitude!, t.longitude!]}
              icon={customIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <Badge
                    className={`text-xs text-white mb-1 ${statusColors[t.status] || "bg-gray-500"}`}
                  >
                    {t.status}
                  </Badge>
                  <h4 className="font-semibold text-sm">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.sport.icon} {t.sport.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(t.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {t.streamingPlatforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.streamingPlatforms.map((p) => (
                        <Badge key={p} variant="outline" className="text-[10px]">
                          📺 {p}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
