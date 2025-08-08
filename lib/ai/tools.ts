import { createOpenAI } from "@ai-sdk/openai"
import { put } from "@vercel/blob"
import { APICallError, experimental_generateImage, tool, ToolSet } from "ai"
import z from "zod"
import { APIKeys } from "@/lib/db/db-types"
import { webSearch } from "../web-search"

export const getTools: (keys: APIKeys, searchEnabled: boolean) => ToolSet = (
  keys,
  searchEnabled
) => ({
  generateImage: tool({
    description: "Generate an image",
    inputSchema: z.object({
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
          new Blob([image.uint8Array as BlobPart], { type: "image/png" }),
          {
            access: "public",
            addRandomSuffix: true,
          }
        )

        return { image: blob.url }
      } catch (e) {
        if (e instanceof APICallError) {
          return {
            error: e.message,
          }
        }
        return {
          error: "Unknown error",
        }
      }
    },
  }),
  ...(searchEnabled ? { webSearch } : undefined),
})
