import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { Message } from "@/lib/db/db-types";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { MODELS } from "@/lib/models";
import { cn, convertFileArrayToFileList, fetcher } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { unstable_serialize } from "swr/infinite";
import WelcomeScreen from "../app/(app)/_components/welcome-screen";
import ApiKeyDialog from "./api-key-dialog";
import { getChatHistoryPaginationKey } from "./chat-list";
import MessageButtons from "./message-buttons";
import MessageInput from "./message-input";
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
    handleSubmit,
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
      selectedChatModel: selectedModelId,
    }),
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      if (isMain) {
        router.push(`/chat/${id}`, { scroll: false });
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
  const [files, setFiles] = useState<File[]>([]);

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
            {messages.map((message, msgIndex) => (
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
                            messages.length - 1 === msgIndex
                          }
                          messageId={message.id}
                          reasoning={part.reasoning}
                        />
                      );
                    }
                  })}
                </div>
                <div>
                  {message.experimental_attachments
                    ?.filter(
                      (attachment) =>
                        attachment.contentType &&
                        attachment.contentType.startsWith("image/")
                    )
                    .map((attachment, index) => (
                      <img
                        key={`${message.id}-${index}`}
                        src={attachment.url}
                        alt={attachment.name}
                      />
                    ))}
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
        setFiles={setFiles}
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
          append({
            role: "user",
            content: message.trim(),
            // @ts-expect-error
            experimental_attachments: convertFileArrayToFileList(files),
          });
        }}
      />
    </>
  );
}
