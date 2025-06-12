import DeepSeek from "@/components/icons/deepseek";
import Gemini from "@/components/icons/gemini";
import MistralAI from "@/components/icons/mistral";
import OpenAI from "@/components/icons/openai";
import Qwen from "@/components/icons/qwen";
import { Model } from "./models";

export const models: Model[] = [
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
      google: {
        modelName: "models/gemini-2.5-pro-preview-06-05",
        features: ["vision", "pdfs", "reasoning", "effort-control"],
      },
      openrouter: {
        modelName: "google/gemini-2.5-pro-preview-06-05",
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
  {
    id: "chatgpt-4.1",
    title: "GPT 4.1 Nano",
    model: "GPT",
    version: "4.1 Nano",
    providers: {
      openrouter: { modelName: "qwen/qwen3-32b", features: ["reasoning"] },
      openai: {
        modelName: "gpt-4.1-nano-2025-04-14",
        features: ["reasoning", "pdfs", "vision"],
      },
    },
    icon: OpenAI,
    supportsTools: true,
  },
  {
    id: "magistral-medium",
    title: "Magistral Small",
    model: "Magistral",
    version: "Small",
    providers: {
      openrouter: {
        modelName: "mistralai/magistral-medium-2506",
        features: ["reasoning"],
      },
      mistral: {
        modelName: "magistral-medium-2506",
        features: ["reasoning"],
      },
    },
    icon: MistralAI,
    supportsTools: false,
  },
  {
    id: "mistral-medium",
    title: "Mistral Medium",
    model: "Mistral",
    version: "Medium",
    providers: {
      openrouter: {
        modelName: "mistralai/mistral-medium-2505",
        features: ["vision"],
      },
      mistral: {
        modelName: "mistral-medium-2505",
        features: ["vision"],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "codestral-2501",
    title: "Codestral",
    model: "Codestral",
    version: "",
    additionalTitle: "2501",
    providers: {
      openrouter: {
        modelName: "mistralai/codestral-2501",
        features: [],
      },
      mistral: {
        modelName: "codestral-2501",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "mistral-saba-2502",
    title: "Mistral Saba",
    model: "Mistral",
    version: "Saba",
    providers: {
      openrouter: {
        modelName: "mistralai/mistral-saba-2502",
        features: [],
      },
      mistral: {
        modelName: "mistral-saba-2502",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: false,
  },
  {
    id: "mistral-large-2411",
    title: "Mistral Large",
    model: "Mistral",
    version: "Large",
    additionalTitle: "2411",
    providers: {
      openrouter: {
        modelName: "mistralai/mistral-large-2411",
        features: [],
      },
      mistral: {
        modelName: "mistral-large-2411",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "pixtral-large-2411",
    title: "Pixtral Large",
    model: "Pixtral",
    version: "Large",
    additionalTitle: "2411",
    providers: {
      openrouter: {
        modelName: "mistralai/pixtral-large-2411",
        features: ["vision"],
      },
      mistral: {
        modelName: "pixtral-large-2411",
        features: ["vision"],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "ministral-3b-2410",
    title: "Ministral",
    model: "Ministral",
    version: "",
    additionalTitle: "3B",
    providers: {
      mistral: {
        modelName: "ministral-3b-2410",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "ministral-8b-2410",
    title: "Ministral",
    model: "Ministral",
    version: "",
    additionalTitle: "8B",
    providers: {
      openrouter: {
        modelName: "mistralai/ministral-8b",
        features: [],
      },
      mistral: {
        modelName: "ministral-8b-2410",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "magistral-small-2506",
    title: "Magistral Small",
    model: "Magistral",
    version: "Small",
    providers: {
      openrouter: {
        modelName: "mistralai/magistral-small-2506",
        features: ["reasoning"],
      },
      mistral: {
        modelName: "magistral-small-2506",
        features: ["reasoning"],
      },
    },
    icon: MistralAI,
    supportsTools: false,
  },
  {
    id: "devstral-small-2506",
    title: "Devstral Small",
    model: "Devstral",
    version: "Small",
    providers: {
      openrouter: {
        modelName: "mistralai/devstral-small-2506",
        features: [],
      },
      mistral: {
        modelName: "devstral-small-2506",
        features: [],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "mistral-small-2503",
    title: "Mistral Small",
    model: "Mistral",
    version: "Small",
    additionalTitle: "2503",
    providers: {
      openrouter: {
        modelName: "mistralai/mistral-small-2503",
        features: ["vision"],
      },
      mistral: {
        modelName: "mistral-small-2503",
        features: ["vision"],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
  {
    id: "pixtral-12b-2409",
    title: "Pixtral",
    model: "Pixtral",
    version: "",
    additionalTitle: "2409",
    providers: {
      openrouter: {
        modelName: "mistralai/pixtral-12b-2409",
        features: ["vision"],
      },
      mistral: {
        modelName: "pixtral-12b-2409",
        features: ["vision"],
      },
    },
    icon: MistralAI,
    supportsTools: true,
  },
];