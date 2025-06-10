import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Message, useChat } from "@ai-sdk/react";
import { useMemo, useOptimistic, useRef, useState } from "react";
import MessageInput from "./message-input";
import WelcomeScreen from "../app/(app)/_components/welcome-screen";
import { ChatSDKError } from "@/lib/errors";
import { toast } from "sonner";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import ApiKeyDialog from "./api-key-dialog";
import { MODELS } from "@/lib/models";

export default function Chat({
  isMain = false,
  id,
  initialMessages,
  selectedModelId,
  apiKeys,
}: {
  isMain?: boolean;
  id: string;
  initialMessages?: Message[];
  selectedModelId: string;
  apiKeys: Record<string, string>;
}) {
  const [height, setHeight] = useState(0);
  const ref = useRef<AutosizeTextAreaRef>(null);
  const { messages, append, input, setInput, status, stop, reload } = useChat({
    credentials: "include",
    experimental_throttle: 50,
    generateId: () => crypto.randomUUID(),
    initialMessages,
    fetch: fetchWithErrorHandlers,
    sendExtraMessageFields: true,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: "gemini-2.5-flash",
    }),
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error")
      }
    },
  });
  const empty = useMemo(() => input === "", [input]);
  const [open, setOpen] = useState(false);
  const selectedModel = useMemo(
    () => MODELS.find((model) => model.id === selectedModelId),
    [selectedModelId]
  );

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
                  "px-4 py-2 prose dark:prose-invert prose-code:bg-secondary prose-code:text-primary before:content-none! after:content-none!",
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
            {/* {error && (
              <>
                <div>An error occurred.</div>
                <Button type="button" onClick={() => reload()}>
                  Retry
                </Button>
              </>
            )} */}
          </div>
        </div>
      )}

      <ApiKeyDialog providerId="openrouter" apiKeys={apiKeys} modelName={selectedModel?.title!} open={open} setOpen={setOpen} providerName="OpenRouter" />

      <MessageInput
        setApiKeysOpen={setOpen}
        selectedModelId={selectedModelId}
        stop={stop}
        status={status}
        value={input}
        setValue={(value) => setInput(value)}
        ref={ref}
        setHeight={setHeight}
        onSubmit={(message) => {
          if (!apiKeys["openrouter"]) {
            setOpen(true);
            return;
          }
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
