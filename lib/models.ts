import Gemini from "@/components/icons/gemini";
import { openrouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider";

type Feature = "image" | "search" | "attachments" | "reasoning";

type Model = {
  id: string;
  title: string;
  additionalTitle?: string;
  features: Feature[];
  providers: {
    id: "openrouter";
    title: string;
    modelName: string;
  }[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const buildOpenRouterProvider = (
  modelName: string
): {
  id: "openrouter";
  title: string;
  modelName: string;
} => {
  return {
    id: "openrouter",
    title: "OpenRouter",
    modelName,
  };
};

export const MODELS: Model[] = [
  {
    id: "gemini-2.5-flash",
    title: "Gemini 2.5 Flash",
    features: ["image", "search", "attachments"],
    providers: [
      buildOpenRouterProvider("google/gemini-2.5-flash-preview-05-20"),
    ],
    icon: Gemini,
  },
  {
    id: "gemini-2.5-flash-thinking",
    title: "Gemini 2.5 Flash",
    additionalTitle: "Thinking",
    features: ["image", "search", "attachments"],
    providers: [
      buildOpenRouterProvider("google/gemini-2.5-flash-preview-05-20:thinking"),
    ],
    icon: Gemini,
  },
  {
    id: "gemini-2.5-pro",
    title: "Gemini 2.5 Pro",
    features: ["image", "search", "attachments", "reasoning"],
    providers: [buildOpenRouterProvider("google/gemini-2.5-pro-preview-05-20")],
    icon: Gemini,
  },
  {
    id: "deepseek-r1-0528",
    title: "DeepSeek R1",
    additionalTitle: "0528",
    features: ["reasoning"],
    providers: [buildOpenRouterProvider("deepseek/r1-0528")],
    icon: Gemini,
  },
];