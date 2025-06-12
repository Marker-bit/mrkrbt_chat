import { cookies } from "next/headers";
import KeysForm from "./keys-form";
import { DEFAULT_API_KEYS_COOKIE } from "@/lib/models";

export default async function Page() {
  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "");
  } catch {
    apiKeys = DEFAULT_API_KEYS_COOKIE;
    // cookiesInfo.set("apiKeys", JSON.stringify(apiKeys));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">API Keys</h1>
      <p className="mb-4">Manage your API keys here.</p>
      <KeysForm apiKeys={apiKeys} />
    </div>
  );
}