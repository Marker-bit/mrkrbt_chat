"use client";

import GitHub from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

export default function GitHubButton() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "github",
    });
  };

  return (
    <Button className="text-xl font-semibold h-14 my-4" disabled={loading} onClick={signIn}>
      {loading ? (
        <Loader2Icon className="animate-spin size-6" />
      ) : (
        <GitHub className="size-6" />
      )}
      Continue with GitHub
    </Button>
  );
}
