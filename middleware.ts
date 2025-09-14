import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/actions/user.actions";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    jwt.verify(accessToken!, process.env.ACCESS_TOKEN_SECRET!);
    return NextResponse.next();
  } catch (error) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as any;
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      const existingUser = await prisma.user.findUnique({
        where: {
          id: dbToken?.userId,
        },
      });

      if (
        !dbToken ||
        dbToken.revoked ||
        dbToken.expiresAt < new Date() ||
        !existingUser
      ) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const newAccessToken = generateAccessToken({
        id: existingUser.id,
        name: existingUser.name!,
        email: existingUser.email!,
        role: existingUser.role!,
      });

      const res = NextResponse.next();
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      res.cookies.set("accessToken", newAccessToken, options);

      return res;
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
}

export const config = {
  matcher: ["/user/:path", "/admin/:path", "/profile/:path"],
};
