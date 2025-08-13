import { cookies } from "next/headers";
import { encryptData } from "./encryption";
import ExportKeysDialog from "./export-keys";
import ImportKeysDialog from "./import-keys";
import KeysForm from "./keys-form";
import { getAPIKeys } from "@/lib/cookie-utils";

export default async function Page() {
  const apiKeys = await getAPIKeys()
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
