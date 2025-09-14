"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadMedia(formData: FormData) {
  try {
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const userId = formData.get("userId") as string
    const fileUrl = formData.get("fileUrl") as string
    const file = formData.get("file") as File

    if (!file || !fileUrl) {
      throw new Error("File, file URL, and user ID are required")
    }

    const report = await prisma.report.create({
      data: {
        description: description || null,
        location: location || null,
        userId: userId || null,
        media: fileUrl,
        category: "media", // optional: use a category to distinguish media uploads
        // You can add more fields if needed, e.g. severity, language, etc.
      },
    })

    revalidatePath("/gallery")
    return { success: true, report }
  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload media" }
  }
}

export async function getAllMedia() {
  try {
    const reports = await prisma.report.findMany({
      where: {
        media: { not: "" },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    })

    return reports
  } catch (error) {
    console.error("Fetch error:", error)
    return []
  }
}
