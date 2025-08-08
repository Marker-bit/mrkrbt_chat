import { MODELS } from "@/lib/models";
import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.literal("file"),
  url: z.string().url(),
  fileName: z.string().optional(),
  mediaType: z.string(),
})

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(z.discriminatedUnion("type", [textPartSchema, filePartSchema])),
  }),
  selectedChatModel: z
    .object({
      modelId: z.string(),
      options: z.object({
        effort: z.enum(["high", "medium", "low"]),
        provider: z.string().optional(),
      })
    }),
  visibilityType: z.enum(['public', 'private']),
  useWebSearch: z.boolean(),
  retryMessageId: z.string().or(z.null()).optional(),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
