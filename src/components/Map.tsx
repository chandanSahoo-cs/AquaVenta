"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronRight,
  Database,
  Layers3,
  X,
  XIcon,
} from "lucide-react";
import maplibregl, { type Map as MapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";

import coastlineData from "@/data/india_coastline.json";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import type { FeatureCollection, LineString } from "geojson";

// Define a type for the event data to avoid using 'any'
type EventData = {
  [key: string]: unknown; // Allow other properties
  latitude?: string;
  LATITUDE?: string;
  longitude?: string;
  LONGITUDE?: string;
};

function isNearCoast(event: EventData, maxKm = 100) {
  const coastline = coastlineData as FeatureCollection<LineString>;

  const pt = point([
    parseFloat(event.longitude ?? event.LONGITUDE ?? "0"),
    parseFloat(event.latitude ?? event.LATITUDE ?? "0"),
  ]);

//   let near = false;

  coastline.features.forEach((feature) => {
    const nearest = nearestPointOnLine(feature, pt);
    // @ts-expect-error The 'distance' function from @turf/distance is compatible with the output of nearestPointOnLine, but the types don't perfectly align.
    const dist = distance(pt, nearest, { units: "kilometers" });
    if (dist <= maxKm) {
      near = true;
    }
  });

//   return near;
// }
// ------------------------- CONFIG -------------------------
const styles: Record<string, string> = {
  Streets: `https://api.maptiler.com/maps/streets/style.json?key=POOqd5CTm1rNBESonueD`,
  Dark: `https://api.maptiler.com/maps/darkmatter/style.json?key=POOqd5CTm1rNBESonueD`,
  Satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=POOqd5CTm1rNBESonueD`,
  Light: `https://api.maptiler.com/maps/positron/style.json?key=POOqd5CTm1rNBESonueD`,
};

// Bounds for India (SW corner, NE corner)
const indiaBounds: [[number, number], [number, number]] = [
  [40.0, -5.0],
  [125.0, 45.0],
];

const researchDatasets = {
  events: {
    name: "Tsunami Events",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?country=INDIA",
    color: "#dc2626", // red
  },
  deposits: {
    name: "Tsunami Deposits",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/deposits?country=INDIA",
    color: "#16a34a", // green
  },
  runups: {
    name: "Tsunami Runups",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups?country=INDIA",
    color: "#0ea5e9", // blue
  },
};

const reportDatasets = {
  past90days: {
    name: "Past 90 Days (INCOIS)",
    url: "/api/tsunami",
    color: "#F5E727", // yellow
  },
};

// ------------------------- HELPER FUNCTIONS -------------------------
const formatPropertyName = (key: string): string => {
  return (
    key.replace(/^./, (c) => c.toUpperCase()).slice(0, 1) +
    key
      .slice(1)
      .toLowerCase()
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      // .replace(/_/g, " ") // Replace underscores with spaces
      .trim()
  );
};

const formatPropertyValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// ------------------------- FETCH HELPERS -------------------------
async function fetchAllFromResearchDataset(baseUrl: string) {
  let page = 1;
  let totalPages = 1;
  const all: EventData[] = [];

  while (page <= totalPages) {
    const res = await fetch(`${baseUrl}&page=${page}`);
    if (!res.ok) {
      toast.error("Failed to fetch research dataset");
      break;
    }
    const data = await res.json();

    if (Array.isArray(data.items)) all.push(...data.items);
    totalPages = data.totalPages ?? 1;
    page++;
  }
  return all;
}

async function fetchAllFromReportDataset(baseUrl: string) {
  const res = await fetch(baseUrl);
  if (!res.ok) {
    toast.error("Failed to fetch report dataset");
    return [];
  }
  const data = await res.json();
  return data.datasets ?? [];
}

interface IndiaMapProps {
  mapType: "publicMap" | "researchMap";
}

// ------------------------- MAP COMPONENT -------------------------
export default function IndiaMap({ mapType }: IndiaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapType | null>(null);

  const [mapStyle, setMapStyle] = useState(styles.Streets);
  const [is3D, setIs3D] = useState(false);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [isMinimize, setIsMinimize] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState([1900, currentYear]);

  const markersRef = useRef<Record<string, maplibregl.Marker[]>>({});
  const cachedDataRef = useRef<Record<string, EventData[]>>({});

  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ------------------------- DATA LOADING -------------------------
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const researchPromises = Object.entries(researchDatasets).map(
          async ([key, dataset]) => {
            cachedDataRef.current[key] = await fetchAllFromResearchDataset(
              dataset.url
            );
          }
        );

        const reportPromises = Object.entries(reportDatasets).map(
          async ([key, dataset]) => {
            cachedDataRef.current[key] = await fetchAllFromReportDataset(
              dataset.url
            );
          }
        );

        await Promise.all([...researchPromises, ...reportPromises]);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to load tsunami data:", error);
      }
    };

    loadAllData();
  }, []);

  // ------------------------- MAP INITIALIZATION -------------------------
  useEffect(() => {
    if (!mapContainer.current) return;

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {}
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [78.9629, 20.5937],
      zoom: 3.5,
      minZoom: 3,
      maxBounds: indiaBounds,
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -20 : 0,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      if (is3D) {
        if (map.getSource("composite")) {
          map.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                16,
                ["get", "render_height"],
              ],
              "fill-extrusion-base": ["get", "render_min_height"],
              "fill-extrusion-opacity": 0.7,
            },
          });
        }
      }

      map.fitBounds(indiaBounds, { padding: 20, duration: 1500 });

      if (selectedDatasets.length > 0 && isDataLoaded) {
        selectedDatasets.forEach((datasetKey) => addMarkersToMap(datasetKey));
      }
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, [mapStyle, is3D]);

  useEffect(() => {
    console.log("hello from effect");
    if (mapType == "publicMap") {
      if (selectedDatasets.includes("past90days")) return;
      // setSelectedDatasets()
      toggleDataset("past90days");
      // addMarkersToMap("past90days");
    }
  }, [isDataLoaded, selectedDatasets]);

  // ------------------------- MARKERS -------------------------
  const addMarkersToMap = (datasetKey: string) => {
    const map = mapRef.current;
    if (!map || !cachedDataRef.current[datasetKey]) return;

    if (markersRef.current[datasetKey]) {
      markersRef.current[datasetKey].forEach((m) => m.remove());
    }

    const dataset =
      researchDatasets[datasetKey as keyof typeof researchDatasets] ||
      reportDatasets[datasetKey as keyof typeof reportDatasets];

    const color = dataset.color;
    const cachedData = cachedDataRef.current[datasetKey];
    console.log(
      "Cached data for",
      datasetKey,
      cachedDataRef.current[datasetKey]
    );

    let filteredData: EventData[] = cachedData;

    if (researchDatasets[datasetKey as keyof typeof researchDatasets]) {
      filteredData = cachedData.filter((event) => {
        const eventYear = event.year;
        // Add type check to safely use the 'year' property
        if (typeof eventYear === "number") {
          return eventYear >= yearRange[0] && eventYear <= yearRange[1];
        }
        return false;
      });
    }

    const markers = filteredData
      .filter((e) => (e.latitude || e.LATITUDE))
      .map((event) => {
        const lat = parseFloat(event.latitude ?? event.LATITUDE ?? "0");
        const lng = parseFloat(event.longitude ?? event.LONGITUDE ?? "0");

        const markerElement = document.createElement("div");
        markerElement.style.backgroundColor = color;
        markerElement.style.width = is3D ? "16px" : "12px";
        markerElement.style.height = is3D ? "16px" : "12px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.border = "2px solid white";
        markerElement.style.boxShadow = is3D
          ? "0 6px 12px rgba(0,0,0,0.4)"
          : "0 3px 6px rgba(0,0,0,0.3)";

        const marker = new maplibregl.Marker({ element: markerElement })
          .setLngLat([lng, lat])
          // .setPopup(
          //   new maplibregl.Popup({ offset: 25 }).setHTML(`
          //     <div class="text-sm">
          //       <strong>${
          //         event.locationName || event.REGIONNAME || "Unknown"
          //       }</strong><br/>
          //       ${event.year ? `Year: ${event.year}<br/>` : ""}
          //       ${
          //         event.magnitude || event.MAGNITUDE
          //           ? `Magnitude: ${event.magnitude ?? event.MAGNITUDE}<br/>`
          //           : ""
          //       }
          //       ${
          //         event.runupHeight
          //           ? `Runup Height: ${event.runupHeight}m<br/>`
          //           : ""
          //       }
          //       ${
          //         event.ORIGINTIME
          //           ? `Origin Time: ${event.ORIGINTIME}<br/>`
          //           : ""
          //       }
          //       ${event.DEPTH ? `Depth: ${event.DEPTH} km<br/>` : ""}
          //     </div>
          //   `)
          // )
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setSelectedEvent(event);
          setIsDialogOpen(true);
        });

        return marker;
      });

    markersRef.current[datasetKey] = markers;

    console.log(markersRef.current[datasetKey]);
  };

  useEffect(() => {
    if (!isDataLoaded) return;

    Object.values(markersRef.current).forEach((markers) =>
      markers.forEach((m) => m.remove())
    );
    markersRef.current = {};

    selectedDatasets.forEach((datasetKey) => {
      addMarkersToMap(datasetKey);
    });
  }, [selectedDatasets, yearRange, is3D, isDataLoaded, mapStyle]);

  // ------------------------- UI HELPERS -------------------------
  const toggleDataset = (datasetKey: string) => {
    console.log(datasetKey);
    setSelectedDatasets((prev) =>
      prev.includes(datasetKey)
        ? prev.filter((key) => key !== datasetKey)
        : [...prev, datasetKey]
    );
    console.log(selectedDatasets);
    console.log("Hello");
  };

  const clearAllDatasets = () => {
    setSelectedDatasets([]);
  };

  // ------------------------- RENDER -------------------------
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {String(
                selectedEvent?.locationName ||
                  selectedEvent?.REGIONNAME ||
                  selectedEvent?.location ||
                  selectedEvent?.name ||
                  "Event Details"
              )}
            </DialogTitle>
            <DialogDescription>
              Complete information about this tsunami event.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(selectedEvent)
                  .filter(
                    ([_, value]) =>
                      value !== null && value !== undefined && value !== ""
                  )
                  .map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-foreground mb-1">
                        {formatPropertyName(key)}
                      </div>
                      <div className="text-muted-foreground break-words">
                        {formatPropertyValue(value)}
                      </div>
                    </div>
                  ))}
              </div>

              {Object.keys(selectedEvent).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No additional details available for this event.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="w-full h-[700px] relative">
        {mapType == "researchMap" && (
          <Card className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-md border-border shadow-enterprise p-2">
            <Button
              className={cn(
                "bg-transparent text-primary shadow-none w-8 hover:bg-muted ml-auto z-10",
                !isMinimize && "rounded-full"
              )}
              onClick={() => setIsMinimize((prev) => !prev)}>
              {!isMinimize ? <XIcon /> : <ChevronRight />}
            </Button>
            {!isMinimize && (
              <div className="p-4 space-y-2 min-w-[200px] -mt-9">
                {/* Map Style & 3D Toggle */}
                <div className="flex items-center gap-3">
                  <Select value={mapStyle} onValueChange={setMapStyle}>
                    <SelectTrigger className="w-32 border-border focus:ring-ring">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(styles).map(([name, url]) => (
                        <SelectItem key={name} value={url}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => setIs3D((prev) => !prev)}
                    variant={is3D ? "default" : "outline"}
                    size="sm"
                    className="transition-all duration-200 shadow-enterprise hover:shadow-enterprise-lg">
                    <Layers3 className="h-4 w-4 mr-2" />
                    {is3D ? "2D View" : "3D View"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium text-foreground">
                      Tsunami Data {!isDataLoaded && "(Loading...)"}
                    </Label>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-border focus:ring-ring bg-transparent"
                        disabled={!isDataLoaded}>
                        {selectedDatasets.length === 0 ? (
                          "Select datasets..."
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {selectedDatasets.slice(0, 2).map((key) => (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="text-xs">
                                {researchDatasets[
                                  key as keyof typeof researchDatasets
                                ]?.name ??
                                  reportDatasets[
                                    key as keyof typeof reportDatasets
                                  ]?.name}
                              </Badge>
                            ))}
                            {selectedDatasets.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{selectedDatasets.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Select Datasets
                          </h4>
                          {selectedDatasets.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllDatasets}
                              className="h-auto p-1 text-xs">
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        {Object.entries({
                          ...researchDatasets,
                          ...reportDatasets,
                        }).map(([key, dataset]) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                            onClick={() => {
                              console.log("key: ", key);
                              toggleDataset(key);
                            }}>
                            <div className="flex items-center space-x-2 flex-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dataset.color }}
                              />
                              <span className="text-sm">{dataset.name}</span>
                            </div>
                            {selectedDatasets.includes(key) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {selectedDatasets.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedDatasets.map((key) => (
                        <Badge
                          onClick={() => toggleDataset(key)}
                          key={key}
                          variant="secondary"
                          className="text-xs flex items-center gap-1 cursor-pointer hover:bg-muted">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                researchDatasets[
                                  key as keyof typeof researchDatasets
                                ]?.color ??
                                reportDatasets[
                                  key as keyof typeof reportDatasets
                                ]?.color,
                            }}
                          />
                          {researchDatasets[
                            key as keyof typeof researchDatasets
                          ]?.name ??
                            reportDatasets[key as keyof typeof reportDatasets]
                              ?.name}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Year Range only for Research datasets */}
                  {selectedDatasets.some((d) => d in researchDatasets) && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium text-foreground">
                          Year Range: {yearRange[0]} - {yearRange[1]}
                        </Label>
                      </div>

                      <div className="px-2">
                        <Slider
                          value={yearRange}
                          onValueChange={setYearRange}
                          min={1900}
                          max={currentYear}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1900</span>
                          <span>{currentYear}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        <div
          ref={mapContainer}
          className="w-full h-full rounded-xl border border-border shadow-enterprise overflow-hidden"
        />
      </div>
    </>
  );
}
