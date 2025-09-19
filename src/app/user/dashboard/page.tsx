"use client";

import { Card, CardContent } from "@/components/ui/card";
import { JwtPayload } from "jsonwebtoken";
import {
  ArrowRight,
  BadgeAlertIcon,
  ClipboardPlusIcon,
  HistoryIcon,
  type LucideIcon,
  MapPinnedIcon,
  MapPlusIcon,
  SendIcon,
  UserStarIcon,
  WavesIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleName } from "../../../../generated/prisma";

interface ModuleType {
  name: string;
  url: string;
  role: RoleName;
  icon: LucideIcon;
  description: string;
  color: string;
  iconBgColor: string;
}

export default function DashboardPage() {
  const modules: ModuleType[] = [
    // Citizen
    {
      name: "Report Map",
      url: "/user/report-map",
      role: "citizen",
      icon: MapPinnedIcon,
      description:
        "View and report coastal hazards in your region and track environmental changes",
      color: "text-primary",
      iconBgColor: "bg-primary/10",
    },
    {
      name: "Upload Report",
      url: "/user/upload",
      role: "citizen",
      icon: ClipboardPlusIcon,
      description:
        "Submit new coastal hazard observations and contribute to marine conservation efforts",
      color: "text-gold",
      iconBgColor: "bg-gold/10",
    },
    {
      name: "Disaster Alert",
      url: "/user/report",
      role: "citizen",
      icon: BadgeAlertIcon,
      description:
        "Alert the system about emergencies and help safeguard your community.",
      color: "text-success",
      iconBgColor: "bg-success/10",
    },
    {
      name: "Your Submissions",
      url: "/user/submissions",
      role: "citizen",
      icon: SendIcon,
      description: "View and manage the disaster reports you have submitted.",
      color: "text-gold",
      iconBgColor: "bg-gold/10",
    },

    // Analyst
    {
      name: "Research Map",
      url: "/analyst/research-map",
      role: "analyst",
      icon: MapPlusIcon,
      description:
        "Analyze marine ecosystem data, trends, and conduct comprehensive research studies",
      color: "text-success",
      iconBgColor: "bg-success/10",
    },
    {
      name: "Reports Evaluated",
      url: "/analyst/history",
      role: "analyst",
      icon: HistoryIcon,
      description:
        "Access a history of disaster reports you have reviewed and evaluated",
      color: "text-primary",
      iconBgColor: "bg-primary/10",
    },
    {
      name: "Validate Reports",
      url: "/analyst/validate",
      role: "analyst",
      icon: SendIcon,
      description:
        "Assess incoming reports, verify their accuracy, and mark them as validated.",
      color: "text-gold",
      iconBgColor: "bg-gold/10",
    },

    // Admin
    {
      name: "Admin Dashboard",
      url: "/admin/dashboard",
      role: "admin",
      icon: UserStarIcon,
      description:
        "Access administrative tools to manage users, monitor reports, and configure system settings.",
      color: "text-primary",
      iconBgColor: "bg-primary/10",
    },
  ];

  const [role, setRole] = useState("");
  const effectiveModules: ModuleType[] = modules.filter((module) => {
    if (
      role !== "" &&
      (role === module.role ||
        role === "admin" ||
        (module.role !== "admin" && role === "analyst"))
    )
      return module;
  });

  console.log(effectiveModules);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      const { userPayload } = (await res.json()) as JwtPayload;
      setRole(userPayload.role);
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl text-[#002443] font-serif font-bold mb-4 text-balance">
                AquaVenta Dashboard
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl text-pretty">
                Monitor coastal hazards and protect marine ecosystems through
                comprehensive data analysis and community reporting
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center shadow-sm">
                  {/* <Activity className="w-10 h-10 text-primary" /> */}
                  <WavesIcon className="w-10 h-10 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Modules Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
            System Modules
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {effectiveModules.map(
              ({
                name,
                url,
                role,
                icon: Icon,
                description,
                color,
                iconBgColor,
              }) => (
                <Link key={name} href={url || "#"} className="group block">
                  <Card className="h-full transition-all duration-300 hover:shadow-enterprise-lg hover:scale-[1.02] border border-border bg-card group-hover:border-primary/30 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Card Header with Icon - using neutral background */}
                      <div className="p-6 bg-muted/20 border-b border-border/50">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-4 rounded-xl ${iconBgColor} shadow-sm border border-border/20 ${color}`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                        <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                          {name}
                        </h3>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 bg-card">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 text-pretty">
                          {description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground font-medium">
                            Click to access →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
              Marine Ecosystem Protection
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stay informed about coastal hazards and their impact on marine
              ecosystems. Together, we can protect our oceans for future
              generations through data-driven conservation efforts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
