import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, desc, eq, gt, lt, not, SQL } from "drizzle-orm";
import { Chat } from "@/lib/db/db-types";
import { db } from "@/lib/db/drizzle";
import { chat } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  if (startingAfter && endingBefore) {
    return NextResponse.json({
      error: "You can only pass one of 'starting_after' or 'ending_before'",
    }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
    }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, userId))
            : eq(chat.userId, userId)
        )
        .orderBy(desc(chat.isPinned), desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        return NextResponse.json(
          {
            error: "Chat (starting_after) not found",
          },
          { status: 404 }
        );
      }

      filteredChats = await query(
        and(gt(chat.createdAt, selectedChat.createdAt), not(chat.isPinned))
      );
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        return NextResponse.json(
          {
            error: "Chat (ending_before) not found",
          },
          { status: 404 }
        );
      }

      filteredChats = await query(
        and(lt(chat.createdAt, selectedChat.createdAt), not(chat.isPinned))
      );
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return Response.json({
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get chats",
      },
      { status: 500 }
    );
  }
}
