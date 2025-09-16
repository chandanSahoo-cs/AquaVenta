// src/lib/session.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { RoleName } from "../../generated/prisma";

// Define the shape of the user object we expect from the session
export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  role: RoleName;
  isActive: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  // 1. If no token exists, the user is not logged in.
  if (!token) {
    return null;
  }

  try {
    // 2. Verify the token is valid and not expired.
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { id: string };

    // 3. Check that the user exists in the database and is still active.
    // This is a crucial security check.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, isActive: true },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    // 4. If the user is not found or inactive, they are not authenticated.
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // 5. If the token is malformed or expired, verification will fail.
    console.error("Invalid access token:", error);
    return null;
  }
}