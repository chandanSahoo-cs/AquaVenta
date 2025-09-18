"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Fetches all reports with a 'pending' status.
 * Only accessible by users with the 'analyst' or 'admin' role.
 */
export async function getPendingReports() {
  const user = await getCurrentUser();
  if (user?.role !== "analyst" && user?.role !== "admin") {
    return { error: "Unauthorized: You do not have permission to view reports." };
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
    });
    return { reports };
  } catch (error) {
    console.error("Failed to fetch pending reports:", error);
    return { error: "Database error: Could not fetch reports." };
  }
}

/**
 * Fetches a single report by its ID.
 * Only accessible by users with the 'analyst' or 'admin' role.
 */
export async function getReportById(reportId: string) {
  const user = await getCurrentUser();
  if (user?.role !== "analyst" && user?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        // Also include the validation history for this report
        validations: {
          include: {
            validator: {
              select: { name: true },
            },
          },
          orderBy: {
            validatedAt: "desc",
          },
        },
      },
    });

    if (!report) {
      return { error: "Report not found." };
    }

    return { report };
  } catch (error) {
    console.error("Failed to fetch report by ID:", error);
    return { error: "Database error." };
  }
}

/**
 * Fetches all validated (verified or rejected) reports.
 * Only accessible by users with the 'analyst' or 'admin' role.
 */
export async function getValidatedReports() {
  const user = await getCurrentUser();
  if (user?.role !== "analyst" && user?.role !== "admin") {
    return { error: "Unauthorized: You do not have permission to view this content." };
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        status: {
          in: ["verified", "rejected"],
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
    return { reports };
  } catch (error) {
    console.error("Failed to fetch validated reports:", error);
    return { error: "Database error: Could not fetch validation history." };
  }
}

interface UpdateReportArgs {
  reportId: string;
  verdict: "verified" | "rejected";
  severity: number;
  note?: string;
}

/**
 * Updates a report's status and severity. Creates a validation record.
 * Only accessible by users with the 'analyst' or 'admin' role.
 */
export async function updateReportStatus(args: UpdateReportArgs) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "analyst" && user.role !== "admin")) {
    return { error: "Unauthorized: You do not have permission to update reports." };
  }

  const { reportId, verdict, severity, note } = args;

  try {
    const updatedReport = await prisma.$transaction(async (tx) => {
      const report = await tx.report.update({
        where: { id: reportId },
        data: {
          status: verdict,
          severity: severity,
        },
      });

      await tx.reportValidation.create({
        data: {
          reportId: reportId,
          validatorId: user.id,
          verdict: verdict === "verified" ? "true" : "false",
          note: note || `Report ${verdict} by analyst.`,
        },
      });

      return report;
    });

    // Revalidate paths to ensure fresh data is shown on navigation
    revalidatePath("/analyst/validate");
    revalidatePath("/analyst/history");
    revalidatePath(`/analyst/report/${reportId}`);

    return { success: true, updatedReport };
  } catch (error) {
    console.error("Failed to update report status:", error);
    return { error: "Database error: Could not update the report." };
  }
}

