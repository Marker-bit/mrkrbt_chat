"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { PlusIcon, Settings2Icon } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "../../../components/mode-toggle"
import Chat from "../../../components/chat"
import VisibilitySelector from "@/components/visibility-selector"
import { ColorToggle } from "@/components/color-toggle"

export default function MainPage({
  apiKeys,
}: {
  apiKeys: Record<string, string>
}) {
  const chatId = crypto.randomUUID()
  const { open } = useSidebar()
  return (
    <div className="flex flex-col h-full">
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
        <ColorToggle />
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
        id={chatId}
        isMain
      />
    </div>
  )
}
