import { NextRequest, NextResponse } from "next/server";

import { getProblems } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const params = {
    q: searchParams.get("q") || undefined,
    sort: (searchParams.get("sort") as "votes" | "recent" | "pain") || "votes",
    category: searchParams.get("category") || undefined,
    limit: parseInt(searchParams.get("limit") || "20"),
    offset: parseInt(searchParams.get("offset") || "0"),
  };

  const problems = await getProblems(params);

  return NextResponse.json({
    problems,
    hasMore: problems.length === params.limit,
  });
}
