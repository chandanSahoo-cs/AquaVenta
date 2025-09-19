// src/components/ReportCard.tsx
"use client";

import { useState } from "react";
import type { Report } from "../../generated/prisma";
import Image from "next/image";
import Link from "next/link";
import { updateReportStatus } from "@/actions/analyst";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Calendar,
  Clock,
  ExternalLink,
  AlertCircle
} from "lucide-react";

type ReportWithUser = Report & {
  user: { name: string | null; email: string | null } | null;
};

export function ReportCard({ report }: { report: ReportWithUser }) {
  const [severity, setSeverity] = useState(report.severity ?? 3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (e: React.MouseEvent, verdict: "verified" | "rejected") => {
    e.stopPropagation();
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await updateReportStatus({
      reportId: report.id,
      verdict,
      severity,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Report ${verdict === "verified" ? "approved" : "rejected"} successfully!`);
      // Auto-clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000);
    }
    
    setIsSubmitting(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Severity level descriptions
  const severityLevels = [
    "1 (Low - Minor issue)",
    "2 (Moderate - Nuisance)",
    "3 (Medium - Concerning)",
    "4 (High - Serious threat)",
    "5 (Critical - Immediate danger)"
  ];

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Header with status badge */}
      <div className="relative">
        <div className="absolute top-3 left-3 z-10">
          <Badge 
            className="flex items-center gap-1 font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            {report.status === "PENDING" && <Clock className="h-3 w-3" />}
            {report.status === "VERIFIED" && <CheckCircle className="h-3 w-3" />}
            {report.status === "REJECTED" && <XCircle className="h-3 w-3" />}
            {report.status}
          </Badge>
        </div>
        
        {/* Image/Media section */}
        <Link href={`/analyst/report/${report.id}`} className="block">
          <div className="relative h-48 w-full bg-muted/50">
            {report.media ? (
              <Image
                src={report.media}
                alt="Report media"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8" />
                <span className="text-sm">No media available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </Link>
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/analyst/report/${report.id}`} className="block flex-1">
          <div className="mb-4">
            <p className="mt-2 line-clamp-3 h-16 text-sm text-muted-foreground">
              {report.description || "No description provided."}
            </p>
          </div>

          {/* Metadata */}
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{report.user?.name || "Anonymous"}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(report.submittedAt.toString())}</span>
              <Clock className="ml-2 h-3 w-3" />
              <span>{formatTime(report.submittedAt.toString())}</span>
            </div>
          </div>
        </Link>

        {/* Action section */}
        <div className="mt-4 space-y-3 border-t pt-4">
          <div>
            <label htmlFor={`severity-${report.id}`} className="mb-2 flex items-center gap-1 text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              Severity Level
            </label>
            <select
              id={`severity-${report.id}`}
              value={severity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setSeverity(Number(e.target.value));
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSubmitting}
            >
              {severityLevels.map((level, index) => (
                <option key={index + 1} value={index + 1}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 p-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-3 justify-between items-stretch">
  <Button
    onClick={(e) => handleUpdate(e, "verified")}
    disabled={isSubmitting}
    className="flex-1 rounded-md px-4 py-2.5 font-semibold bg-white text-[#193b57] border-2 border-[#193b57] hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isSubmitting ? "..." : "Approve"}           
  </Button>
  <Button
    onClick={(e) => handleUpdate(e, "rejected")}
    disabled={isSubmitting}
    className="flex-1 rounded-md px-4 py-2.5 font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isSubmitting ? "..." : "Reject"}
  </Button>
</div>
          
          <Button asChild variant="ghost" className="w-full gap-1 text-xs" size="sm">
            <Link href={`/analyst/report/${report.id}`}>
              View Details <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}