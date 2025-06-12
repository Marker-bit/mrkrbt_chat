import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { Message } from "@/lib/db/db-types";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/fetch";
import { ModelData, MODELS } from "@/lib/models";
import { cn, convertFileArrayToFileList, fetcher } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { CircleAlertIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { unstable_serialize } from "swr/infinite";
import WelcomeScreen from "../app/(app)/_components/welcome-screen";
import { getChatHistoryPaginationKey } from "./chat-list";
import MessageButtons from "./message-buttons";
import MessageInput from "./message-input";
import MessageWebSearch from "./message-web-search";
import { MessageReasoning } from "./reasoning";
import { Button } from "./ui/button";
import { TextShimmer } from "./ui/text-shimmer";
import EditingMessage from "./editing-message";

export default function Chat({
  isMain = false,
  id,
  initialMessages,
  selectedModelData,
  apiKeys,
  state,
  readOnly,
}: {
  isMain?: boolean;
  id: string;
  initialMessages?: Message[];
  selectedModelData: ModelData;
  apiKeys: Record<string, string>;
  state: "loading" | "complete";
  readOnly: boolean;
}) {
  const [height, setHeight] = useState(0);
  const ref = useRef<AutosizeTextAreaRef>(null);
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType: "private",
  });
  const [useWebSearch, setUseWebSearch] = useState(false);
  const retryMessageId = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      selectedChatModel: selectedModelData,
      visibilityType,
      useWebSearch,
      retryMessageId: retryMessageId.current,
    }),
    onFinish: () => {
      retryMessageId.current = null;
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      if (isMain) {
        router.push(`/chat/${id}`, { scroll: false });
      }
    },
    onError: (error) => {
      retryMessageId.current = null;
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      } else {
        console.error(error);
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

  const retryMessage = (id: string) => {
    retryMessageId.current = id;
    setTimeout(reload, 20);
  };

  const empty = useMemo(() => input === "", [input]);
  const [sentMessage, setSentMessage] = useState(false);
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (chatState === "complete" && !sentMessage && !isMain) {
      router.refresh();
    }
  }, [chatState, sentMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, 200); // for the code blocks to load
  }, []);

  const editMessage = (messageId: string, text: string) => {
    const nextMessage =
      messages.findIndex((message) => message.id === messageId) + 1;
    setMessages((messages) =>
      messages
        .map((message) => {
          if (message.id === messageId) {
            return {
              ...message,
              content: text,
              parts: [{ text, type: "text" as const }],
            };
          }
          return message;
        })
        .slice(0, nextMessage)
    );
    setMessages((messages) => messages.slice(0, nextMessage));
    retryMessage(messages[nextMessage].id);
    setEditingMessage(null);
  };

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
        <div className="flex justify-center grow w-full pt-14 px-4 gap-4 overflow-auto">
          <div
            className="flex flex-col w-full max-w-3xl h-fit gap-4"
            style={{ paddingBottom: `${height + 10}px` }}
          >
            {messages.map((message, msgIndex) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-2 group",
                  message.role === "user" && "items-end"
                )}
              >
                {editingMessage === message.id ? (
                  <EditingMessage
                    editMessage={(text) => editMessage(message.id, text)}
                    setEditingMessage={(editing) =>
                      setEditingMessage(editing ? message.id : null)
                    }
                    message={message}
                  />
                ) : (
                  <>
                    <div
                      key={message.id}
                      className={cn(
                        "prose dark:prose-invert prose-code:bg-secondary prose-code:p-1 prose-code:rounded-md prose-code:before:content-none! prose-code:after:content-none!",
                        message.role === "user"
                          ? "bg-secondary rounded-xl px-4 py-2"
                          : ""
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

                        if (part.type === "tool-invocation") {
                          if (part.toolInvocation.toolName === "webSearch") {
                            if (part.toolInvocation.state === "result") {
                              return (
                                <div key={part.toolInvocation.toolCallId}>
                                  {/* <pre>
                                {JSON.stringify(part.toolInvocation, null, 2)}
                              </pre> */}
                                  <MessageWebSearch
                                    result={part.toolInvocation.result}
                                    query={part.toolInvocation.args.query}
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <TextShimmer
                                  className="text-sm"
                                  duration={1}
                                  key={part.toolInvocation.toolCallId}
                                >
                                  Searching the web...
                                </TextShimmer>
                              );
                            }
                          } else if (
                            part.toolInvocation.toolName === "generateImage"
                          ) {
                            if (part.toolInvocation.state === "result") {
                              if (part.toolInvocation.result?.error) {
                                return (
                                  <div
                                    className="bg-red-500/20 text-red-500 p-4 rounded-xl flex gap-4 items-center"
                                    key={part.toolInvocation.toolCallId}
                                  >
                                    <CircleAlertIcon className="size-5" />
                                    <div className="flex flex-col leading-tight">
                                      <div className="font-semibold">
                                        Failed to generate image
                                      </div>
                                      <div className="text-sm">
                                        {part.toolInvocation.result.error}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div
                                  className="relative rounded-xl overflow-hidden size-[400px] group/image"
                                  key={part.toolInvocation.toolCallId}
                                >
                                  <Image
                                    src={part.toolInvocation.result.image}
                                    alt={part.toolInvocation.result.prompt}
                                    height={400}
                                    width={400}
                                  />
                                  <div
                                    className="absolute bottom-0 left-0 w-full p-2 pt-4 opacity-0 group-hover/image:opacity-100 transition"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to top, color-mix(in oklab, var(--background) 100%, transparent), color-mix(in oklab, var(--background) 80%, transparent) 50%, transparent)",
                                    }}
                                  >
                                    <Button variant="ghost" size="icon" asChild>
                                      <a
                                        href={part.toolInvocation.result.image}
                                        download="image.png"
                                        target="_blank"
                                      >
                                        <DownloadIcon />
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <TextShimmer
                                  className="text-sm"
                                  duration={1}
                                  key={part.toolInvocation.toolCallId}
                                >
                                  Generating the image...
                                </TextShimmer>
                              );
                            }
                          }
                        }
                      })}
                    </div>
                    <div className="flex gap-2">
                      {message.experimental_attachments?.map(
                        (attachment, index) => (
                          <div
                            className="border rounded-xl flex gap-2 items-center p-2 group/attachment"
                            key={`${message.id}-${index}`}
                          >
                            {attachment.contentType &&
                              attachment.contentType.startsWith("image/") && (
                                <div className="bg-accent aspect-square shrink-0 rounded-lg overflow-hidden relative">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="size-10 object-cover"
                                  />
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    download={attachment.name}
                                    className="absolute inset-0 bg-accent/80 opacity-0 group-hover/attachment:opacity-100 flex items-center justify-center"
                                  >
                                    <DownloadIcon className="size-4" />
                                  </a>
                                </div>
                              )}
                            <div className="min-w-0 gap-0.5 truncate text-[13px] font-medium">
                              {attachment.name}
                            </div>
                            {!(
                              attachment.contentType &&
                              attachment.contentType.startsWith("image/")
                            ) && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  href={attachment.url}
                                  target="_blank"
                                  download={attachment.name}
                                >
                                  <DownloadIcon className="size-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <MessageButtons
                      chatId={id}
                      retryMessage={retryMessage}
                      setMessages={setMessages}
                      message={message}
                      readOnly={readOnly}
                      nextMessage={messages[msgIndex + 1]}
                      setEditingMessage={(editing) =>
                        setEditingMessage(editing ? message.id : null)
                      }
                    />
                  </>
                )}
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
            {status === "submitted" && (
              <TextShimmer className="text-sm w-fit" duration={1}>
                Thinking...
              </TextShimmer>
            )}
            {/* {error && (
              <>
                <div>An error occurred.</div>
                <Button type="button" onClick={() => reload()}>
                  Retry
                </Button>
              </>
            )} */}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {!readOnly && (
        <MessageInput
          apiKeys={apiKeys}
          useWebSearch={useWebSearch}
          setUseWebSearch={setUseWebSearch}
          setFiles={setFiles}
          selectedModelData={selectedModelData}
          stop={stop}
          status={status}
          value={input}
          setValue={(value) => setInput(value)}
          ref={ref}
          setHeight={setHeight}
          onSubmit={(message) => {
            let modelProviders: string[] = [];
            if (selectedModelData.modelId.startsWith("openrouter:")) {
              modelProviders = ["openrouter"];
            } else {
              const prov = MODELS.find(
                (m) => m.id === selectedModelData.modelId
              )!.providers;
              modelProviders = Object.keys(prov);
            }
            let foundKey: boolean = false;
            let providers = new URLSearchParams();
            for (const provider of modelProviders) {
              providers.append("providers", provider);
              if (apiKeys[provider]) {
                foundKey = true;
              }
            }
            if (!foundKey) {
              router.push("/settings/api-keys?" + providers.toString());
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
      )}
    </>
  );
}
