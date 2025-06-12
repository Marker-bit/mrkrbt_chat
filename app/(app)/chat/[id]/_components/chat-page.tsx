"use client";

import Chat from "@/components/chat";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import VisibilitySelector from "@/components/visibility-selector";
import { Chat as ChatType } from "@/lib/db/db-types";
import { ModelData } from "@/lib/models";
import { PlusIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";

export default function ChatPage({
  id,
  chat,
  selectedModelData,
  apiKeys,
  initialVisibilityType,
  readOnly,
}: {
  id: string;
  chat: ChatType;
  selectedModelData: ModelData;
  apiKeys: Record<string, string>;
  initialVisibilityType: "public" | "private";
  readOnly: boolean;
}) {
  const { open } = useSidebar();
  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: "calc(100svh + env(safe-area-inset-top))" }}
    >
      <div className="absolute top-4 left-4 p-1 flex gap-1 border bg-background rounded-md">
        <SidebarTrigger />
        {!open && (
          <Button variant="ghost" size="icon" className="size-7">
            <PlusIcon />
          </Button>
        )}
        {!readOnly && (
          <VisibilitySelector
            chatId={id}
            initialVisibilityType={initialVisibilityType}
          />
        )}
      </div>
      <div className="absolute top-4 right-4 p-1 flex gap-1 border bg-background rounded-md">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="size-7" asChild>
          <Link href="/settings">
            <Settings2Icon />
          </Link>
        </Button>
      </div>
      <Chat
        selectedModelData={selectedModelData}
        id={id}
        initialMessages={chat.messages}
        apiKeys={apiKeys}
        state={chat.state}
        readOnly={readOnly}
      />
    </div>
  );
}
