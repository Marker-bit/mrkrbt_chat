import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import {
  appendClientMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
} from "ai";
import { PostRequestBody, postRequestBodySchema } from "./schema";
import { ChatSDKError } from "@/lib/errors";
import { db } from "@/lib/db/drizzle";
import { account, chat as chatTable, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { saveMessages } from "@/lib/db/queries";
import { getTrailingMessageId } from "@/lib/utils";
import { MODELS } from "@/lib/models";
import { eq } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (e) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const currentAccount = await db.query.account.findFirst({
    where: (account, { eq }) => eq(account.userId, session.user.id),
  });

  if (!currentAccount) {
    return new ChatSDKError("unauthorized:api").toResponse();
  }

  const modelToRun = MODELS.find(
    (model) => model.id === requestBody.selectedChatModel
  )!;

  const chosenProvider = modelToRun.providers[0];

  if (!chosenProvider) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const cookiesInfo = await cookies();

  const apiKeys = cookiesInfo.get("apiKeys")?.value;

  if (!apiKeys) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  let providerApiKey: string;
  try {
    const parsedApiKeys = JSON.parse(apiKeys);
    providerApiKey = parsedApiKeys[chosenProvider.id];

    if (!providerApiKey) {
      return new ChatSDKError("unauthorized:provider").toResponse();
    }
  } catch (e) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  const openrouter = createOpenRouter({
    apiKey: providerApiKey,
  });

  let chat = await db.query.chat.findFirst({
    where: (chat, { eq }) => eq(chat.id, requestBody.id),
  });

  if (chat && chat.userId !== session.user.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  if (!chat) {
    chat = (
      await db
        .insert(chatTable)
        .values({ id: requestBody.id, userId: session.user.id, messages: [] })
        .returning()
    )[0];
  }

  const messages = appendClientMessage({
    messages: chat.messages,
    message: requestBody.message,
  });

  await saveMessages(chat.id, messages);

  try {
    const result = streamText({
      model: openrouter.chat(chosenProvider.modelName),
      system: "You are a helpful assistant.",
      messages,
      experimental_transform: smoothStream({ chunking: "word" }),
      experimental_generateMessageId: () => crypto.randomUUID(),
      onFinish: async ({ response }) => {
        if (session.user?.id) {
          try {
            const assistantId = getTrailingMessageId({
              messages: response.messages.filter(
                (message) => message.role === "assistant"
              ),
            });

            if (!assistantId) {
              throw new Error("No assistant message found!");
            }

            const [, assistantMessage] = appendResponseMessages({
              messages: [requestBody.message],
              responseMessages: response.messages,
            });

            await saveMessages(chat.id, [
              ...messages,
              {
                id: assistantId,
                role: assistantMessage.role,
                parts: assistantMessage.parts,
                content: assistantMessage.content,
                // attachments: assistantMessage.experimental_attachments ?? [],
                createdAt: new Date(),
              },
            ]);
          } catch (_) {
            console.error("Failed to save chat");
          }
        }
      },
    });

    await db.update(account).set({
      messagesSent: currentAccount.messagesSent + 1,
    }).where(eq(account.id, currentAccount.id));

    return result.toDataStreamResponse();
  } catch (error) {
    return new ChatSDKError("bad_request:stream").toResponse();
  }
}
