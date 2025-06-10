import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { cn, fetcher } from "@/lib/utils";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useOptimistic, useRef, useState } from "react";
import MessageInput from "./message-input";
import WelcomeScreen from "../app/(app)/_components/welcome-screen";
import { ChatSDKError } from "@/lib/errors";
import { toast } from "sonner";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import ApiKeyDialog from "./api-key-dialog";
import { MODELS } from "@/lib/models";
import { Loader2Icon } from "lucide-react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import MessageButtons from "./message-buttons";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "./chat-list";
import { MessageReasoning } from "./reasoning";

export default function Chat({
  isMain = false,
  id,
  initialMessages,
  selectedModelId,
  apiKeys,
  state,
}: {
  isMain?: boolean;
  id: string;
  initialMessages?: Message[];
  selectedModelId: string;
  apiKeys: Record<string, string>;
  state: "loading" | "complete";
}) {
  const [height, setHeight] = useState(0);
  const ref = useRef<AutosizeTextAreaRef>(null);
  const {
    messages,
    setMessages,
    append,
    input,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    credentials: "include",
    experimental_throttle: 50,
    generateId: () => crypto.randomUUID(),
    initialMessages,
    fetch: fetchWithErrorHandlers,
    sendExtraMessageFields: true,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      selectedChatModel: "qwen3",
    }),
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      if (isMain) {
        router.push(`/chat/${id}`);
      }
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error");
      }
    },
  });

  const { data: chatState } = useSWR(
    `/api/state/${id}`,
    (url) => (state === "loading" ? fetcher(url) : "complete"),
    {
      refreshInterval: 1000,
    }
  );

  const empty = useMemo(() => input === "", [input]);
  const [open, setOpen] = useState(false);
  const selectedModel = useMemo(
    () => MODELS.find((model) => model.id === selectedModelId),
    [selectedModelId]
  );
  const [sentMessage, setSentMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (chatState === "complete" && !sentMessage && !isMain) {
      router.refresh();
    }
  }, [chatState, sentMessage]);

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
            className="flex flex-col w-full max-w-3xl h-fit gap-4"
            style={{ paddingBottom: `${height + 10}px` }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-2 group",
                  message.role === "user" && "ml-auto items-end"
                )}
              >
                <div
                  key={message.id}
                  className={cn(
                    "px-4 py-2 prose dark:prose-invert prose-code:bg-secondary prose-code:text-primary before:content-none! after:content-none!",
                    message.role === "user" ? "bg-secondary rounded-xl" : ""
                  )}
                >
                  {JSON.stringify(message.parts)}
                  {/* {message.role === "user" ? "User: " : "AI: "} */}
                  {message.parts.map((part, index) => {
                    // text parts:
                    if (part.type === "text") {
                      return (
                        <MemoizedMarkdown
                          key={index}
                          id={id}
                          content={part.text}
                        />
                      );
                    }

                    // reasoning parts:
                    if (part.type === "reasoning") {
                      return (
                        <MessageReasoning
                          key={index}
                          isLoading={
                            status === "streaming" &&
                            messages.length - 1 === index
                          }
                          messageId={message.id}
                          reasoning={part.reasoning}
                        />
                      );
                    }
                  })}
                  {/* {message.content} */}
                </div>
                <MessageButtons
                  chatId={id}
                  reload={reload}
                  setMessages={setMessages}
                  message={message}
                />
              </div>
            ))}
            {chatState === "loading" && !sentMessage && (
              <div className="border p-2 rounded-xl flex items-center gap-2">
                <Loader2Icon className="animate-spin size-4" />
                <div className="flex flex-col">
                  <div className="font-semibold">Loading response...</div>
                  <div className="text-xs text-muted-foreground">
                    It will be ready once the network finishes processing.
                  </div>
                </div>
              </div>
            )}
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

      <ApiKeyDialog
        providerId="openrouter"
        apiKeys={apiKeys}
        modelName={selectedModel?.title!}
        open={open}
        setOpen={setOpen}
        providerName="OpenRouter"
      />

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
          setSentMessage(true);
          append({ role: "user", content: message.trim() });
        }}
      />
    </>
  );
}
