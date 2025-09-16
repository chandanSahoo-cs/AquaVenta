// src/components/ReportActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReportStatus } from "@/actions/analyst";
import type { Report } from "../../generated/prisma";

export function ReportActions({ report }: { report: Report }) {
  const router = useRouter();
  const [severity, setSeverity] = useState(report.severity ?? 3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (verdict: "verified" | "rejected") => {
    setIsSubmitting(true);
    setError(null);

    const result = await updateReportStatus({
      reportId: report.id,
      verdict,
      severity,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      alert("Report status updated successfully!");
      router.push("/analyst/validate");
      router.refresh();
    }
  };

  if (report.status !== "pending") {
    return <p className="mt-2 text-sm text-muted-foreground">This report has already been reviewed.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor="severity" className="mb-1 block text-sm font-medium">Set Severity</label>
        <select
          id="severity"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
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
          onClick={() => handleUpdate("verified")}
          disabled={isSubmitting}
          className="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted"
        >
          {isSubmitting ? "..." : "Approve"}
        </button>
        <button
          onClick={() => handleUpdate("rejected")}
          disabled={isSubmitting}
          className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-muted"
        >
          {isSubmitting ? "..." : "Reject"}
        </button>
      </div>
    </div>
  );
}