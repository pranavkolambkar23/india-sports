"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { tournaments, sports } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const [selectedSport, setSelectedSport] = useState<string>("all");

  const filteredTournaments = useMemo(() => {
    if (selectedSport === "all") return tournaments;
    return tournaments.filter((t) => t.sport.slug === selectedSport);
  }, [selectedSport]);

  const events = filteredTournaments.map((t) => ({
    id: t.id,
    title: t.name,
    start: t.startDate,
    end: t.endDate || t.startDate,
    backgroundColor: t.sport.color || "#ea580c",
    borderColor: t.sport.color || "#ea580c",
    textColor: "#fff",
    extendedProps: {
      sport: t.sport.name,
      location: t.location,
      status: t.status,
    },
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Event Calendar</h1>
        <p className="text-muted-foreground text-lg">
          Browse all tournaments and events in calendar view.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedSport("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedSport === "all"
              ? "bg-orange-600 text-white"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All Sports
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

      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listMonth",
            }}
            events={events}
            height="auto"
            eventClick={(info) => {
              alert(
                `${info.event.title}\nSport: ${info.event.extendedProps.sport}\nLocation: ${info.event.extendedProps.location}\nStatus: ${info.event.extendedProps.status}`
              );
            }}
            eventMouseEnter={(info) => {
              info.el.style.cursor = "pointer";
              info.el.style.opacity = "0.9";
            }}
            eventMouseLeave={(info) => {
              info.el.style.opacity = "1";
            }}
          />
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {filteredTournaments.filter((t) => t.status === "LIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">
              {filteredTournaments.filter((t) => t.status === "UPCOMING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {filteredTournaments.filter((t) => t.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
