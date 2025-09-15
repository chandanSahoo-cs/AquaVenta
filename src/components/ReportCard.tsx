// src/components/ReportCard.tsx
"use client"

import { useState } from "react"
import type { Report } from "@prisma/client"
import { updateReportStatus } from "@/actions/analyst"
import Image from "next/image"

// Define a more specific type for the report prop from the server
type ReportWithUser = Report & {
  user: { name: string | null; email: string | null } | null
}

export function ReportCard({ report }: { report: ReportWithUser }) {
  const [severity, setSeverity] = useState<number>(report.severity ?? 3) // Default Medium
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (verdict: "verified" | "rejected") => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateReportStatus({
        reportId: report.id,
        verdict,
        severity,
      })

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
      // ⚡ If successful, rely on parent re-render (as you mentioned).
    } catch (err) {
      console.error("Update error:", err)
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card shadow-md hover:shadow-xl transition-shadow duration-300 border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Report Media */}
      <div className="relative h-48 w-full bg-muted">
        {report.media ? (
          <Image
            src={report.media}
            alt="Report media"
            fill
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No media available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground break-words h-20 overflow-y-auto">
            {report.description || "No description provided."}
          </p>
          <div className="text-xs">
            <p><strong>Location:</strong> {report.location || "N/A"}</p>
            <p><strong>Submitter:</strong> {report.user?.name || "Anonymous"}</p>
            <p><strong>Submitted:</strong> {new Date(report.submittedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-4">
          {/* Severity Dropdown */}
          <div>
            <label
              htmlFor={`severity-${report.id}`}
              className="block text-sm font-medium mb-1"
            >
              Set Severity
            </label>
            <select
              id={`severity-${report.id}`}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="input w-full border rounded-md px-2 py-1"
              disabled={isSubmitting}
            >
              <option value={1}>1 (Low)</option>
              <option value={2}>2 (Moderate)</option>
              <option value={3}>3 (Medium)</option>
              <option value={4}>4 (High)</option>
              <option value={5}>5 (Critical)</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          {/* Approve / Reject */}
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate("verified")}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-muted disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? "..." : "Approve"}
            </button>
            <button
              onClick={() => handleUpdate("rejected")}
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-muted disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? "..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
