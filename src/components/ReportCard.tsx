// src/components/ReportCard.tsx
"use client";

import { useState } from "react";
import type { Report } from "../../generated/prisma";
import Image from "next/image";
import Link from "next/link";
import { updateReportStatus } from "@/actions/analyst"; // Re-import the action

type ReportWithUser = Report & {
  user: { name: string | null; email:string | null } | null;
};

export function ReportCard({ report }: { report: ReportWithUser }) {
  // --- State and handler logic is back in the card ---
  const [severity, setSeverity] = useState(report.severity ?? 3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.MouseEvent, verdict: "verified" | "rejected") => {
    // IMPORTANT: Stop the click from bubbling up to the parent <Link>
    e.stopPropagation();
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const result = await updateReportStatus({
      reportId: report.id,
      verdict,
      severity,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false); // Only stop loading on error
    }
    // On success, the card will disappear when the page revalidates.
  };

  return (
    <div className="card flex h-full flex-col overflow-hidden rounded-lg border border-border shadow-md transition-shadow duration-300 hover:shadow-xl">
      {/* This Link wraps the main content area, making it clickable */}
      <Link href={`/analyst/report/${report.id}`} className="block">
        <div className="relative h-48 w-full bg-muted">
          {report.media ? (
            <Image
              src={report.media}
              alt="Report media"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No media available
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <p className="h-20 overflow-y-auto break-words text-sm text-muted-foreground">
              {report.description || "No description provided."}
            </p>
            <div className="text-xs">
              <p><strong>Location:</strong> {report.location || "N/A"}</p>
              <p><strong>Submitter:</strong> {report.user?.name || "Anonymous"}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* --- The action buttons are back, OUTSIDE of the <Link> wrapper --- */}
      <div className="mt-auto space-y-4 border-t p-4">
        <div>
          <label htmlFor={`severity-${report.id}`} className="mb-1 block text-xs font-medium">
            Set Severity
          </label>
          <select
            id={`severity-${report.id}`}
            value={severity}
            // Stop propagation here too to prevent navigation
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              setSeverity(Number(e.target.value));
            }}
            className="input w-full"
            disabled={isSubmitting}
          >
            <option value={1}>1 (Low)</option>
            <option value={2}>2 (Moderate)</option>
            <option value={3}>3 (Medium)</option>
            <option value={4}>4 (High)</option>
            <option value={5}>5 (Critical)</option>
          </select>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={(e) => handleUpdate(e, "verified")}
            disabled={isSubmitting}
            className="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted"
          >
            {isSubmitting ? "..." : "Approve"}
          </button>
          <button
            onClick={(e) => handleUpdate(e, "rejected")}
            disabled={isSubmitting}
            className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-muted"
          >
            {isSubmitting ? "..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}