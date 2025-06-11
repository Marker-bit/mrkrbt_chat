import Gemini from "@/components/icons/gemini";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Qwen from "@/components/icons/qwen";
import DeepSeek from "@/components/icons/deepseek";
import { Brain, Eye, FileText, Globe, Settings2, ZapIcon } from "lucide-react";

type Model = {
  id: string;
  title: string;
  model: string;
  version: string;
  additionalTitle?: string;
  features: string[];
  providers: Record<string, string>;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const PROVIDERS: {
  id: string;
  title: string;
  apiKeyDescription?: string;
}[] = [
  {
    title: "OpenRouter",
    id: "openrouter",
  },
  {
    title: "Google Generative AI",
    id: "google",
  },
  {
    title: "OpenAI",
    id: "openai",
    apiKeyDescription: "Required for generating images with other models",
  },
];

export const DEFAULT_API_KEYS_COOKIE = PROVIDERS.reduce(
  (acc, provider) => ({ ...acc, [provider.id]: "" }),
  {}
);

export const FEATURES: {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  displayInModels: boolean;
  color: string;
  name: string;
  description?: string;
}[] = [
  {
    id: "fast",
    icon: ZapIcon,
    displayInModels: false,
    color: "#fcd34d",
    name: "Fast",
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
  },
];

export const MODELS: Model[] = [
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5 Flash",
    model: "Gemini",
    version: "2.5 Flash",
    features: ["vision", "pdfs"],
    providers: {
      google: "models/gemini-2.5-flash-preview-05-20",
      openrouter: "google/gemini-2.5-flash-preview-05-20",
    },
    icon: Gemini,
  },
  {
    id: "gemini-2.5-flash-thinking",
    title: "Gemini 2.5 Flash",
    model: "Gemini",
    version: "2.5 Flash",
    additionalTitle: "Thinking",
    features: ["vision", "pdfs", "reasoning"],
    providers: {
      openrouter: "google/gemini-2.5-flash-preview-05-20:thinking",
    },
    icon: Gemini,
  },
  {
    id: "gemini-2.5-pro",
    title: "Gemini 2.5 Pro",
    model: "Gemini",
    version: "2.5 Pro",
    features: ["vision", "pdfs", "reasoning", "effort-control"],
    providers: {
      openrouter: "google/gemini-2.5-pro-preview-05-06",
    },
    icon: Gemini,
  },
  {
    id: "deepseek-r1-0528",
    title: "DeepSeek R1",
    model: "DeepSeek",
    version: "R1",
    additionalTitle: "0528",
    features: ["reasoning"],
    providers: {
      openrouter: "deepseek/deepseek-r1-0528",
    },
    icon: DeepSeek,
  },
  {
    id: "deepseek-r1-qwen",
    title: "DeepSeek R1",
    model: "DeepSeek",
    version: "R1",
    additionalTitle: "Qwen Distilled",
    features: ["reasoning"],
    providers: {
      openrouter: "deepseek/deepseek-r1-distill-qwen-7b",
    },
    icon: DeepSeek,
  },
  {
    id: "qwen3",
    title: "Qwen 3",
    model: "Qwen",
    version: "3",
    features: ["reasoning"],
    providers: {
      openrouter: "qwen/qwen3-32b",
    },
    icon: Qwen,
  },
];

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
