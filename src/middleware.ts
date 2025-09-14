import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  console.log("Middlware");
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  console.log("Middleware called");
  if (!accessToken?.trim() && !refreshToken?.trim()) {
  }
  try {
    jwt.verify(accessToken!, process.env.ACCESS_TOKEN_SECRET!);
    return NextResponse.next();
  } catch (error) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
      const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      console.log("Middl");

      if (verifyRes.status !== 200) {
        return NextResponse.redirect(new URL("/auth", req.url));
      }

      const newAccessToken = (await verifyRes.json()).accessToken;
      const res = NextResponse.next();
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      res.cookies.set("accessToken", newAccessToken, options);

      return res;
    } catch (error) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/analyst/:path*"],
};
