import { auth } from "@/lib/auth";
import { getAPIKeys } from "@/lib/cookie-utils";
import { db } from "@/lib/db/drizzle";
import { and, or } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ChatPage from "./_components/chat-page";

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
      and(
        or(eq(chat.userId, session.user.id), eq(chat.visibility, "public")),
        eq(chat.id, id)
      ),
  });

  if (!chat) {
    return notFound();
  }

  const apiKeys = await getAPIKeys()

  return (
    <ChatPage
      id={id}
      chat={chat}
      readOnly={chat.visibility === "public" && session.user.id !== chat.userId}
      initialVisibilityType={chat.visibility}
      apiKeys={apiKeys}
    />
  );
}
