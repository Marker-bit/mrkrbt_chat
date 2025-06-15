import { cookies } from "next/headers";
import { DEFAULT_API_KEYS_COOKIE, ModelData, parseModelData } from "./models";

export async function getAPIKeys(): Promise<Record<string, string>> {
  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "");
  } catch {
    apiKeys = DEFAULT_API_KEYS_COOKIE;
  }
  return apiKeys;
}


export async function getModelData(): Promise<ModelData> {
  const cookiesInfo = await cookies();
  const modelData = parseModelData(
    cookiesInfo.get("selectedModelData")?.value || ""
  );
  return modelData;
}