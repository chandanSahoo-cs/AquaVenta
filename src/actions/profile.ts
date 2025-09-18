"use server"

import { prisma } from "@/lib/prisma"
import { giveUserPayload } from "./user.actions"

export const getUserProfile = async () => {
  try {
    const userPayload = await giveUserPayload()
    if (!userPayload.userPresent) {
      throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return { success: true, data: user }
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return { success: false, data: { error: (error as Error).message } }
  }
}

export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; email?: string; phone?: string; photo?: string },
) => {
  try {
    const userPayload = await giveUserPayload()
    if (!userPayload.userPresent || userPayload.id !== userId) {
      throw new Error("Unauthorized")
    }

    // Check if email or phone already exists for other users
    if (updates.email || updates.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [updates.email ? { email: updates.email } : {}, updates.phone ? { phone: updates.phone } : {}].filter(
                (obj) => Object.keys(obj).length > 0,
              ),
            },
          ],
        },
      })

      if (existingUser) {
        throw new Error("Email or phone number already in use")
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
      },
    })

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return { success: false, data: { error: (error as Error).message } }
  }
}

/**
 * Upload user photo to Firebase Storage (server-side).
 * Requires FIREBASE_SERVICE_ACCOUNT env (JSON string) and FIREBASE_STORAGE_BUCKET set.
 */
export const uploadUserPhoto = async (_userId: string, _file: unknown) => {
  // Server-side upload was removed in favor of client-side Firebase Storage uploads.
  // Keep an async function exported so Next.js doesn't error when loading server actions.
  // If you later re-enable server-side uploads, implement the upload logic here.
  throw new Error(
    "Server-side uploadUserPhoto is disabled. Upload files from the client to Firebase Storage and call updateUserProfile(userId, { photo: downloadUrl }).",
  )
}

export const deleteUserPhoto = async (userId: string) => {
  try {
    const userPayload = await giveUserPayload()
    if (!userPayload.userPresent || userPayload.id !== userId) {
      throw new Error("Unauthorized")
    }

    await prisma.user.update({
      where: { id: userId },
      data: { photo: null },
    })

    return { success: true, data: {} }
  } catch (error) {
    console.error("Failed to delete user photo:", error)
    return { success: false, data: { error: (error as Error).message } }
  }
}