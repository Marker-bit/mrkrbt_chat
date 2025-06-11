"use client";

import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { CheckIcon, CopyIcon, ShareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";

export default function VisibilitySelector({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: "public" | "private";
}) {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType,
  });
  const [isClient, setIsClient] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;
  
  const shareUrl = window.location.origin + "/chat/" + chatId;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <ShareIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Switch
            id="public-switch"
            checked={visibilityType === "public"}
            onCheckedChange={(checked) =>
              setVisibilityType(checked ? "public" : "private")
            }
          />
          <Label htmlFor="public-switch">Public</Label>
        </div>
        <div
          className="flex gap-2 items-center data-[public=false]:hidden"
          data-public={visibilityType === "public"}
        >
          <Input readOnly value={shareUrl} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              if (copied) return;
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
