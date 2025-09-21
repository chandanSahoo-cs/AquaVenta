"use client";

import IndiaMap from "@/components/Map";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportMapPage() {
  const router = useRouter();
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-3xl font-bold text-[#002443]">
          Ocean Hazard Report Data Visualization
        </h1>
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
