"use client";

import { branchOffChat } from "@/lib/actions";
import { ChatRequestOptions, Message } from "ai";
import {
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  RefreshCw,
  SplitIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function MessageButtons({
  message,
  setMessages,
  reload,
  chatId,
}: {
  message: Message;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  chatId: string;
}) {
  const [copied, setCopied] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const router = useRouter();

  const retryMessage = async () => {
    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      return messages.slice(0, index);
    });
    await reload();
  };

  const branchOff = async () => {
    setBranchLoading(true);
    const res = await branchOffChat(chatId, message.id);
    if ("error" in res) {
      toast.error("Error branching off" + res.error);
      setBranchLoading(false);
    } else {
      router.push(`/chat/${res.chatId}`);
    }
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
      {message.role === "assistant" && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                disabled={branchLoading}
                onClick={() => branchOff()}
              >
                {branchLoading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SplitIcon />
                )}
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
        </>
      )}
    </div>
  );
}
