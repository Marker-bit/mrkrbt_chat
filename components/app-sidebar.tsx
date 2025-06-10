"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatList from "./chat-list";
import SidebarUser from "./sidebar-user";
import { Button } from "./ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-center gap-2">
            <SidebarMenuButton asChild>
              <Link href="/">mrkrbt.chat</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <Button
                className="w-full"
                onClick={() => {
                  router.replace("/");
                  router.refresh();
                }}
              >
                New Chat
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* <SidebarGroupContent>
            <div className="px-2 text-muted-foreground w-full flex flex-row justify-center items-center text-sm gap-2 select-none">
              There are no conversations yet.
            </div>
          </SidebarGroupContent> */}
        <ChatList />
        {/* <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://google.com" className="font-medium">
                  Google
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://google.com" className="font-medium">
                  Google
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://google.com" className="font-medium">
                  Google
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
