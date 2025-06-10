"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "../../components/mode-toggle";
import Chat from "../../components/chat";

export default function MainPage({selectedModelId}: {selectedModelId: string}) {
  return (
    <div
      className="flex flex-col h-svh"
      style={{ minHeight: "calc(100svh + env(safe-area-inset-top))" }}
    >
      <div className="absolute top-4 left-4 p-1 flex gap-1 border bg-background rounded-md">
        <SidebarTrigger />
      </div>
      <div className="absolute top-4 right-4 p-1 flex gap-1 border bg-background rounded-md">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="size-7" asChild>
          <Link href="/settings">
            <Settings2Icon />
          </Link>
        </Button>
      </div>
      <Chat selectedModelId={selectedModelId} id={crypto.randomUUID()} isMain />
    </div>
  );
}
