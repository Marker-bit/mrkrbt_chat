"use client";

import React, { useMemo, useRef, useState } from "react";
import WelcomeScreen from "./welcome-screen";
import MessageInput from "./message-input";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";

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
      <div
        className="flex grow items-center justify-center w-full"
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
