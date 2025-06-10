"use server";

import { cookies, headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db/drizzle";
import { and } from "drizzle-orm";
import { chat } from "./db/schema";
import { generateText, LanguageModel, Provider, UIMessage } from "ai";
import { createProvider, PROVIDERS_TITLEGEN_MAP } from "./models";

export async function setApiKeysAsCookie(
  apiKeys: Record<string, string>
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("apiKeys", JSON.stringify(apiKeys));
}

export async function branchOffChat(
  chatId: string,
  messageId: string
): Promise<{ chatId: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }
  const oldChat = await db.query.chat.findFirst({
    where: (chat, { eq }) =>
      and(eq(chat.id, chatId), eq(chat.userId, session.user.id)),
  });
  if (!oldChat) {
    return { error: "Chat not found" };
  }
  const targetMessage = oldChat.messages.findIndex((message) => message.id === messageId);
  const newMessages = oldChat.messages.slice(0, targetMessage + 1);
  const newId = crypto.randomUUID();
  await db.insert(chat).values({
    id: newId,
    userId: session.user.id,
    messages: newMessages,
    state: "complete",
  });
  return { chatId: newId };
}

export async function generateTitleFromUserMessage({
  message,
  apiKeys
}: {
  message: UIMessage;
  apiKeys: Record<string, string>;
}) {
  let model: LanguageModel | null = null;
  for (const provider in PROVIDERS_TITLEGEN_MAP) {
    if (apiKeys[provider] === undefined) {
      continue;
    }
    const newP = createProvider(provider, apiKeys[provider]);
    if (newP) {
      model = newP.chat(PROVIDERS_TITLEGEN_MAP[provider]);
      break;
    }
  }

  if (!model) {
    return "Unnamed"
  }

  const { text: title } = await generateText({
    model,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}