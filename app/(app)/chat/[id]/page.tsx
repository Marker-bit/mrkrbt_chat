import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { and } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ChatPage from "./_components/chat-page";
import { DEFAULT_API_KEYS_COOKIE } from "@/lib/models";

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth");
  }

  const chat = await db.query.chat.findFirst({
    where: (chat, { eq }) =>
      and(eq(chat.userId, session.user.id), eq(chat.id, id)),
  });

  if (!chat) {
    return notFound();
  }

  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "");
  } catch {
    apiKeys = DEFAULT_API_KEYS_COOKIE;
    cookiesInfo.set("apiKeys", JSON.stringify(apiKeys));
  }

  return (
    <ChatPage
      id={id}
      chat={chat}
      selectedModelId={
        cookiesInfo.get("selectedModelId")?.value || "gemini-2.5-flash"
      }
      apiKeys={apiKeys}
    />
  );
}
