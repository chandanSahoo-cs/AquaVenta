"use client";

import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { SelectValue } from "@/components/ui/select";

import { SelectTrigger } from "@/components/ui/select";

import { Select } from "@/components/ui/select";

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
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";

const styles: Record<string, string> = {
  Streets: `https://api.maptiler.com/maps/streets/style.json?key=POOqd5CTm1rNBESonueD`,
  Dark: `https://api.maptiler.com/maps/darkmatter/style.json?key=POOqd5CTm1rNBESonueD`,
  Satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=POOqd5CTm1rNBESonueD`,
  Light: `https://api.maptiler.com/maps/positron/style.json?key=POOqd5CTm1rNBESonueD`,
};

// Bounds for India (SW corner, NE corner)
const indiaBounds: [[number, number], [number, number]] = [
  [40.0, -5.0], // southwest (includes Arabian Sea, East Africa, Maldives, Sri Lanka)
  [125.0, 45.0], // northeast (includes China, Myanmar, Philippines edge)
];

const datasets = {
  events: {
    name: "Tsunami Events",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?country=INDIA",
    color: "#dc2626", // Enterprise red
  },
  deposits: {
    name: "Tsunami Deposits",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/deposits?country=INDIA",
    color: "#16a34a", // Enterprise green
  },
  runups: {
    name: "Tsunami Runups",
    url: "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups?country=INDIA",
    color: "#0ea5e9", // Enterprise blue
  },
};

// Generic fetcher with pagination
async function fetchAllFromDataset(baseUrl: string) {
  let page = 1;
  let totalPages = 1;
  const all: any[] = [];

  while (page <= totalPages) {
    const res = await fetch(`${baseUrl}&page=${page}`);
    if (!res.ok) throw new Error("Failed to fetch " + baseUrl);
    const data = await res.json();

    if (Array.isArray(data.items)) all.push(...data.items);
    totalPages = data.totalPages ?? 1;
    page++;
  }
  return all;
}

export default function IndiaMapToggle() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapType | null>(null);
  const [mapStyle, setMapStyle] = useState(styles.Streets);
  const [is3D, setIs3D] = useState(false);

  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState([1900, currentYear]);

  const markersRef = useRef<Record<string, maplibregl.Marker[]>>({});

  const cachedDataRef = useRef<Record<string, any[]>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [isMinimize, setIsMinimize] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const promises = Object.entries(datasets).map(
          async ([key, dataset]) => {
            const data = await fetchAllFromDataset(dataset.url);
            cachedDataRef.current[key] = data;
          }
        );

        await Promise.all(promises);
        setIsDataLoaded(true);
        console.log("[v0] All tsunami data loaded and cached");
      } catch (error) {
        console.error("Failed to load tsunami data:", error);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    // cleanup old map
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {}
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [78.9629, 20.5937], // India center
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
        } else {
          console.warn("No composite source found for 3D buildings");
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

  const addMarkersToMap = (datasetKey: string) => {
    const map = mapRef.current;
    if (!map || !cachedDataRef.current[datasetKey]) return;

    // Clear existing markers for this dataset
    if (markersRef.current[datasetKey]) {
      markersRef.current[datasetKey].forEach((m) => m.remove());
    }

    const { color } = datasets[datasetKey as keyof typeof datasets];
    const cachedData = cachedDataRef.current[datasetKey];

    // Filter data by year range
    const filteredData = cachedData.filter((event) => {
      const eventYear = event.year;
      return eventYear >= yearRange[0] && eventYear <= yearRange[1];
    });

    const markers = filteredData
      .filter((e) => e.latitude && e.longitude)
      .map((event) => {
        const markerElement = document.createElement("div");
        markerElement.style.backgroundColor = color;
        markerElement.style.width = is3D ? "16px" : "12px";
        markerElement.style.height = is3D ? "16px" : "12px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.border = "2px solid white";
        markerElement.style.boxShadow = is3D
          ? "0 6px 12px rgba(0,0,0,0.4)"
          : "0 3px 6px rgba(0,0,0,0.3)";
        markerElement.style.zIndex = "1000";

        return new maplibregl.Marker({ element: markerElement })
          .setLngLat([event.longitude, event.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div class="text-sm">
                <strong>${event.locationName || "Unknown"}</strong><br/>
                Year: ${event.year ?? "N/A"}<br/>
                ${event.magnitude ? `Magnitude: ${event.magnitude}<br/>` : ""}
                ${
                  event.runupHeight
                    ? `Runup Height: ${event.runupHeight}m<br/>`
                    : ""
                }
              </div>
            `)
          )
          .addTo(map);
      });

    markersRef.current[datasetKey] = markers;
  };

  useEffect(() => {
    if (!isDataLoaded) return;

    // Clear all existing markers
    Object.values(markersRef.current).forEach((markers) =>
      markers.forEach((m) => m.remove())
    );
    markersRef.current = {};

    // Add markers for all selected datasets
    selectedDatasets.forEach((datasetKey) => {
      addMarkersToMap(datasetKey);
    });
  }, [selectedDatasets, yearRange, is3D, isDataLoaded, mapStyle]);

  const toggleDataset = (datasetKey: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetKey)
        ? prev.filter((key) => key !== datasetKey)
        : [...prev, datasetKey]
    );
  };

  const clearAllDatasets = () => {
    setSelectedDatasets([]);
  };

  return (
    <div className="w-full h-[700px] relative">
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
            {/* Map Style and 3D Toggle */}
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
                      "Select tsunami datasets..."
                    ) : (
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedDatasets.slice(0, 2).map((key) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs">
                            {
                              datasets[key as keyof typeof datasets].name.split(
                                " "
                              )[1]
                            }
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
                      <h4 className="text-sm font-medium">Select Datasets</h4>
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
                    {Object.entries(datasets).map(([key, dataset]) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => toggleDataset(key)}>
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
                            datasets[key as keyof typeof datasets].color,
                        }}
                      />
                      {datasets[key as keyof typeof datasets].name}
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                    </Badge>
                  ))}
                </div>
              )}

              {selectedDatasets.length > 0 && (
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

      <div
        ref={mapContainer}
        className="w-full h-full rounded-xl border border-border shadow-enterprise overflow-hidden"
      />
    </div>
  );
}
