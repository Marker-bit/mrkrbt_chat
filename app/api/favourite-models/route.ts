import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionInfo = await auth.api.getSession({ headers: await headers() });

  if (!sessionInfo) {
    return new NextResponse(null, { status: 401 });
  }

  const favouriteModels = sessionInfo.user.favouriteModels;
  return NextResponse.json(favouriteModels);
}