import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useMemo, useRef, useState } from "react";
import MessageInput from "./message-input";
import WelcomeScreen from "./welcome-screen";

export default function Chat({
  isMain = false,
  id,
}: {
  isMain?: boolean;
  id: string;
}) {
  const [height, setHeight] = useState(0);
  const ref = useRef<AutosizeTextAreaRef>(null);
  const { messages, append, input, setInput, status, stop, reload, error } =
    useChat({
      credentials: "include",
    });
  const empty = useMemo(() => input === "", [input]);

  return (
    <>
      {isMain && messages.length === 0 ? (
        <div
          className="flex grow items-center justify-center w-full overflow-auto"
          style={{ paddingBottom: `${height}px` }}
        >
          <div
            className={cn(
              "data-[empty=false]:scale-95 data-[empty=false]:opacity-0 data-[empty=false]:pointer-events-none transition w-full max-w-3xl p-2"
            )}
            data-empty={empty}
          >
            <WelcomeScreen
              onSelect={(item) => {
                setInput(item);
                ref.current?.textArea.focus();
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center grow w-full pt-14 gap-4 overflow-auto">
          <div
            className="flex flex-col w-full max-w-3xl h-fit"
            style={{ paddingBottom: `${height + 10}px` }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "px-4 py-2 prose dark:prose-invert",
                  message.role === "user"
                    ? "self-end bg-secondary rounded-xl"
                    : ""
                )}
              >
                {/* {message.role === "user" ? "User: " : "AI: "} */}
                <MemoizedMarkdown id={id} content={message.content} />
                {/* {message.content} */}
              </div>
            ))}
            {error && (
              <>
                <div>An error occurred.</div>
                <Button type="button" onClick={() => reload()}>
                  Retry
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <MessageInput
        stop={stop}
        status={status}
        value={input}
        reload={reload}
        setValue={(value) => setInput(value)}
        ref={ref}
        setHeight={setHeight}
        onSubmit={(message) => {
          if (messages.length === 0) {
            window.history.replaceState({}, "", `/chat/${id}`);
          }
          if (message.trim() === "" || status !== "ready") return;
          append({ role: "user", content: message.trim() });
        }}
      />
    </>
  );
}
