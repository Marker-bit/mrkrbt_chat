import { cookies } from "next/headers";
import { ModelData, parseModelData } from "./models";
import { APIKeys } from "./db/db-types";
import { generateDefaultApiKeys } from "@/lib/ai/providers/actions";

export async function getAPIKeys(): Promise<APIKeys> {
  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "");
  } catch {
    apiKeys = generateDefaultApiKeys();
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