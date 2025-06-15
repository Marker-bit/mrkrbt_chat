import DeepSeek from "@/components/icons/deepseek";
import Google from "@/components/icons/google";
import MistralAI from "@/components/icons/mistral";
import OpenAI from "@/components/icons/openai";
import OpenRouter from "@/components/icons/openrouter";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { LanguageModel } from "ai";
import { Brain, Eye, FileText, Settings2, ZapIcon } from "lucide-react";
import { models } from "./models-list";

export type Model = {
  id: string;
  title: string;
  model: string;
  version: string;
  additionalTitle?: string;
  providers: Record<
    string,
    {
      modelName: string;
      features: FeatureId[];
      additionalData?: Record<string, unknown>;
    }
  >;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  supportsTools: boolean;
};

export type ModelData = {
  modelId: string;
  options: {
    effort: "high" | "medium" | "low";
    provider?: string;
  };
};

export const PROVIDERS: {
  id: string;
  title: string;
  apiKeyDescription?: string;
  apiKeyLink?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "OpenRouter",
    id: "openrouter",
    icon: OpenRouter,
    apiKeyLink: "https://openrouter.ai/settings/keys",
  },
  {
    title: "Google Generative AI",
    id: "google",
    icon: Google,
    apiKeyLink: "https://aistudio.google.com/apikey",
  },
  {
    title: "OpenAI",
    id: "openai",
    apiKeyDescription: "Required for generating images with other models",
    icon: OpenAI,
    apiKeyLink: "https://platform.openai.com/settings/organization/api-keys",
  },
  {
    title: "DeepSeek",
    id: "deepseek",
    icon: DeepSeek,
    apiKeyLink: "https://platform.deepseek.com/api_keys",
  },
  {
    title: "Mistral",
    id: "mistral",
    icon: MistralAI,
    apiKeyLink: "https://console.mistral.ai/api-keys",
  },
];

export const DEFAULT_API_KEYS_COOKIE = PROVIDERS.reduce(
  (acc, provider) => ({ ...acc, [provider.id]: "" }),
  {}
);

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
] as const;

export type FeatureId = (typeof FEATURES)[number]["id"];

const extractModelFeatures = (model: Model) => {
  let features: FeatureId[] = [];
  for (const provider in model.providers) {
    for (const feature of model.providers[provider].features) {
      if (!features.includes(feature)) {
        features.push(feature);
      }
    }
  }
  return features;
};

export const MODELS = models.map((model) => ({
  ...model,
  features: extractModelFeatures(model),
}));

export const PROVIDERS_TITLEGEN_MAP: Record<string, string> = {
  openrouter: "google/gemini-2.0-flash-001",
  google: "models/gemini-2.0-flash-lite",
};

export function createModel(
  modelId: string,
  providerId: string,
  apiKey: string,
  additionalData: Record<string, unknown>
): LanguageModel | undefined {
  if (
    additionalData.effort &&
    (!(typeof additionalData.effort === "string") ||
      !["high", "medium", "low"].includes(additionalData.effort))
  ) {
    throw new Error("Invalid effort");
  }
  switch (providerId) {
    case "openrouter":
      const openRouter = createOpenRouter({ apiKey });
      return openRouter.chat(modelId, {
        reasoning: additionalData.effort
          ? { effort: additionalData.effort as "high" | "medium" | "low" }
          : undefined,
      });

    case "google":
      const google = createGoogleGenerativeAI({ apiKey });
      return google.chat(modelId);

    case "openai":
      const openAI = createOpenAI({ apiKey });
      return openAI.chat(
        modelId,
        additionalData.effort
          ? {
              reasoningEffort: additionalData.effort as
                | "high"
                | "medium"
                | "low",
            }
          : undefined
      );

    case "mistral":
      const mistral = createMistral({ apiKey });
      return mistral.chat(modelId);

    case "deepseek":
      const deepseek = createDeepSeek({ apiKey });
      return deepseek.chat(modelId);

    default:
      break;
  }
}

const DEFAULT_MODEL_DATA: ModelData = {
  modelId: "gemini-2.5-flash",
  options: { effort: "medium", provider: "openrouter" },
};

export function parseModelData(modelData: string) {
  try {
    return JSON.parse(modelData);
  } catch {
    return DEFAULT_MODEL_DATA;
  }
}

export function effortToString(effort: "high" | "medium" | "low") {
  switch (effort) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Medium";
  }
}
