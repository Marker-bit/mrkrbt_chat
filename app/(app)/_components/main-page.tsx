"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { PlusIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../../../components/mode-toggle";
import Chat from "../../../components/chat";
import VisibilitySelector from "@/components/visibility-selector";
import { ModelData } from "@/lib/models";

export default function MainPage({
  selectedModelData,
  apiKeys,
}: {
  selectedModelData: ModelData;
  apiKeys: Record<string, string>;
}) {
  const chatId = crypto.randomUUID();
  const { open } = useSidebar();
  return (
    <div
      className="flex flex-col h-svh"
      style={{ minHeight: "calc(100svh + env(safe-area-inset-top))" }}
    >
      <div className="absolute top-4 left-4 p-1 flex gap-1 border bg-background rounded-md">
        <SidebarTrigger />
        {!open && (
          <Button variant="ghost" size="icon" className="size-7">
            <PlusIcon />
          </Button>
        )}
        <VisibilitySelector chatId={chatId} initialVisibilityType="private" />
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
        readOnly={false}
        state="complete"
        apiKeys={apiKeys}
        selectedModelData={selectedModelData}
        id={chatId}
        isMain
      />
    </div>
  );
}
