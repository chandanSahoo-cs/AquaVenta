"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { giveUserPayload } from "./user.actions"

export async function uploadMedia(formData: FormData) {
  try {
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const fileUrl = formData.get("fileUrl") as string

    const {userPresent,id} = await giveUserPayload();
    if(!userPresent){
      throw new Error("User not present")
    }
    if (!fileUrl) {
      throw new Error("File URL, and user ID are required")
    }

    const report = await prisma.report.create({
      data: {
        description: description || null,
        location: location || null,
        userId: id,
        media: fileUrl,
        category: "media", // optional: use a category to distinguish media uploads
        // You can add more fields if needed, e.g. severity, language, etc.
      },
    })

    revalidatePath("/user/gallery")
    return { success: true, report }
  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload media" }
  }
}

export async function getAllMedia() {
  try {

    const { userPresent } = await giveUserPayload()
    if (!userPresent) {
      throw new Error("User not present")
    }

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

export async function getAllVerifiedMedia() {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: "verified", // Only fetch verified reports
      },
      orderBy: {
        submittedAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })
    return reports
  } catch (error) {
    console.error("Failed to get all media:", error)
    return []
  }
}

export async function getUserMedia() {
  try {
    const { userPresent, id } = await giveUserPayload()
    if (!userPresent) {
      throw new Error("User not present")
    }

    const reports = await prisma.report.findMany({
      where: {
        userId: id,
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
    console.error("Fetch user media error:", error)
    return []
  }
}

export async function getRecentSubmissions(limit = 6) {
  try {
    const { userPresent, id: userId } = await giveUserPayload()
    if (!userPresent) {
      throw new Error("User not authenticated")
    }

    const reports = await prisma.report.findMany({
      where: { userId: userId }, // FIX: Fetch reports for the current user, not undefined
      take: limit,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        media: true,
        status: true,
        severity: true,
        submittedAt: true,
        category: true,
      },
    })

    return { success: true, data: reports }
  } catch (error) {
    console.error("Failed to get recent submissions:", error)
    return { success: false, data: { error: (error as Error).message } }
  }
}
