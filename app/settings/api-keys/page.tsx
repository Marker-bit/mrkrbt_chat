import { cookies } from "next/headers";
import KeysForm from "./keys-form";

export default async function Page() {
  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "{}");
  } catch {
    apiKeys = {};
    cookiesInfo.set("apiKeys", JSON.stringify(apiKeys));
  }

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>
      <p className="mb-4">Manage your API keys here.</p>
      <KeysForm apiKeys={apiKeys} />
    </div>
  );
}