import { redirect } from "next/navigation"
import { Toaster } from "sonner"
import { getPendingReports } from "@/actions/analyst"
import { getCurrentUser } from "@/lib/session"
import { ReportCard } from "@/components/ReportCard"
import { AlertCircle, CheckCircle2, RefreshCw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Add suspense boundary for better loading experience
import { Suspense } from "react"
import { ReportsGridSkeleton } from "@/components/skeletons/ReportsGridSkeleton"

// Refresh interval for data (in milliseconds)
const REFRESH_INTERVAL = 30000 // 30 seconds

async function ReportsGrid() {
  const { reports, error } = await getPendingReports()

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center text-center py-20 bg-destructive/10 text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-2xl font-semibold">Failed to Load Reports</h2>
          <p className="mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center text-center py-20 bg-secondary/30">
          <CheckCircle2 className="h-12 w-12 mb-4 text-success" />
          <h2 className="text-2xl font-semibold">🎉 All Clear!</h2>
          <p className="text-muted-foreground mt-2">
            The report queue is empty. Great work!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  )
}

export default async function AnalystValidatePage() {
  // 1. Secure the page by checking the user's role
  const user = await getCurrentUser()
  if (!user || (user.role !== "analyst" && user.role !== "admin")) {
    redirect("/auth")
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 border-b pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Analyst Validation Queue
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Review, verify, and assign severity to pending citizen reports. 
            
          </p>
          

        </header>

       

        {/* Reports grid with suspense boundary */}
        <Suspense fallback={<ReportsGridSkeleton />}>
          <ReportsGrid />
        </Suspense>
      </div>
    </>
  )
}