"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKeysAsCookie } from "@/lib/actions";
import { PROVIDERS } from "@/lib/models";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useState } from "react";

export default function KeysForm({
  apiKeys,
}: {
  apiKeys: Record<string, string>;
}) {
  const [apiKeysOptimistic, setApiKeys] = useState(apiKeys);

  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    await setApiKeysAsCookie(apiKeysOptimistic);
    setLoading(false);
  };

  return (
    <form
      className="flex flex-col gap-4 items-start"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {PROVIDERS.map((provider) => (
        <div key={provider.id} className="flex flex-col w-full gap-2">
          <Label htmlFor={provider.id + "-key"}>{provider.title} API Key</Label>
          <Input
            id={provider.id + "-key"}
            type="password"
            value={apiKeysOptimistic[provider.id]}
            onChange={(e) =>
              setApiKeys((a) => ({ ...a, [provider.id]: e.target.value }))
            }
          />
          {provider?.apiKeyDescription && (
            <div className="text-muted-foreground/80 text-xs">
              {provider.apiKeyDescription}
            </div>
          )}
        </div>
      ))}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}Save
      </Button>
    </form>
  );
}
