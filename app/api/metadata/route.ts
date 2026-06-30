import { NextResponse } from "next/server";
import { fetchUrlMetadata } from "@/lib/metadata";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const metadata = await fetchUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
