"use server"

import { generateText, LanguageModel, UIMessage } from "ai"
import { and, eq, inArray } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { auth } from "./auth"
import { db } from "./db/drizzle"
import { attachment, chat } from "./db/schema"
import {
  createModel,
  ModelData,
  MODELS,
  TITLEGEN_MODELS,
} from "./models"
import { del } from "@vercel/blob"
import { ProviderId } from "@/lib/ai/providers/types";
import { generateDefaultApiKeys } from "@/lib/ai/providers/actions";

export async function setApiKeysAsCookie(
  apiKeys: Record<string, string>
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("apiKeys", JSON.stringify(apiKeys), {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  })
}

export async function saveChatModelAsCookie(
  modelData: ModelData
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("selectedModelData", JSON.stringify(modelData))
}

export async function branchOffChat(
  chatId: string,
  messageId: string
): Promise<{ chatId: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { error: "Unauthorized" }
  }
  const oldChat = await db.query.chat.findFirst({
    where: (chat, { eq }) =>
      and(eq(chat.id, chatId), eq(chat.userId, session.user.id)),
  })
  if (!oldChat) {
    return { error: "Chat not found" }
  }
  const targetMessage = oldChat.messages.findIndex(
    (message) => message.id === messageId
  )
  const newMessages = oldChat.messages.slice(0, targetMessage + 1)
  const newId = crypto.randomUUID()
  await db.insert(chat).values({
    id: newId,
    userId: session.user.id,
    messages: newMessages,
    state: "complete",
    title: oldChat.title,
  })
  return { chatId: newId }
}

export async function generateTitleFromUserMessage({
  message,
  apiKeys,
}: {
  message: UIMessage | UIMessage[]
  apiKeys: Record<string, string>
}) {
  let model: LanguageModel | undefined
  for (const modelId of TITLEGEN_MODELS) {
    const modelFound = MODELS.find((model) => model.id === modelId)!
    for (const provider in modelFound.providers) {
      if (
        !(provider in apiKeys) ||
        apiKeys[provider] === "" ||
        apiKeys[provider] === undefined
      ) {
        continue
      }
      model = createModel(modelFound, provider as ProviderId, apiKeys[provider], {})
      if (model) {
        break
      }
    }
  }

  if (!model) {
    return "Unnamed"
  }

  const system = Array.isArray(message)
    ? `\n
    - you will generate a short title based on all messages in a chat
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`
    : `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`

  try {
    const { text: title } = await generateText({
      model,
      system,
      prompt: JSON.stringify(message),
    })

    return title
  } catch (error) {
    return "Unnamed"
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string
  visibility: "public" | "private"
}) {
  await db.update(chat).set({ visibility }).where(eq(chat.id, chatId))
}

export async function deleteChat(chatId: string) {
  await db.delete(chat).where(eq(chat.id, chatId))
}

export async function pinChat(chatId: string, isPinned: boolean) {
  await db.update(chat).set({ isPinned: !isPinned }).where(eq(chat.id, chatId))
}

export async function updateChatTitle(chatId: string, title: string) {
  await db.update(chat).set({ title }).where(eq(chat.id, chatId))
}

export async function deleteChats(chatIds: string[]) {
  await db.delete(chat).where(inArray(chat.id, chatIds))
}

export async function regenerateChatTitle(chatId: string) {
  const chatFound = await db.query.chat.findFirst({
    where: eq(chat.id, chatId),
  })
  if (!chatFound) {
    return { error: "Chat not found" }
  }
  const cookiesInfo = await cookies()
  let apiKeys: Record<string, string>
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "")
  } catch {
    apiKeys = generateDefaultApiKeys()
  }
  const title = await generateTitleFromUserMessage({
    message: chatFound.messages as unknown as UIMessage[],
    apiKeys,
  })
  await updateChatTitle(chatId, title)
  return { title }
}

export async function deleteImages(imageIds: string[]) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { error: "Unauthorized" }
  }

  const attachments = await db.query.attachment.findMany({
    where: (attachment, { eq }) => eq(attachment.userId, session.user.id),
  })

  await db
    .delete(attachment)
    .where(
      and(
        inArray(attachment.id, imageIds),
        eq(attachment.userId, session.user.id)
      )
    )

  for (const attachment of attachments) {
    await del(attachment.url)
  }

  return { success: true }
}
