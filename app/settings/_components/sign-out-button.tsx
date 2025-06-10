"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/auth") },
    });
  };

  return (
    <Button variant="ghost" disabled={loading} onClick={signOut}>
      {loading && <Loader2Icon className="animate-spin" />}Sign out
    </Button>
  );
}
