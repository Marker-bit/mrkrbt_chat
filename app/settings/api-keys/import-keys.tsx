"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKeysAsCookie } from "@/lib/actions";
import { Loader2Icon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { decryptData } from "./encryption";

export default function ImportKeysDialog({
  className,
}: {
  className?: string;
}) {
  const [data, setData] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleImport = async () => {
    if (!data || !secret) return;

    setLoading(true);

    try {
      const apiKeys = await decryptData(data, secret);
      try {
        await setApiKeysAsCookie(JSON.parse(apiKeys));
        toast.success("API keys imported successfully");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error("Error parsing API keys");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error decrypting API keys");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <UploadIcon />
          <span className="max-sm:hidden">Import keys</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import keys</DialogTitle>
          <DialogDescription>
            Copy the secret and the info below and import them on another device
            or in another browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="text"
              placeholder="Paste data here"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="secret">Secret</Label>
            <Input
              id="secret"
              type="text"
              placeholder="Paste secret here"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-fit"
            onClick={handleImport}
            disabled={loading}
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
