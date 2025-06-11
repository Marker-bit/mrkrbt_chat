import DeepSeek from "@/components/icons/deepseek";
import Gemini from "@/components/icons/gemini";
import Google from "@/components/icons/google";
import MistralAI from "@/components/icons/mistral";
import OpenAI from "@/components/icons/openai";
import OpenRouter from "@/components/icons/openrouter";
import Qwen from "@/components/icons/qwen";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Brain, Eye, FileText, Settings2, ZapIcon } from "lucide-react";

type Model = {
  id: string;
  title: string;
  model: string;
  version: string;
  additionalTitle?: string;
  providers: Record<string, { modelName: string; features: FeatureId[] }>;
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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: "OpenRouter",
    id: "openrouter",
    icon: OpenRouter,
  },
  {
    title: "Google Generative AI",
    id: "google",
    icon: Google,
  },
  {
    title: "OpenAI",
    id: "openai",
    apiKeyDescription: "Required for generating images with other models",
    icon: OpenAI,
  },
  {
    title: "DeepSeek",
    id: "deepseek",
    icon: DeepSeek,
  },
  {
    title: "Mistral",
    id: "mistral",
    icon: MistralAI,
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

const models: Model[] = [
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5 Flash",
    model: "Gemini",
    version: "2.5 Flash",
    providers: {
      google: {
        modelName: "models/gemini-2.5-flash-preview-05-20",
        features: ["vision", "pdfs"],
      },
      openrouter: {
        modelName: "google/gemini-2.5-flash-preview-05-20",
        features: ["vision", "pdfs"],
      },
    },
    icon: Gemini,
    supportsTools: true,
  },
  {
    id: "gemini-2.5-flash-thinking",
    title: "Gemini 2.5 Flash",
    model: "Gemini",
    version: "2.5 Flash",
    additionalTitle: "Thinking",
    providers: {
      openrouter: {
        modelName: "google/gemini-2.5-flash-preview-05-20:thinking",
        features: ["vision", "pdfs", "reasoning", "effort-control"],
      },
    },
    icon: Gemini,
    supportsTools: true,
  },
  {
    id: "gemini-2.5-pro",
    title: "Gemini 2.5 Pro",
    model: "Gemini",
    version: "2.5 Pro",
    providers: {
      openrouter: {
        modelName: "google/gemini-2.5-pro-preview-05-06",
        features: ["vision", "pdfs", "reasoning", "effort-control"],
      },
    },
    icon: Gemini,
    supportsTools: true,
  },
  {
    id: "deepseek-r1-0528",
    title: "DeepSeek R1",
    model: "DeepSeek",
    version: "R1",
    additionalTitle: "0528",
    providers: {
      openrouter: {
        modelName: "deepseek/deepseek-r1-0528",
        features: ["reasoning"],
      },
    },
    icon: DeepSeek,
    supportsTools: true,
  },
  {
    id: "deepseek-r1-qwen",
    title: "DeepSeek R1",
    model: "DeepSeek",
    version: "R1",
    additionalTitle: "Qwen Distilled",
    providers: {
      openrouter: {
        modelName: "deepseek/deepseek-r1-distill-qwen-7b",
        features: ["reasoning"],
      },
    },
    icon: DeepSeek,
    supportsTools: false,
  },
  {
    id: "qwen3",
    title: "Qwen 3",
    model: "Qwen",
    version: "3",
    providers: {
      openrouter: { modelName: "qwen/qwen3-32b", features: ["reasoning"] },
    },
    icon: Qwen,
    supportsTools: true,
  },
];

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

export function createProvider(providerId: string, apiKey: string) {
  switch (providerId) {
    case "openrouter":
      return createOpenRouter({ apiKey });

    case "google":
      return createGoogleGenerativeAI({ apiKey });

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
