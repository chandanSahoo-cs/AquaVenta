import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

async function verifyJwt(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload;
  } catch {
    return null;
  }
}

function redirectToAuth(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next(); // avoid infinite redirect
  }
  return NextResponse.redirect(new URL("/auth", req.url));
}

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const payload = await verifyJwt(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    );
    if (payload) {
      if (req.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/user/dashboard", req.url));
      }
      return NextResponse.next();
    }
  }

  if (refreshToken) {
    try {
      const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (verifyRes.status !== 200) {
        return redirectToAuth(req);
      }

      const { accessToken: newAccessToken } = await verifyRes.json();

      if (req.nextUrl.pathname.startsWith("/auth")) {
        const redirectRes = NextResponse.redirect(
          new URL("/user/dashboard", req.url)
        );
        redirectRes.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
        return redirectRes;
      }

      const res = NextResponse.next();
      res.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      
      return res;
    } catch {
      return redirectToAuth(req);
    }
  }
  return redirectToAuth(req);
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/analyst/:path*", "/auth"],
};
