// src/app/analyst/report/[reportId]/page.tsx
import { getReportById } from "@/actions/analyst";
import { ReportActions } from "@/components/ReportActions";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const { reportId } = params;
  const { report, error } = await getReportById(reportId);

  console.log(report, error);
  

  if (error || !report) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href="/analyst/validate" className="text-sm font-semibold text-primary hover:underline">
          &larr; Back to Validate
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {report.media ? (
              <Image src={report.media} alt="Report media" fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Media Provided
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h1 className="mb-4 border-b pb-4 text-2xl font-bold">Report Details</h1>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                <p className="text-base">{report.description || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Location</h3>
                <p className="text-base">{report.location || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Submitted By</h3>
                <p className="text-base">{report.user?.name || "Anonymous"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Submitted At</h3>
                <p className="text-base">{new Date(report.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>
                <p className="text-base font-semibold capitalize">{report.status}</p>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold">Take Action</h2>
              <ReportActions report={report} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}