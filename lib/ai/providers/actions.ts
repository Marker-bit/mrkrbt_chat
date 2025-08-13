import { PROVIDERS } from "@/lib/ai/providers/providers"

export function findProviderById(id: string) {
  return PROVIDERS.find((provider) => provider.id === id)
}

export function generateDefaultApiKeys() {
  return PROVIDERS.reduce(
    (acc, provider) => ({ ...acc, [provider.id]: "" }),
    {}
  )
}
