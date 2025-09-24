"use client";

import type React from "react";

import type { UserWithReportStats } from "@/actions/user.actions";
import { banUser, getUsersWithReportStats } from "@/actions/user.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/* sample observability data to mirror Vercel dashboards */
const requestHistory = [
  { label: "12h", successful: 382, rejected: 8 },
  { label: "9h", successful: 361, rejected: 6 },
  { label: "6h", successful: 348, rejected: 7 },
  { label: "3h", successful: 332, rejected: 5 },
  { label: "Now", successful: 356, rejected: 4 },
];

const transferHistory = [
  { label: "12h", outgoing: 1.2, incoming: 0.42 },
  { label: "9h", outgoing: 1.05, incoming: 0.36 },
  { label: "6h", outgoing: 0.98, incoming: 0.31 },
  { label: "3h", outgoing: 1.04, incoming: 0.28 },
  { label: "Now", outgoing: 1.18, incoming: 0.33 },
];

const cacheBreakdown = [
  { label: "Edge", hitRate: 78 },
  { label: "Regional", hitRate: 64 },
  { label: "Global", hitRate: 52 },
];

export default function DashboardPage() {
  const [users, setUsers] = useState<UserWithReportStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [banTarget, setBanTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsersWithReportStats();
      setUsers(data);
    };
    fetchData();
  }, []);

  const { acceptedTotal, rejectedTotal, highestReporter, acceptanceRate } =
    useMemo(() => {
      if (!users.length) {
        return {
          acceptedTotal: 0,
          rejectedTotal: 0,
          highestReporter: null as UserWithReportStats | null,
          acceptanceRate: 0,
        };
      }

      const accepted = users.reduce((sum, user) => sum + user.acceptedCount, 0);
      const rejected = users.reduce((sum, user) => sum + user.rejectedCount, 0);
      const topUser = users.reduce<UserWithReportStats | null>(
        (currentTop, candidate) => {
          if (!currentTop) return candidate;
          const currentThroughput =
            currentTop.acceptedCount + currentTop.rejectedCount;
          const candidateThroughput =
            candidate.acceptedCount + candidate.rejectedCount;
          return candidateThroughput > currentThroughput
            ? candidate
            : currentTop;
        },
        null
      );
      const rate =
        accepted + rejected === 0 ? 0 : accepted / (accepted + rejected);

      return {
        acceptedTotal: accepted,
        rejectedTotal: rejected,
        highestReporter: topUser,
        acceptanceRate: rate,
      };
    }, [users]);

  const handleBan = async (userId: string) => {
    try {
      setLoading(true);
      setBanTarget(userId);
      const data = await banUser(userId);
      if (!data.success) {
        throw new Error("Failed to ban user");
      }

      toast.success("User banned successfully");
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    } finally {
      setLoading(false);
      setBanTarget(null);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-12 pt-10">
        <Header highestReporter={highestReporter} />
        <Separator className="bg-border/60" />
        <MetricsRow
          totalUsers={users.length}
          accepted={acceptedTotal}
          rejected={rejectedTotal}
          acceptanceRate={acceptanceRate}
        />
        <UsersTable
          users={users}
          loading={loading}
          banTarget={banTarget}
          onBan={handleBan}
        />
      </section>
    </main>
  );
}

function Header({
  highestReporter,
}: {
  highestReporter: UserWithReportStats | null;
}) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Observability
        </p>
        <h1 className="text-balance text-4xl font-semibold">
          Coastal Intelligence Command Center
        </h1>
      </div>
      {highestReporter && (
        <div className="glass-panel hidden max-w-xs rounded-xl p-4 lg:block">
          <p className="metric-label">Top Reporter</p>
          <p className="metric-value text-primary">
            {highestReporter.name ?? "Anonymous"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {highestReporter.acceptedCount} accepted /{" "}
            {highestReporter.rejectedCount} rejected submissions in the current
            window.
          </p>
        </div>
      )}
    </header>
  );
}

