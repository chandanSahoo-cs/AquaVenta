// src/app/analyst/report/[reportId]/page.tsx
import { getReportById } from "@/actions/analyst";
import { ReportActions } from "@/components/ReportActions";
import { LocationDisplay } from "@/components/LocationDisplay";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  AlertCircle,
  Shield
} from "lucide-react";

export default async function ReportDetailPage({ 
  params 
}: { 
  params: { reportId: string } 
}) {
  const { reportId } = params;
  const { report, error } = await getReportById(reportId);

  if (error || !report) {
    notFound();
  }

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header with back navigation */}
        <div className="mb-6 flex items-center gap-4">
          <Link 
            href="/analyst/validate" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Validation Queue
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-2xl font-bold tracking-tight">Report Details</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Media Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  Report Media
                </h2>
              </div>
              <div className="p-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {report.media ? (
                    <Image 
                      src={report.media} 
                      alt="Report media" 
                      fill 
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <AlertCircle className="h-12 w-12" />
                      <p className="text-sm">No Media Provided</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  Description
                </h2>
              </div>
              <div className="p-6">
                <p className="text-base leading-relaxed text-foreground">
                  {report.description || (
                    <span className="text-muted-foreground italic">
                      No description provided by the reporter.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar with details and actions */}
          <div className="space-y-6">
            {/* Report Details Card */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5" />
                  Report Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <Badge 
                    className="flex items-center gap-1 font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1"
                  >
                    {report.status}
                  </Badge>
                </div>

                {/* Submitted By */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Submitted By
                  </h3>
                  <p className="text-base font-medium">
                    {report.user?.name || "Anonymous User"}
                  </p>
                  {report.user?.email && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.user.email}
                    </p>
                  )}
                </div>

                {/* Submitted At */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Submitted At
                  </h3>
                  <p className="text-base">
                    {formatDate(report.submittedAt.toString())}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <LocationDisplay
                    latitude={report.latitude}
                    longitude={report.longitude}
                    className="text-base font-medium"
                  />
                </div>

                {/* Report ID */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Report ID
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {report.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5" />
                  Validation Actions
                </h2>
              </div>
              <div className="p-6">
                <ReportActions report={report} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}