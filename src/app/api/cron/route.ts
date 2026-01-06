import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Call the scrape API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/scrape?secret=${process.env.CRON_SECRET}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Cron job completed",
      result,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
