import DeepSeek from "@/components/icons/deepseek"
import Google from "@/components/icons/google"
import Groq from "@/components/icons/groq"
import MistralAI from "@/components/icons/mistral"
import OpenAI from "@/components/icons/openai"
import OpenRouter from "@/components/icons/openrouter"
import { Provider } from "@/lib/ai/providers/types"

export const PROVIDERS = [
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
  {
    title: "Groq",
    id: "groq",
    icon: Groq,
    apiKeyLink: "https://console.groq.com/keys",
  },
] as const satisfies Provider[]
