import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { saveMessages } from "@/lib/db/queries";
import { account, chat as chatTable } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { createProvider, MODELS } from "@/lib/models";
import { getTrailingMessageId } from "@/lib/utils";
import {
  appendClientMessage,
  appendResponseMessages,
  LanguageModel,
  smoothStream,
  streamText,
} from "ai";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { PostRequestBody, postRequestBodySchema } from "./schema";
import { generateTitleFromUserMessage } from "@/lib/actions";

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

  const cookiesInfo = await cookies();

  const apiKeys = cookiesInfo.get("apiKeys")?.value;

  if (!apiKeys) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  let keys: any;

  try {
    keys = JSON.parse(apiKeys);
  } catch (e) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  let providerData: { id: string; apiKey: string; modelName: string } | null =
    null;

  for (const provider in modelToRun.providers) {
    if (provider in keys) {
      const providerApiKey = keys[provider];

      providerData = {
        id: provider,
        apiKey: providerApiKey,
        modelName: modelToRun.providers[provider],
      };
      break;
    }
  }

  if (!providerData) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  let chat = await db.query.chat.findFirst({
    where: (chat, { eq }) => eq(chat.id, requestBody.id),
  });

  if (chat && chat.userId !== session.user.id) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  if (!chat) {
    const title = await generateTitleFromUserMessage({
      message: requestBody.message,
      apiKeys: keys,
    });
    [chat] = await db
      .insert(chatTable)
      .values({
        id: requestBody.id,
        userId: session.user.id,
        messages: [],
        title,
      })
      .returning();
  }

  const messages = appendClientMessage({
    messages: chat.messages,
    message: requestBody.message,
  });

  await saveMessages(chat.id, messages, "loading");

  const provider = createProvider(providerData.id, providerData.apiKey);

  if (!provider) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  let model: LanguageModel;

  try {
    model = provider.chat(providerData.modelName);
  } catch (e) {
    return new ChatSDKError("unauthorized:provider").toResponse();
  }

  try {
    const result = streamText({
      model,
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

            await saveMessages(
              chat.id,
              [
                ...messages,
                {
                  id: assistantId,
                  role: assistantMessage.role,
                  parts: assistantMessage.parts,
                  content: assistantMessage.content,
                  // attachments: assistantMessage.experimental_attachments ?? [],
                  createdAt: new Date(),
                  modelId: requestBody.selectedChatModel,
                },
              ],
              "complete"
            );
          } catch (_) {
            console.error("Failed to save chat");
          }
        }
      },
    });

    result.consumeStream();

    await db
      .update(account)
      .set({
        messagesSent: currentAccount.messagesSent + 1,
      })
      .where(eq(account.id, currentAccount.id));

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (err) => {
        console.error(err);
        return "Something went wrong. Please try again later.";
      },
    });
  } catch (error) {
    return new ChatSDKError("bad_request:stream").toResponse();
  }
}
