"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EventMap = dynamic(() => import("@/components/maps/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border bg-muted flex items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

export default function MapWrapper() {
  return <EventMap />;
}
