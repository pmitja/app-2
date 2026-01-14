import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getProblems } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const session = await auth();

  const params = {
    q: searchParams.get("q") || undefined,
    sort: searchParams.get("sort") || "votes",
    category: searchParams.get("category") || undefined,
    limit: parseInt(searchParams.get("limit") || "20"),
    offset: parseInt(searchParams.get("offset") || "0"),
    userId: session?.user?.id,
  };

  const problems = await getProblems(params);

  return NextResponse.json({
    problems,
    hasMore: problems.length === params.limit,
  });
}
