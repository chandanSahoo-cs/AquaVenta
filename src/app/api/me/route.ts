import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookie = await cookies();
  const token = cookie.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    return NextResponse.json({ success: true, userPayload: payload });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}
