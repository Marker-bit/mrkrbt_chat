import { generateTitleFromUserMessage } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { saveMessages } from "@/lib/db/queries";
import { account, chat as chatTable } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { createProvider, MODELS } from "@/lib/models";
import { getTrailingMessageId } from "@/lib/utils";
import { webSearch } from "@/lib/web-search";
import { createOpenAI } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import {
  appendClientMessage,
  appendResponseMessages,
  experimental_generateImage,
  LanguageModel,
  Message,
  smoothStream,
  streamText,
  Tool,
  tool,
} from "ai";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { PostRequestBody, postRequestBodySchema } from "./schema";

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
    (model) => model.id === requestBody.selectedChatModel.modelId
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

  let messages: Message[]

  if (!requestBody.retryMessageId) {
    messages = appendClientMessage({
      messages: chat.messages,
      message: requestBody.message,
    });
  } else {
    const retryMessage = chat.messages.findIndex((message) => message.id === requestBody.retryMessageId);
    if (retryMessage === -1) {
      return new ChatSDKError("bad_request:api").toResponse();
    }

    messages = chat.messages.slice(0, retryMessage);
  }

  if (requestBody.message.id === messages.at(-1)?.id) {
    messages = messages.slice(0, -1);
    messages = appendClientMessage({
      messages,
      message: requestBody.message,
    })
  }

  await saveMessages(chat.id, messages, {
    state: "loading",
    visibility: requestBody.visibilityType,
  });

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

  let tools: Record<string, Tool> = {
    generateImage: tool({
      description: "Generate an image",
      parameters: z.object({
        prompt: z.string().describe("The prompt to generate the image from"),
      }),
      execute: async ({ prompt }) => {
        if (!("openai" in keys)) {
          return {
            error: "API key for OpenAI not found",
          };
        }
        const openai = createOpenAI({
          apiKey: keys.openai,
        });
        const { image } = await experimental_generateImage({
          model: openai.image("dall-e-3"),
          prompt,
          providerOptions: {
            openai: {
              quality: "standard",
            },
          },
        });

        const blob = await put(
          crypto.randomUUID() + ".png",
          new Blob([image.uint8Array], { type: "image/png" }),
          {
            access: "public",
            addRandomSuffix: true,
          }
        );
        // in production, save this image to blob storage and return a URL
        return { image: blob.url, prompt };
      },
    }),
  };

  if (requestBody.useWebSearch) {
    tools.webSearch = webSearch;
  }

  try {
    const result = streamText({
      model,
      system:
        "You are a helpful assistant. ONLY if the user asks for an image, use the generateImage tool.",
      messages,
      tools: modelToRun.supportsTools ? tools : undefined,
      maxSteps: 2,
      providerOptions: {
        openrouter: {
          effort: requestBody.selectedChatModel.options.effort,
        },
        openai: {
          effort: requestBody.selectedChatModel.options.effort,
        },
      },
      // tools: {
      //   generateImage: tool({
      //     description: "Generate an image",
      //     parameters: z.object({
      //       prompt: z
      //         .string()
      //         .describe("The prompt to generate the image from"),
      //     }),
      //     execute: async ({ prompt }) => {
      //       const { image } = await experimental_generateImage({
      //         model: openai.image("dall-e-3"),
      //         prompt,
      //       });
      //       // in production, save this image to blob storage and return a URL
      //       return { image: image.base64, prompt };
      //     },
      //   }),
      // },
      experimental_transform: smoothStream({ chunking: "word" }),
      experimental_generateMessageId: () => crypto.randomUUID(),
      // providerOptions: {
      //   google: { responseModalities: ["TEXT", "IMAGE"] },
      // },
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
                  experimental_attachments:
                    assistantMessage.experimental_attachments,
                  createdAt: new Date(),
                  modelId: requestBody.selectedChatModel.modelId,
                },
              ],
              { state: "complete" }
            );
          } catch (_) {
            console.error("Failed to save chat");
          }
        }
      },
      onError: async ({ error }) => {
        await db
          .update(chatTable)
          .set({
            state: "complete",
          })
          .where(eq(chatTable.id, chat.id));
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
