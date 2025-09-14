import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/actions/user.actions";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;

    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    const existingUser = await prisma.user.findUnique({
      where: { id: dbToken?.userId },
    });

    if (
      !dbToken ||
      dbToken.revoked ||
      dbToken.expiresAt < new Date() ||
      !existingUser
    ) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const newAccessToken = generateAccessToken({
      id: existingUser.id,
      name: existingUser.name!,
      email: existingUser.email!,
      role: existingUser.role!,
    });

    return NextResponse.json({ ok: true, accessToken: newAccessToken });
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
