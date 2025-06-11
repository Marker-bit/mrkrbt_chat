"use client";

import React from "react";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";

export default function SidebarUser() {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession();

  if (isPending || !session) {
    return <Skeleton className="h-12 w-full rounded-lg" />;
  }

  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      asChild
    >
      <Link href="/settings">
        <Avatar className="h-8 w-8 rounded-lg">
          {session.user.image && (
            <AvatarImage src={session.user.image} alt={session.user.name} />
          )}
          <AvatarFallback className="rounded-lg">
            {session.user.name}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{session.user.name}</span>
          <span className="truncate text-xs">Pro</span>
        </div>
      </Link>
    </SidebarMenuButton>
  );
}
