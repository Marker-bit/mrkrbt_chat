import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { chat } from "@/lib/db/schema";
import { and, eq, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("query");
  if (!query) {
    return new NextResponse(null, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const filteredChats = await db
    .select()
    .from(chat)
    .where(and(eq(chat.userId, session.user.id), ilike(chat.title, `%${query}%`)));

  return NextResponse.json(filteredChats);
}