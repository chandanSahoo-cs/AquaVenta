process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://tsunami.incois.gov.in/itews/DSSProducts/OPR/past90days.json"
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
