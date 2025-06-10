import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { chat } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const res = await db.select({state: chat.state}).from(chat).where(and(eq(chat.id, params.chatId), eq(chat.userId, session.user.id)));
  return NextResponse.json(res.length === 0 ? null : res[0].state);
}