import { getValidatedReports } from "@/actions/analyst";
import { Button } from "@/components/ui/button";
import { ValidatedReportCard } from "@/components/ValidateReportCard";
import { getCurrentUser } from "@/lib/session";
import { AlertCircle, History, Inbox } from "lucide-react";
import Link from "next/link";

export default async function AnalystHistoryPage() {
  const user = await getCurrentUser();

  const { reports, error } = await getValidatedReports();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <History />
            Validation History
          </h1>
          <p className="text-muted-foreground mt-2">
            A log of all reports you have previously verified or rejected.
          </p>
        </div>
        <Button asChild>
          <Link href="/analyst/validate">
            <Inbox className="mr-2 h-4 w-4" />
            Back to Validation Queue
          </Link>
        </Button>
      </div>

      {/* Handle Data Fetching Errors */}
      {error && (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-2xl font-semibold">Failed to Load History</h2>
          <p className="mt-2">{error}</p>
        </div>
      )}

      {/* Display Reports or Empty State */}
      {!error && reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <ValidatedReportCard
              key={report.id}
              report={{
                ...report,
              }}
            />
          ))}
        </div>
      ) : !error ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-secondary/30 rounded-lg">
          <History className="h-12 w-12 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No Reports Validated Yet</h2>
          <p className="text-muted-foreground mt-2">
            Once you validate reports from the queue, they will appear here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
