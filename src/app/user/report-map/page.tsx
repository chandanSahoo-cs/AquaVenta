"use client";

import IndiaMap from "@/components/Map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportMapPage() {
  const router = useRouter();
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 ">
        <div className="flex items-center gap-10">
          <h1 className="text-3xl font-bold text-[#002443]">
            Ocean Hazard Report Data Visualization
          </h1>
          <div className="flex items-center gap-3 pt-2">
            <Badge className="bg-muted/90 text-[#002443]">
              <Circle
                fill="#F5E727"
                stroke="white"
                className="size-3"
                style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))" }}
              />
              Past 90 Days (JalPahri)
            </Badge>
            <Badge className="bg-muted/90 text-[#002443]">
              <Circle
                fill="#FF8CFF"
                stroke="white"
                className="size-3"
                style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))" }}
              />
              User Reports
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => router.back()}
          className="bg-white text-[#193b57] border-3 border-[#193b57]  hover:bg-muted  w-30 flex justify-around items-center ">
          <MoveLeft className="size-5 " />
          <span className="text-[15px] ">Back</span>
        </Button>
      </div>
      <IndiaMap mapType="publicMap" />
    </main>
  );
}
