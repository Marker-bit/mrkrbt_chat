import type { Chat } from "@/lib/db/db-types";
import { cn } from "@/lib/utils";
import {
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { format } from "date-fns";
import { MODELS } from "@/lib/models";

const PureChatItem = ({
  chat,
  isActive,
  onPin,
  onDelete,
  setOpenMobile,
  setTitle,
}: {
  chat: Chat;
  isActive: boolean;
  onPin: (isPinned: boolean) => void;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
  setTitle: (chatId: string, title: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setLocalTitle] = useState(chat.title);

  const submit = () => {
    setEditing(false);
    setTitle(chat.id, title);
  };

  const exportChat = () => {
    const createdAt = format(chat.createdAt, "dd-MM-yyyy, HH:mm:ss");
    const updatedAt = format(chat.updatedAt, "dd-MM-yyyy, HH:mm:ss");
    let markdown = `# ${chat.title}
Created: ${createdAt}
Last updated: ${updatedAt}
---
`;
    for (const message of chat.messages) {
      const model = message.modelData?.modelId
        ? MODELS.find((model) => model.id === message.modelData!.modelId)
        : null;
      const roleInfo =
        message.role === "user" ? "User" : "Assistant (" + model?.title + ")";
      markdown += `\n### ${roleInfo}\n\n${message.content}\n\n\n---\n`;
    }
    const link = document.createElement("a");
    link.download = `${chat.title}.md`;
    link.href = "data:text/markdown;charset=utf-8," + encodeURIComponent(markdown);
    link.click();
  };

  return (
    <SidebarMenuItem>
      {editing ? (
        <form
          className="p-2"
          onSubmit={(evt) => {
            evt.preventDefault();
            submit();
          }}
        >
          <input
            className="outline-none w-full"
            onBlur={() => setEditing(false)}
            autoFocus
            value={title}
            onChange={(evt) => setLocalTitle(evt.target.value)}
          />
        </form>
      ) : (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                href={`/chat/${chat.id}`}
                onClick={() => setOpenMobile(false)}
              >
                {chat.isPinned && (
                  <PinIcon fill="currentColor" className="size-4" />
                )}
                <span>{chat.title}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>

          <TooltipContent>{chat.title}</TooltipContent>
        </Tooltip>
      )}

      {!editing && (
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
              showOnHover={!isActive}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem
              onSelect={() => {
                setEditing(true);
              }}
            >
              <PencilIcon />
              <span>Edit</span>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => exportChat()}>
              <DownloadIcon />
              <span>Export</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onPin(chat.isPinned)}>
              {chat.isPinned ? (
                <>
                  <PinOffIcon />
                  <span>Unpin chat</span>
                </>
              ) : (
                <>
                  <PinIcon />
                  <span>Pin chat</span>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/15 focus:dark:bg-destructive focus:text-destructive dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon className="dark:text-red-500" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.chat.isPinned !== nextProps.chat.isPinned) return false;
  if (prevProps.chat.title !== nextProps.chat.title) return false;
  return true;
});
