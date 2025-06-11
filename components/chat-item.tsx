import type { Chat } from "@/lib/db/db-types";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { memo } from "react";
import { MoreHorizontalIcon, PinIcon, PinOffIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const PureChatItem = ({
  chat,
  isActive,
  onPin,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onPin: (isPinned: boolean) => void;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  return (
    <SidebarMenuItem>
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
              {/* <span>A</span> */}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>

        <TooltipContent>{chat.title}</TooltipContent>
      </Tooltip>

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
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.chat.isPinned !== nextProps.chat.isPinned) return false;
  return true;
});
