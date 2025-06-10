"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKeysAsCookie } from "@/lib/actions";
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
      className="flex flex-col gap-2 items-start"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
      <Input
        id="openrouter-key"
        type="password"
        value={apiKeysOptimistic.openrouter}
        onChange={(e) =>
          setApiKeys((a) => ({ ...a, openrouter: e.target.value }))
        }
      />
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}Save
      </Button>
    </form>
  );
}
