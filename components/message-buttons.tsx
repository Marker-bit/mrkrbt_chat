"use client";

import { ChatRequestOptions, Message } from "ai";
import { CheckIcon, CopyIcon, RefreshCw, SplitIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function MessageButtons({
  message,
  setMessages,
  reload
}: {
  message: Message;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
}) {
  const [copied, setCopied] = useState(false);

  const retryMessage = async () => {
    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      return messages.slice(0, index);
    });
    await reload();
  };

  return (
    <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              if (copied) return;
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy message</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost">
            <SplitIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Branch off</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => retryMessage()}
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Retry message</TooltipContent>
      </Tooltip>
    </div>
  );
}
