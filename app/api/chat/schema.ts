import { MODELS } from "@/lib/models";
import { z } from "zod";

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(["text"]),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(textPartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.string(),
        }),
      )
      .optional(),
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
