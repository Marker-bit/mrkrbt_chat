"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKeysAsCookie } from "@/lib/actions";
import { PROVIDERS } from "@/lib/models";
import { cn } from "@/lib/utils";
import { CircleAlert, Loader2Icon, SaveIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function KeysForm({
  apiKeys,
}: {
  apiKeys: Record<string, string>;
}) {
  const [apiKeysOptimistic, setApiKeys] = useState(apiKeys);
  const params = useSearchParams();
  const requiredProviders = params.getAll("providers");

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
      {requiredProviders.length > 0 && (
        <div className="rounded-md border border-red-500 px-4 py-3 text-red-600 dark:text-red-400 bg-red-500/20">
          <p className="text-sm">
            <CircleAlert
              className="me-3 -mt-0.5 inline-flex"
              size={16}
              aria-hidden="true"
            />
            You need to enter at least one of marked API keys
          </p>
        </div>
      )}
      {PROVIDERS.map((provider) => (
        <div key={provider.id} className="flex flex-col w-full gap-2">
          <Label htmlFor={provider.id + "-key"}>{provider.title} API Key</Label>
          {requiredProviders.includes(provider.id) && (
            <div className="text-red-500 text-xs">Required</div>
          )}
          <Input
            id={provider.id + "-key"}
            type="password"
            value={apiKeysOptimistic[provider.id]}
            onChange={(e) =>
              setApiKeys((a) => ({ ...a, [provider.id]: e.target.value }))
            }
            className={cn(
              requiredProviders.includes(provider.id) && "border-red-500"
            )}
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
