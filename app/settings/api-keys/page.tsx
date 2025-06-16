import { cookies } from "next/headers";
import KeysForm from "./keys-form";
import { DEFAULT_API_KEYS_COOKIE } from "@/lib/models";
import ExportKeysDialog from "./export-keys";
import * as crypto from "crypto";
import ImportKeysDialog from "./import-keys";
import { encryptData } from "./encryption";

export default async function Page() {
  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "");
  } catch {
    apiKeys = DEFAULT_API_KEYS_COOKIE;
    // cookiesInfo.set("apiKeys", JSON.stringify(apiKeys));
  }
  const data = JSON.stringify(apiKeys, null, 2);
  const {encrypted, secret} = await encryptData(data);

  return (
    <div>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="mb-4">Manage your API keys here.</p>
        </div>
        <div className="flex gap-2">
          <ExportKeysDialog apiKeysEncoded={encrypted} secret={secret} />
          <ImportKeysDialog />
        </div>
      </div>
      <KeysForm apiKeys={apiKeys} />
    </div>
  );
}