function MetricsRow({
  totalUsers,
  accepted,
  rejected,
  acceptanceRate,
}: {
  totalUsers: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
}) {
  const formattedAcceptance = isFinite(acceptanceRate)
    ? Math.round(acceptanceRate * 100)
    : 0;
  const throughput = accepted + rejected;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<ShieldCheck className="h-4 w-4 text-primary" />}
        label="Active Citizens"
        value={totalUsers}
        caption="Reporting in the last cycle"
      />
      <MetricCard
        icon={<Zap className="h-4 w-4 text-primary" />}
        label="Accepted Reports"
        value={accepted}
        caption={`${
          throughput ? Math.round((accepted / throughput) * 100) : 0
        }% success rate`}
      />
      <MetricCard
        icon={<AlertTriangle className="h-4 w-4 text-accent" />}
        label="Rejected Reports"
        value={rejected}
        caption="Auto-flagged for review"
        trendLabel="Escalations"
        trendValue="+4"
        trendPositive={false}
      />
      <MetricCard
        icon={<ShieldCheck className="h-4 w-4 text-primary" />}
        label="Network Health"
        value={`${formattedAcceptance}%`}
        caption="Acceptance ratio across all submissions"
        trendLabel="vs. last cycle"
        trendValue="+2%"
        trendPositive
      />
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  caption,
  trendLabel,
  trendValue,
  trendPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  caption: string;
  trendLabel?: string;
  trendValue?: string;
  trendPositive?: boolean;
}) {
  return (
    <Card className="glass-panel rounded-xl border-border/80 bg-card/80 transition-transform hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="metric-label">{label}</span>
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="metric-value">{value}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
        {trendLabel && trendValue && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs",
              trendPositive
                ? "bg-primary/10 text-primary"
                : "bg-accent/10 text-accent-foreground"
            )}>
            <span>{trendLabel}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertRow({
  icon,
  title,
  detail,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  tag: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-primary/10 p-2">{icon}</span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <Badge
        variant="outline"
        className="border-border/60 text-muted-foreground">
        {tag}
      </Badge>
    </div>
  );
}

function UsersTable({
  users,
  loading,
  banTarget,
  onBan,
}: {
  users: UserWithReportStats[];
  loading: boolean;
  banTarget: string | null;
  onBan: (userId: string) => void;
}) {
  return (
    <Card className="glass-panel rounded-xl border-border/80 bg-card/80">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-lg">Citizen Reporters</CardTitle>
          <CardDescription>
            Acceptance and rejection history for the most recent reporting cycle
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Accepted</th>
              <th className="px-4 py-3">Rejected</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Awaiting fresh reports. Metrics will populate as soon as new
                  submissions arrive.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const total = user.acceptedCount + user.rejectedCount;
                const quality =
                  total === 0
                    ? 0
                    : Math.round((user.acceptedCount / total) * 100);
                const badgeClass =
                  quality >= 75
                    ? "bg-primary/10 text-primary border-primary/30"
                    : quality >= 40
                    ? "bg-secondary/40 text-foreground border-border/80"
                    : "bg-accent/10 text-accent-foreground border-accent/40";

                return (
                  user.isActive && (
                    <tr
                      key={user.id}
                      className={cn(
                        "border-b border-border/60 transition-colors hover:bg-secondary/40",
                        user.rejectedCount >= 1 &&
                          "bg-red-300 hover:bg-red-300/90"
                      )}>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {user.name ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {user.email ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-primary">
                        {user.acceptedCount}
                      </td>
                      <td className="px-4 py-4 text-sm text-accent-foreground">
                        {user.rejectedCount}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border px-3 py-1 text-xs",
                            badgeClass
                          )}>
                          {quality}% reliability
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={loading && banTarget === user.id}
                          onClick={() => onBan(user.id)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90">
                          {loading && banTarget === user.id
                            ? "Processing..."
                            : "Ban User"}
                        </Button>
                      </td>
                    </tr>
                  )
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
