import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { and } from "drizzle-orm";
import { cookies, headers } from "next/headers";
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
      and(eq(chat.userId, session.user.id), eq(chat.id, id)),
  });

  if (!chat) {
    return notFound();
  }

  const cookiesInfo = await cookies();

  return (
    <ChatPage
      id={id}
      chat={chat}
      selectedModelId={
        cookiesInfo.get("selectedModelId")?.value || "gemini-2.5-flash"
      }
    />
  );
}
