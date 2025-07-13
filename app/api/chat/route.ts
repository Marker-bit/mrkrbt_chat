import { generateTitleFromUserMessage } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { Message } from "@/lib/db/db-types"
import { db } from "@/lib/db/drizzle"
import { saveMessages } from "@/lib/db/queries"
import { account, chat as chatTable } from "@/lib/db/schema"
import { createModel, MODELS, PROVIDERS } from "@/lib/models"
import { getTrailingMessageId } from "@/lib/utils"
import { webSearch } from "@/lib/web-search"
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { put } from "@vercel/blob"
import {
  APICallError,
  appendClientMessage,
  appendResponseMessages,
  experimental_generateImage,
  LanguageModel,
  smoothStream,
  streamText,
  Tool,
  tool,
} from "ai"
import { eq } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { z } from "zod"
import { PostRequestBody, postRequestBodySchema } from "./schema"
import { NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// Allow streaming responses up to 60 seconds
export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    )
  }

  let requestBody: PostRequestBody

  try {
    const json = await req.json()
    requestBody = postRequestBodySchema.parse(json)
  } catch (e) {
    return NextResponse.json(
      {
        message: "Invalid request body",
      },
      { status: 400 }
    )
  }

  const currentAccount = await db.query.account.findFirst({
    where: (account, { eq }) => eq(account.userId, session.user.id),
  })

  if (!currentAccount) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    )
  }

  const isOpenRouter =
    requestBody.selectedChatModel.modelId.startsWith("openrouter:")

  const modelToRun = MODELS.find(
    (model) => model.id === requestBody.selectedChatModel.modelId
  )!

  const cookiesInfo = await cookies()

  const apiKeys = cookiesInfo.get("apiKeys")?.value

  if (!apiKeys) {
    return NextResponse.json(
      {
        message: "API keys not found",
      },
      { status: 400 }
    )
  }

  let keys: any

  try {
    keys = JSON.parse(apiKeys)
  } catch (e) {
    return NextResponse.json(
      {
        message: "Failed to parse API keys",
      },
      { status: 400 }
    )
  }

  let providerData: {
    id: string
    apiKey: string
    modelName: string
    additionalData?: Record<string, unknown>
  } | null = null

  if (isOpenRouter) {
    providerData = {
      id: "openrouter",
      apiKey: keys["openrouter"],
      modelName: requestBody.selectedChatModel.modelId.slice(11),
    }
  } else {
    const chosenProvider = requestBody.selectedChatModel.options.provider

    if (
      chosenProvider &&
      chosenProvider in keys &&
      keys[chosenProvider].length > 0
    ) {
      providerData = {
        id: chosenProvider,
        apiKey: keys[chosenProvider],
        modelName: modelToRun.providers[chosenProvider].modelName,
        additionalData: modelToRun.providers[chosenProvider].additionalData,
      }
    } else {
      for (const provider in modelToRun.providers) {
        if (provider in keys) {
          const providerApiKey = keys[provider]

          providerData = {
            id: provider,
            apiKey: providerApiKey,
            modelName: modelToRun.providers[provider].modelName,
            additionalData: modelToRun.providers[provider].additionalData,
          }
          break
        }
      }

      if (!providerData) {
        return NextResponse.json(
          {
            message: "Failed to find a provider with an API key",
          },
          { status: 400 }
        )
      }
    }
  }

  let chat = await db.query.chat.findFirst({
    where: (chat, { eq }) => eq(chat.id, requestBody.id),
  })

  if (chat && chat.userId !== session.user.id) {
    return NextResponse.json(
      {
        message: "Chat not found",
      },
      { status: 404 }
    )
  }

  if (!chat) {
    const title = await generateTitleFromUserMessage({
      message: requestBody.message,
      apiKeys: keys,
    })
    ;[chat] = await db
      .insert(chatTable)
      .values({
        id: requestBody.id,
        userId: session.user.id,
        messages: [],
        title,
      })
      .returning()
  }

  let messages: Message[]

  if (!requestBody.retryMessageId) {
    messages = appendClientMessage({
      messages: chat.messages,
      message: requestBody.message,
    })
  } else {
    let retryMessageIndex = chat.messages.findIndex(
      (message) => message.id === requestBody.retryMessageId
    )
    if (retryMessageIndex === -1) {
      return NextResponse.json(
        {
          message: "Retry message not found",
        },
        { status: 404 }
      )
    }

    const retryMessage = chat.messages[retryMessageIndex]
    if (retryMessage.role !== "assistant") {
      retryMessageIndex++
    }

    messages = chat.messages.slice(0, retryMessageIndex)
  }

  if (requestBody.message.id === messages.at(-1)?.id) {
    messages = messages.slice(0, -1)
    messages = appendClientMessage({
      messages,
      message: requestBody.message,
    })
  }

  await saveMessages(chat.id, messages, {
    state: "loading",
    visibility: requestBody.visibilityType,
  })

  let model: LanguageModel | undefined

  if (isOpenRouter) {
    const openRouter = createOpenRouter({ apiKey: providerData.apiKey })
    model = openRouter.chat(providerData.modelName, {
      reasoning: requestBody.selectedChatModel.options.effort
        ? { effort: requestBody.selectedChatModel.options.effort }
        : undefined,
    })
  } else {
    try {
      model = createModel(modelToRun, providerData.id, providerData.apiKey, {
        ...providerData.additionalData,
        effort: requestBody.selectedChatModel.options.effort,
      })
    } catch (e) {
      return NextResponse.json(
        {
          message: "Failed to create a model",
        },
        { status: 500 }
      )
    }
  }

  if (!model) {
    return NextResponse.json(
      {
        message: "Failed to create a model",
      },
      { status: 500 }
    )
  }

  let tools: Record<string, Tool> = {
    generateImage: tool({
      description: "Generate an image",
      parameters: z.object({
        prompt: z.string().describe("The prompt to generate the image from"),
      }),
      execute: async ({ prompt }) => {
        try {
          if (!("openai" in keys) || keys.openai.length === 0) {
            return {
              message: "API key for OpenAI not found",
            }
          }
          const openai = createOpenAI({
            apiKey: keys.openai,
          })
          const { image } = await experimental_generateImage({
            model: openai.image("dall-e-3"),
            prompt,
          })

          const blob = await put(
            crypto.randomUUID() + ".png",
            new Blob([image.uint8Array], { type: "image/png" }),
            {
              access: "public",
              addRandomSuffix: true,
            }
          )
          // in production, save this image to blob storage and return a URL
          return { image: blob.url, prompt }
        } catch (e) {
          if (e instanceof APICallError) {
            return {
              error: e.message,
            }
          }
          return {
            error: "Something happened",
          }
        }
      },
    }),
  }

  if (requestBody.useWebSearch) {
    tools.webSearch = webSearch
  }

  const providerTitle = PROVIDERS.find(
    (provider) => provider.id === providerData.id
  )?.title

  const modelTitle = isOpenRouter
    ? requestBody.selectedChatModel.modelId.slice(11)
    : modelToRun.title

  let PROMPT = `I am mrkrbt.chat, an AI assistant powered by the ${modelTitle} model. My role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model I am using, I may mention that I use the ${modelTitle} model running on ${providerTitle} provider. If I am not asked specifically about the model I am using, I do not need to mention it.
- Always use LaTeX for mathematical expressions:
  - Math must be wrapped in double dollar signs: $$ content $$
  - Always put things like \\boxed also in double dollar signs
  - Never use single dollar signs for math
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- Ensure code is properly formatted using Prettier with a print width of 80 characters
- Present code in Markdown code blocks with the correct language extension indicated`

  const additionalInfo = session.user.additionalInfo
  if (additionalInfo) {
    PROMPT += `\n- Additional context:\n${additionalInfo}`
  }

  let googleProviderOptions: GoogleGenerativeAIProviderOptions = {}

  if (providerData.id === "google") {
    if (
      providerData.additionalData &&
      "thinking" in providerData.additionalData &&
      providerData.additionalData.thinking === true
    ) {
      if (requestBody.selectedChatModel.options.effort) {
        let thinkingBudget = 1024
        if (requestBody.selectedChatModel.options.effort === "high") {
          thinkingBudget = 16384
        } else if (requestBody.selectedChatModel.options.effort === "medium") {
          thinkingBudget = 8192
        } else if (requestBody.selectedChatModel.options.effort === "low") {
          thinkingBudget = 1024
        }

        googleProviderOptions = {
          thinkingConfig: {
            thinkingBudget,
            includeThoughts: true,
          },
        }
      }
    }
  }

  try {
    const result = streamText({
      model,
      system: PROMPT,
      messages,
      tools: !isOpenRouter && modelToRun.supportsTools ? tools : undefined,
      maxSteps: 2,
      providerOptions: {
        // openrouter: {
        //   effort: requestBody.selectedChatModel.options.effort,
        // },
        // openai: {
        //   effort: requestBody.selectedChatModel.options.effort,
        // },
        google: {
          ...googleProviderOptions,
        },
      },
      experimental_transform: smoothStream({ chunking: "word" }),
      experimental_generateMessageId: () => crypto.randomUUID(),
      // providerOptions: {
      // },
      onFinish: async ({ response }) => {
        if (session.user?.id) {
          try {
            const assistantId = getTrailingMessageId({
              messages: response.messages.filter(
                (message) => message.role === "assistant"
              ),
            })

            if (!assistantId) {
              throw new Error("No assistant message found!")
            }

            const [, assistantMessage] = appendResponseMessages({
              messages: [requestBody.message],
              responseMessages: response.messages,
            })

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
                  modelData: {
                    ...requestBody.selectedChatModel,
                  },
                },
              ],
              { state: "complete" }
            )
          } catch (e) {
            console.error("Failed to save chat")
            throw e
          }
        }
      },
      onError: async ({ error }) => {
        await db
          .update(chatTable)
          .set({
            state: "complete",
          })
          .where(eq(chatTable.id, chat.id))
      },
    })

    result.consumeStream()

    await db
      .update(account)
      .set({
        messagesSent: currentAccount.messagesSent + 1,
      })
      .where(eq(account.id, currentAccount.id))

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (err) => {
        console.error(err)
        return "Failed to get response. Please try again later."
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        message: "Encountered an error while getting the response",
      },
      { status: 500 }
    )
  }
}
