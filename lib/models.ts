import Gemini from "@/components/icons/gemini";
import { openrouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider";

type Feature = "image" | "search" | "attachments" | "reasoning";

type Model = {
  id: string;
  title: string;
  additionalTitle?: string;
  features: Feature[];
  providers: Record<string, string>;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const PROVIDERS = [
  {
    title: "OpenRouter",
    id: "openrouter"
  },
  {
    title: "Google Generative AI",
    id: "google"
  }
]

export const DEFAULT_API_KEYS_COOKIE = PROVIDERS.reduce((acc, provider) => ({ ...acc, [provider.id]: "" }), {})

export const MODELS: Model[] = [
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5 Flash",
    features: ["image", "search", "attachments"],
    providers: {
      openrouter: "google/gemini-2.5-flash-preview-05-20",
    },
    icon: Gemini,
  },
  {
    id: "gemini-2.5-flash-thinking",
    title: "Gemini 2.5 Flash",
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
    features: ["image", "search", "attachments", "reasoning"],
    providers: {
      openrouter: "google/gemini-2.5-pro-preview-05-20",
    },
    icon: Gemini,
  },
  {
    id: "deepseek-r1-0528",
    title: "DeepSeek R1",
    additionalTitle: "0528",
    features: ["reasoning"],
    providers: {
      openrouter: "deepseek/r1-0528",
    },
    icon: Gemini,
  },
  {
    id: "deepseek-r1-qwen",
    title: "DeepSeek R1",
    additionalTitle: "Qwen Distilled",
    features: ["reasoning"],
    providers: {
      openrouter: "deepseek/deepseek-r1-distill-qwen-7b",
    },
    icon: Gemini,
  },
  {
    id: "qwen3",
    title: "Qwen 3",
    features: ["reasoning"],
    providers: {
      openrouter: "qwen/qwen3-32b",
    },
    icon: Gemini,
  },
];