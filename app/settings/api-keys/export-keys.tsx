import CopyText from "@/components/copy-text";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DownloadIcon } from "lucide-react";
import React from "react";

export default function ExportKeysDialog({
  apiKeysEncoded,
  secret,
  className,
}: {
  apiKeysEncoded: string;
  secret: string;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <DownloadIcon />
          <span className="max-sm:hidden">Export keys</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export keys</DialogTitle>
          <DialogDescription>
            Copy the secret and the info encoded in SHA256 below and import them on another device
            or in another browser.
          </DialogDescription>
        </DialogHeader>
        <CopyText value={apiKeysEncoded} label="Data" />
        <CopyText value={secret} label="Secret" />
      </DialogContent>
    </Dialog>
  );
}
