import Gemini from "@/components/icons/gemini";
import {
  createOpenRouter
} from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import Qwen from "@/components/icons/qwen";
import DeepSeek from "@/components/icons/deepseek";

type Feature = "image" | "search" | "attachments" | "reasoning";

type Model = {
  id: string;
  title: string;
  model: string;
  version: string;
  additionalTitle?: string;
  features: Feature[];
  providers: Record<string, string>;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const PROVIDERS = [
  {
    title: "OpenRouter",
    id: "openrouter",
  },
  {
    title: "Google Generative AI",
    id: "google",
  },
];

export const DEFAULT_API_KEYS_COOKIE = PROVIDERS.reduce(
  (acc, provider) => ({ ...acc, [provider.id]: "" }),
  {}
);

export const MODELS: Model[] = [
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5 Flash",
    model: "Gemini",
    version: "2.5 Flash",
    features: ["image", "search", "attachments"],
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
    features: ["image", "search", "attachments"],
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
    features: ["image", "search", "attachments", "reasoning"],
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
  google: "models/gemini-2.0-flash-lite"
}

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
