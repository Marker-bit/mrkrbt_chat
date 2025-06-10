"use server";

import { cookies } from "next/headers";

export async function setApiKeysAsCookie(apiKeys: Record<string, string>): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("apiKeys", JSON.stringify(apiKeys));
}
