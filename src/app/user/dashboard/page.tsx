import IndiaMapToggle from "@/components/Map2";

const demoReports = [
  { id: "1", lat: 19.076, lng: 72.8777, type: "High Waves" }, // Mumbai
  { id: "2", lat: 13.0827, lng: 80.2707, type: "Flooding" }, // Chennai
  { id: "3", lat: 8.5241, lng: 76.9366, type: "Swell Surge" }, // Kerala
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Live Hazard Reports</h1>
      {/* <HazardMap /> */}
      <IndiaMapToggle />
    </div>
  );
}
