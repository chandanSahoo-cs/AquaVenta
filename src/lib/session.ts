// src/lib/session.ts
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma" // Using your prisma export
import type { RoleName } from "../../generated/prisma"

// This is the shape of the data we'll encode in the JWT
interface UserPayload {
  id: string
  name: string
  email: string
  role: RoleName
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) {
    return null
  }

  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserPayload

    // Optional but recommended: Check if the user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    // If user doesn't exist or is inactive, invalidate the session
    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    // If token is invalid or expired, return null
    console.error("Authentication error:", error)
    return null
  }
}