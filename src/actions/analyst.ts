// src/actions/analyst.ts
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma" // Corrected: Using 'prisma' from your file
import { getCurrentUser } from "@/lib/session" // Using our new session function

// 1. Action to fetch all reports that are pending review
export async function getPendingReports() {
  const user = await getCurrentUser()

  // Authorization: Only analysts and admins can perform this action
  if (user?.role !== "analyst" && user?.role !== "admin") {
    // Changed to return an error object for the UI to handle gracefully
    return { error: "Unauthorized: You do not have permission to view reports." }
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        status: "pending",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        submittedAt: "asc",
      },
    })
    return { reports }
  } catch (error) {
    console.error("Failed to fetch pending reports:", error)
    return { error: "Could not fetch reports." }
  }
}

// 2. Action to approve or reject a report
interface UpdateReportArgs {
  reportId: string
  verdict: "verified" | "rejected"
  severity: number
  note?: string
}

export async function updateReportStatus(args: UpdateReportArgs) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "analyst" && user.role !== "admin")) {
    return { error: "Unauthorized: You do not have permission to update reports." }
  }

  const { reportId, verdict, severity, note } = args

  try {
    const updatedReport = await prisma.$transaction(async (tx) => {
      const report = await tx.report.update({
        where: { id: reportId },
        data: {
          status: verdict,
          severity: severity,
        },
      })

      await tx.reportValidation.create({
        data: {
          reportId: reportId,
          validatorId: user.id,
          verdict: verdict === "verified" ? "true" : "false",
          note: note || `Report ${verdict} by analyst.`,
        },
      })

      return report
    })

    revalidatePath("/analyst")

    return { success: true, updatedReport }
  } catch (error) {
    console.error("Failed to update report status:", error)
    return { error: "Could not update the report." }
  }
}