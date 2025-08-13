import { ProviderId } from "@/lib/ai/providers/types"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { createMistral } from "@ai-sdk/mistral"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { LanguageModel } from "ai"
import {
  Brain,
  Eye,
  FileText,
  GiftIcon,
  Settings2,
  ZapIcon,
} from "lucide-react"
import { models } from "./models-list"

export type Model = {
  id: string
  title: string
  model: string
  version: string
  additionalTitle?: string
  providers: Partial<Record<
    ProviderId,
    {
      modelName: string
      features: FeatureId[]
      additionalData?: Record<string, unknown>
    }
  >>
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  supportsTools: boolean
  tags?: {
    new?: boolean
  }
}

export type ModelData = {
  modelId: string
  options: {
    effort: "high" | "medium" | "low"
    provider?: string
  }
}

export const FEATURES = [
  {
    id: "fast",
    icon: ZapIcon,
    displayInModels: false,
    color: "#fcd34d",
    name: "Fast",
    description: "Has fast response times",
  },
  {
    id: "vision",
    icon: Eye,
    displayInModels: true,
    color: "#14b8a6",
    name: "Vision",
    description: "Supports image uploads and analysis",
  },
  {
    id: "pdfs",
    icon: FileText,
    displayInModels: true,
    color: "#6366f1",
    name: "PDFs",
    description: "Supports PDF uploads and analysis",
  },
  {
    id: "reasoning",
    icon: Brain,
    displayInModels: true,
    color: "#a855f7",
    name: "Reasoning",
    description: "Has reasoning capabilities",
  },
  {
    id: "effort-control",
    icon: Settings2,
    displayInModels: false,
    color: "#d946ef",
    name: "Effort Control",
    description: "Has effort control capabilities",
  },
  {
    id: "free",
    icon: GiftIcon,
    displayInModels: true,
    color: "#0ea5e9",
    name: "Free",
    description: "Free to use (only OpenRouter)",
  },
] as const

export type FeatureId = (typeof FEATURES)[number]["id"]

const extractModelFeatures = (model: Model) => {
  let features: FeatureId[] = []
  for (const provider in model.providers) {
    for (const feature of model.providers[provider as ProviderId]!.features) {
      if (!features.includes(feature)) {
        features.push(feature)
      }
    }
  }
  return features
}

export const MODELS = models.map((model) => ({
  ...model,
  features: extractModelFeatures(model),
}))

export const TITLEGEN_MODELS: string[] = ["gemini-2.0-flash-lite"]

export function createModel(
  model: Model,
  providerId: ProviderId,
  apiKey: string,
  additionalData: Record<string, unknown>
): LanguageModel | undefined {
  if (
    additionalData.effort &&
    (!(typeof additionalData.effort === "string") ||
      !["high", "medium", "low"].includes(additionalData.effort))
  ) {
    throw new Error("Invalid effort")
  }

  const provider = model.providers[providerId]!

  const modelId = provider.modelName

  switch (providerId) {
    case "openrouter":
      const openRouter = createOpenRouter({ apiKey })
      return openRouter.chat(modelId, {
        reasoning: additionalData.effort
          ? { effort: additionalData.effort as "high" | "medium" | "low" }
          : undefined,
      })

    case "google":
      const google = createGoogleGenerativeAI({ apiKey })
      return google.chat(modelId)

    case "openai":
      const openAI = createOpenAI({ apiKey })
      return openAI.chat(
        modelId
        // (additionalData.effort && provider.features.includes("reasoning"))
        //   ? {
        //       reasoningEffort: additionalData.effort as
        //         | "high"
        //         | "medium"
        //         | "low",
        //     }
        //   : undefined
      )

    case "mistral":
      const mistral = createMistral({ apiKey })
      return mistral.chat(modelId)

    case "deepseek":
      const deepseek = createDeepSeek({ apiKey })
      return deepseek.chat(modelId)

    case "groq":
      const groq = createGroq({ apiKey })
      return groq(modelId)

    default:
      break
  }
}

export const DEFAULT_MODEL_DATA: ModelData = {
  modelId: "gemini-2.5-flash",
  options: { effort: "medium", provider: "openrouter" },
}

export function parseModelData(modelData: string) {
  try {
    return JSON.parse(modelData)
  } catch {
    return DEFAULT_MODEL_DATA
  }
}

export function effortToString(effort: "high" | "medium" | "low") {
  switch (effort) {
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return "Medium"
  }
}

export function getGoogleThinkingBudget(effort: "high" | "medium" | "low") {
  switch (effort) {
    case "high":
      return 16384
    case "medium":
      return 8192
    case "low":
      return 1024
    default:
      return 1024
  }
}
