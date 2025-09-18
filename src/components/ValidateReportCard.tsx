"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User, AlertTriangle, Check, X } from "lucide-react"

// Define the shape of the report object for type safety.
// This should match the data structure returned by your server action.
type Report = {
  id: string
  description: string | null
  media: string
  submittedAt: Date
  status: "verified" | "rejected" | string // Allow string for flexibility
//   location: string | null
  severity: number
  user: {
    name: string | null
  } | null
}

/**
 * A read-only card component to display a report that has already been validated.
 * It shows the final status (verified/rejected) and the assigned severity.
 */
export function ValidatedReportCard({ report }: { report: Report }) {
  // Format the date for better readability
  const formattedDate = new Date(report.submittedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // Determine the variant and icon for the status badge
  const isVerified = report.status === "verified"
  const statusVariant = isVerified ? "default" : "destructive"

  return (
    <Card className="flex h-full flex-col shadow-enterprise transition-transform duration-200 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video w-full overflow-hidden rounded-t-md">
          <img
            src={report.media || "https://placehold.co/600x400/gray/white?text=No+Image"}
            alt="Report Media"
            className="h-full w-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 p-4">
        <p className="text-pretty text-sm">
          {report.description || "No description provided."}
        </p>
        <div className="space-y-1.5 border-t pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User size={12} />
            <span>{report.user?.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            {/* <span>{report.location || "Location not specified"}</span> */}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between rounded-b-md bg-muted/30 p-3 text-sm font-semibold">
        {/* Final Status Badge */}
        <Badge variant={statusVariant} className="gap-1.5 pl-2 capitalize">
          {isVerified ? <Check size={14} /> : <X size={14} />}
          {report.status}
        </Badge>
        {/* Assigned Severity */}
        <div className="flex items-center gap-2 text-warning-foreground">
          <AlertTriangle size={14} className="text-warning" />
          <span>Severity: {report.severity}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
