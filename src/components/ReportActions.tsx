// src/components/ReportActions.tsx
"use client";

import { useState } from "react";
import type { Report } from "../../generated/prisma";
import { updateReportStatus } from "@/actions/analyst";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ReportActionsProps {
  report: Report;
}

export function ReportActions({ report }: ReportActionsProps) {
  const [severity, setSeverity] = useState(report.severity ?? 3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdate = async (verdict: "verified" | "rejected") => {
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

  // Severity level descriptions
  const severityLevels = [
    "1 (Low - Minor issue)",
    "2 (Moderate - Nuisance)",
    "3 (Medium - Concerning)",
    "4 (High - Serious threat)",
    "5 (Critical - Immediate danger)"
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`severity-${report.id}`} className="mb-2 block text-sm font-medium">
          Set Severity Level
        </label>
        <select
          id={`severity-${report.id}`}
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
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

      <div className="flex gap-3 justify-between items-center">
        <Button
          onClick={async () => {
            await handleUpdate("verified");
            window.location.href = "/analyst/validate";
          }}
          disabled={isSubmitting}
          className="flex-1 rounded-md px-4 py-2.5 font-semibold bg-white text-[#193b57] border-2 border-[#193b57] hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted"
        >
          {isSubmitting ? "Processing..." : "Approve"}
        </Button>
        <Button
          onClick={async () => {
            await handleUpdate("rejected");
            window.location.href = "/analyst/validate";
          }}
          disabled={isSubmitting}
          className="flex-1 rounded-md px-4 py-2.5 font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted"
        >
          {isSubmitting ? "Processing..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}