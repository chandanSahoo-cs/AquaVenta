import { getAllVerifiedMedia } from "@/actions/media";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const verifiedReports = await getAllVerifiedMedia();

    if (!verifiedReports) {
      return NextResponse.json(
        { success: false, verifiedReports: [] },
        { status: 401 }
      );
    }

    const reports = verifiedReports.map((vr) => ({
      username: vr.user?.name,
      longitude: vr.longitude,
      latitude: vr.latitude,
      description: vr.description,
      status: vr.status,
    }));

    return NextResponse.json({ success: true, verifiedReports: reports });
  } catch (error) {
    return NextResponse.json(
      { success: false, verifiedReports: [] },
      { status: 401 }
    );
  }
}
