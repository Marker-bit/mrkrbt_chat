import { generateTitleFromUserMessage } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { APIKeys, Message } from "@/lib/db/db-types"
import { db } from "@/lib/db/drizzle"
import { saveMessages } from "@/lib/db/queries"
import { account, chat as chatTable } from "@/lib/db/schema"
import { createModel, getGoogleThinkingBudget, MODELS } from "@/lib/models"
import { webSearch } from "@/lib/web-search"
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { createOpenAI, OpenAIResponsesProviderOptions } from "@ai-sdk/openai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { put } from "@vercel/blob"
import {
  APICallError,
  convertToModelMessages,
  experimental_generateImage,
  InvalidToolInputError,
  LanguageModel,
  NoSuchToolError,
  smoothStream,
  streamText,
  Tool,
  tool,
} from "ai"
import { eq } from "drizzle-orm"
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import { PostRequestBody, postRequestBodySchema } from "./schema"
import { getAPIKeys } from "@/lib/cookie-utils"
import { getTools } from "@/lib/ai/tools"
import { findProviderById } from "@/lib/ai/providers/actions"
import { ProviderId } from "@/lib/ai/providers/types"

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
  } catch (e: any) {
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

  let keys: APIKeys

  try {
    keys = await getAPIKeys()
  } catch (e) {
    return NextResponse.json(
      {
        message: "Failed to parse API keys",
      },
      { status: 400 }
    )
  }

  let providerData: {
    id: ProviderId
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

    if (!chosenProvider) {
      return NextResponse.json(
        {
          message: "No provider selected",
        },
        { status: 400 }
      )
    }

    if (!Object.keys(modelToRun.providers).includes(chosenProvider)) {
      return NextResponse.json(
        {
          message: "Model doesn't have selected provider",
        },
        { status: 400 }
      )
    }

    if (!(chosenProvider in keys) || keys[chosenProvider].length === 0) {
      return NextResponse.json(
        {
          message: "You don't have an API key for this provider",
        },
        { status: 400 }
      )
    }

    const modelProvider = modelToRun.providers[chosenProvider as ProviderId]
    if (!modelProvider) {
      return NextResponse.json(
        {
          message: "Failed to find provider",
        },
        { status: 400 }
      )
    }
    providerData = {
      id: chosenProvider as ProviderId,
      apiKey: keys[chosenProvider],
      modelName: modelProvider.modelName,
      additionalData: modelProvider.additionalData,
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
    messages = [...chat.messages, requestBody.message]
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

    messages[retryMessageIndex - 1] = requestBody.message
  }

  // if (requestBody.message.id === messages.at(-1)?.id) {
  //   messages = messages.slice(0, -1)
  //   messages = [...messages, requestBody.message]
  // }

  await saveMessages(chat.id, messages, {
    state: "loading",
    visibility: requestBody.visibilityType,
  })

  let model: LanguageModel | undefined

  if (isOpenRouter) {
    const openRouter = createOpenRouter({ apiKey: providerData.apiKey })
    model = openRouter.chat(providerData.modelName, {
      reasoning: requestBody.selectedChatModel.options.effort
        ? {
            enabled: true,
            effort: requestBody.selectedChatModel.options.effort,
          }
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

  const tools = getTools(keys, requestBody.useWebSearch)

  const providerTitle = findProviderById(providerData.id)?.title

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

  if (
    providerData.id === "google" &&
    providerData.additionalData &&
    "thinking" in providerData.additionalData &&
    providerData.additionalData.thinking === true &&
    requestBody.selectedChatModel.options.effort
  ) {
    const thinkingBudget = getGoogleThinkingBudget(
      requestBody.selectedChatModel.options.effort
    )

    googleProviderOptions = {
      thinkingConfig: {
        thinkingBudget,
        includeThoughts: true,
      },
    }
  }

  try {
    const result = streamText({
      model,
      system: PROMPT,
      messages: convertToModelMessages(messages),
      tools: !isOpenRouter && modelToRun.supportsTools ? tools : undefined,
      providerOptions: {
        google: {
          ...googleProviderOptions,
        } as GoogleGenerativeAIProviderOptions,
        openai: {
          reasoningEffort: requestBody.selectedChatModel.options.effort,
        } as OpenAIResponsesProviderOptions,
      },
      experimental_transform: smoothStream({ chunking: "word" }),
      onError: async () => {
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

    return result.toUIMessageStreamResponse<Message>({
      messageMetadata: ({ part }) => {
        let metadata: Record<string, unknown> = {
          model: requestBody.selectedChatModel,
        }
        if (part.type === "start") {
          metadata.createdAt = new Date()
        }
        if (part.type === "reasoning-start") {
          metadata.reasoningStartDate = new Date()
        }
        if (part.type === "reasoning-end") {
          metadata.reasoningEndDate = new Date()
        }
        return metadata as any
      },
      onError: (err) => {
        console.error("onError in toUIMessageStreamResponse", err)
        if (NoSuchToolError.isInstance(err)) {
          return `The model tried to call a unknown tool: ${err.toolName}`
        } else if (InvalidToolInputError.isInstance(err)) {
          return `The model called a tool with invalid input: ${err.toolName}.`
        } else {
          return "Failed to get response. Please try again later."
        }
      },
      onFinish: async ({ responseMessage }) => {
        if (session.user?.id) {
          try {
            await saveMessages(chat.id, [...messages, responseMessage], {
              state: "complete",
            })
          } catch (e) {
            console.error("Failed to save chat")
            throw e
          }
        }
      },
      generateMessageId: () => crypto.randomUUID(),
    })
  } catch (error) {
    console.error(
      "caught error in streamText or toUIMessageStreamResponse",
      error
    )
    return NextResponse.json(
      {
        message: "Encountered an error while getting the response",
      },
      { status: 500 }
    )
  }
}
