import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    // Convert standard github blob links to raw.githubusercontent.com
    let fetchUrl = url;
    if (fetchUrl.includes("github.com") && fetchUrl.includes("/blob/")) {
      fetchUrl = fetchUrl
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    }

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL status: ${response.status}` },
        { status: response.status }
      );
    }

    const code = await response.text();
    return NextResponse.json({ code });
  } catch (error: any) {
    console.error("Fetch URL Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch URL" }, { status: 500 });
  }
}
