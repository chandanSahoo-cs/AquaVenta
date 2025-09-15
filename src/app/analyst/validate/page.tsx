// src/app/analyst/page.tsx
import { redirect } from "next/navigation"
import { getPendingReports } from "@/actions/analyst"
import { getCurrentUser } from "@/lib/session"
import { ReportCard } from "@/components/ReportCard" // This is the next component

export default async function AnalystPage() {
  // 1. Secure the page on the server
  const user = await getCurrentUser()
  if (!user || (user.role !== "analyst" && user.role !== "admin")) {
    redirect("/login") // Or your designated "unauthorized" page
  }

  // 2. Fetch the reports
  const { reports, error } = await getPendingReports()

  // 3. Handle potential errors during data fetching
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Analyst Dashboard</h1>
        <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight">Analyst Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Review, verify, and assign severity to pending reports.
        </p>
      </div>

      {/* 4. Display reports or a message if the queue is empty */}
      {reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-secondary/30 rounded-lg">
          <h2 className="text-2xl font-semibold">🎉 All Clear!</h2>
          <p className="text-muted-foreground mt-2">The report queue is empty. Great work!</p>
        </div>
      )}
    </div>
  )
}