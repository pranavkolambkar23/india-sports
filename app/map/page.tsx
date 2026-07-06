import MapWrapper from "@/components/maps/MapWrapper";

export const metadata = {
  title: "Events Map - India Sports",
  description: "Interactive map of sports tournaments and events across India and the world.",
};

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <MapWrapper />
    </div>
  );
}
