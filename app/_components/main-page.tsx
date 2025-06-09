"use client";

import React, { useMemo, useRef, useState } from "react";
import WelcomeScreen from "./welcome-screen";
import MessageInput from "./message-input";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";

export default function MainPage() {
  const [value, setValue] = useState("");
  const [height, setHeight] = useState(0);
  const empty = useMemo(() => value === "", [value]);
  const ref = useRef<AutosizeTextAreaRef>(null);

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
      <div
        className="flex grow items-center justify-center w-full overflow-scroll"
        style={{ paddingBottom: `${height}px` }}
      >
        <div
          className="data-[empty=false]:scale-95 data-[empty=false]:opacity-0 transition w-full max-w-3xl p-2"
          data-empty={empty}
        >
          <WelcomeScreen
            onSelect={(item) => {
              setValue(item);
              ref.current?.textArea.focus();
            }}
          />
        </div>
      </div>
      <MessageInput
        value={value}
        setValue={setValue}
        ref={ref}
        setHeight={setHeight}
      />
    </div>
  );
}
