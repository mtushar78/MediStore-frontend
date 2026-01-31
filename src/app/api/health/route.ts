import { NextResponse } from "next/server";
import { medistoreFetch } from "@/server/medistore-api";

export async function GET() {
  const data = await medistoreFetch("/api/v1/health", {
    method: "GET",
    next: { revalidate: 10 },
  });
  return NextResponse.json(data);
}
