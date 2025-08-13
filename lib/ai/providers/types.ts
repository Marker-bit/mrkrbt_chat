import { FeatureId } from "@/lib/models"
import { LanguageModelV2 } from "@openrouter/ai-sdk-provider"
import { PROVIDERS } from "@/lib/ai/providers/providers"

export interface Provider {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  apiKeyDescription?: string
  apiKeyLink?: string
}

export interface ModelProvider<
  PARAMETERS,
  DATA extends Record<string, unknown>
> {
  id: string
  providerData: DATA
  features: FeatureId[]
  createModel: (data: DATA, parameters: PARAMETERS) => LanguageModelV2
  parametersForm: React.ComponentType<{ data: DATA }>
}

export type ProviderId = (typeof PROVIDERS)[number]["id"]
