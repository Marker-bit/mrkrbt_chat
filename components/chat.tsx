import { MemoizedMarkdown } from "@/components/memoized-markdown"
import { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea"
import { useChatVisibility } from "@/hooks/use-chat-visibility"
import { Message } from "@/lib/db/db-types"
import { fetchWithErrorHandlers } from "@/lib/fetch"
import { ModelData, MODELS } from "@/lib/models"
import { cn, convertFileArrayToFileList, fetcher } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { CircleAlertIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { unstable_serialize } from "swr/infinite"
import WelcomeScreen from "../app/(app)/_components/welcome-screen"
import { getChatHistoryPaginationKey } from "./chat-list"
import MessageButtons from "./message-buttons"
import MessageInput from "./message-input"
import MessageWebSearch from "./message-web-search"
import { MessageReasoning } from "./reasoning"
import { Button } from "./ui/button"
import { TextShimmer } from "./ui/text-shimmer"
import EditingMessage from "./editing-message"
import { motion } from "motion/react"
import { DefaultChatTransport } from "ai"

export default function Chat({
  isMain = false,
  id,
  initialMessages,
  selectedModelData,
  apiKeys,
  state,
  readOnly,
}: {
  isMain?: boolean
  id: string
  initialMessages?: Message[]
  selectedModelData: ModelData
  apiKeys: Record<string, string>
  state: "loading" | "complete"
  readOnly: boolean
}) {
  const [height, setHeight] = useState(0)
  const ref = useRef<AutosizeTextAreaRef>(null)
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType: "private",
  })
  const [useWebSearch, setUseWebSearch] = useState(false)
  const retryMessageId = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [onBottom, setOnBottom] = useState(false)
  const [input, setInput] = useState("")

  const { messages, setMessages, sendMessage, status, regenerate, error } =
    useChat<Message>({
      transport: new DefaultChatTransport({
        credentials: "include",
        api: "/api/chat",
        fetch: fetchWithErrorHandlers,
        prepareSendMessagesRequest: ({ messages, trigger, messageId }) => {
          const retryMessageId =
            trigger === "regenerate-message"
              ? messageId || messages.at(-1)?.id
              : null
          return {
            body: {
              id,
              message:
                trigger === "regenerate-message"
                  ? messageId
                    ? messages.find((m) => m.id === messageId)
                    : messages.at(-1)
                  : messages.at(-1),
              retryMessageId,
              selectedChatModel: selectedModelData,
              visibilityType,
              useWebSearch,
            },
          }
        },
      }),
      experimental_throttle: 50,
      generateId: () => crypto.randomUUID(),
      messages: initialMessages,

      // prep: (body) => ({
      //   id,
      //   message: body.messages.at(-1),
      //   selectedChatModel: selectedModelData,
      //   visibilityType,
      //   useWebSearch,
      //   retryMessageId: retryMessageId.current,
      // }),

      onFinish: () => {
        retryMessageId.current = null
        mutate(unstable_serialize(getChatHistoryPaginationKey))
        if (isMain) {
          router.push(`/chat/${id}`, { scroll: false })
        }
      },

      onError: (error) => {
        retryMessageId.current = null
        console.log(error)
        toast.error(error.message)
      },
    })

  const { data: chatState } = useSWR(
    `/api/state/${id}`,
    (url) => (state === "loading" ? fetcher(url) : "complete"),
    {
      refreshInterval: 1000,
    }
  )

  const retryMessage = (id: string) => {
    regenerate({ messageId: id })
  }

  const empty = useMemo(() => input === "", [input])
  const [sentMessage, setSentMessage] = useState(false)
  const router = useRouter()
  const [editingMessage, setEditingMessage] = useState<string | null>(null)

  useEffect(() => {
    if (chatState === "complete" && !sentMessage && !isMain) {
      router.refresh()
    }
  }, [chatState, sentMessage])

  useEffect(() => {
    if (onBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" })
    }
  }, [messages])

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "instant" })
    }, 200) // for the code blocks to load
  }, [])

  const editMessage = (messageId: string, text: string) => {
    const msgIndex = messages.findIndex((message) => message.id === messageId)
    setMessages((messages) =>
      messages
        .map((message) => {
          if (message.id === messageId) {
            return {
              ...message,
              content: text,
              parts: [{ text, type: "text" as const }],
            }
          }
          return message
        })
        .slice(0, msgIndex + 1)
    )
    retryMessage(messageId)
    setEditingMessage(null)
  }

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
                setInput(item)
                ref.current?.textArea.focus()
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
                id={message.id}
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
                        "prose dark:prose-invert prose-code:bg-secondary prose-code:p-1 prose-pre:p-0 prose-code:rounded-md prose-code:before:content-none! prose-code:after:content-none! prose-pre:bg-white prose-pre:dark:bg-black",
                        message.role === "user"
                          ? "bg-secondary rounded-xl px-4 py-2"
                          : ""
                      )}
                    >
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MemoizedMarkdown
                                key={index}
                                id={id}
                                content={part.text}
                              />
                            )
                          case "reasoning":
                            return (
                              <MessageReasoning
                                key={index}
                                isLoading={
                                  status === "streaming" &&
                                  messages.length - 1 === msgIndex
                                }
                                messageId={message.id}
                                reasoningText={part.text}
                              />
                            )
                          case "tool-webSearch":
                            if (part.state === "output-available") {
                              return (
                                <div key={part.toolCallId}>
                                  {/* <pre>
                                {JSON.stringify(part.toolInvocation, null, 2)}
                              </pre> */}
                                  <MessageWebSearch
                                    result={part.output}
                                    query={part.input.query}
                                  />
                                </div>
                              )
                            } else {
                              return (
                                <TextShimmer
                                  className="text-sm"
                                  duration={1}
                                  key={part.toolCallId}
                                >
                                  Searching the web...
                                </TextShimmer>
                              )
                            }
                          case "tool-generateImage":
                            if (part.state === "output-available") {
                              if ("error" in part.output) {
                                return (
                                  <div
                                    className="bg-red-500/20 text-red-500 p-4 rounded-xl flex gap-4 items-center"
                                    key={part.toolCallId}
                                  >
                                    <CircleAlertIcon className="size-5" />
                                    <div className="flex flex-col leading-tight">
                                      <div className="font-semibold">
                                        Failed to generate image
                                      </div>
                                      <div className="text-sm">
                                        {part.output.error}
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              if ("message" in part.output) {
                                return (
                                  <div
                                    className="bg-red-500/20 text-red-500 p-4 rounded-xl flex gap-4 items-center"
                                    key={part.toolCallId}
                                  >
                                    <CircleAlertIcon className="size-5" />
                                    <div className="flex flex-col leading-tight">
                                      <div className="font-semibold">
                                        Failed to generate image
                                      </div>
                                      <div className="text-sm">
                                        {part.output.message}
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return (
                                <div
                                  className="relative rounded-xl overflow-hidden size-[400px] max-w-full group/image"
                                  key={part.toolCallId}
                                >
                                  <Image
                                    src={part.output.image}
                                    alt={part.input.prompt}
                                    height={400}
                                    width={400}
                                  />
                                  <div
                                    className="absolute bottom-0 left-0 w-full p-2 pt-4 opacity-0 group-hover/image:opacity-100 max-sm:opacity-100 transition"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to top, color-mix(in oklab, var(--background) 100%, transparent), color-mix(in oklab, var(--background) 80%, transparent) 50%, transparent)",
                                    }}
                                  >
                                    <Button variant="ghost" size="icon" asChild>
                                      <a
                                        href={(part.output as any).image}
                                        download="image.png"
                                        target="_blank"
                                      >
                                        <DownloadIcon />
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              )
                            } else {
                              return (
                                <TextShimmer
                                  className="text-sm"
                                  duration={1}
                                  key={part.toolCallId}
                                >
                                  Generating the image...
                                </TextShimmer>
                              )
                            }
                        }
                      })}
                    </div>
                    <div className="flex gap-2">
                      {message.parts
                        .filter((part) => part.type === "file")
                        .map((attachment, index) => (
                          <div
                            className="border rounded-xl flex gap-2 items-center p-2 group/attachment"
                            key={`${message.id}-${index}`}
                          >
                            {attachment.mediaType.startsWith("image/") && (
                              <div className="bg-accent aspect-square shrink-0 rounded-lg overflow-hidden relative">
                                <img
                                  src={attachment.url}
                                  alt={attachment.filename}
                                  className="size-10 object-cover"
                                />
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  download={attachment.filename}
                                  className="absolute inset-0 bg-accent/80 opacity-0 group-hover/attachment:opacity-100 transition flex items-center justify-center"
                                >
                                  <DownloadIcon className="size-4" />
                                </a>
                              </div>
                            )}
                            <div className="min-w-0 gap-0.5 truncate text-[13px] font-medium">
                              {attachment.filename}
                            </div>
                            {!attachment.mediaType.startsWith("image/") && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  href={attachment.url}
                                  target="_blank"
                                  download={attachment.filename}
                                >
                                  <DownloadIcon className="size-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                    {(status === "ready" || msgIndex < messages.length - 1) && (
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
                    )}
                  </>
                )}
              </div>
            ))}
            {chatState === "loading" && messages.at(-1)?.role === "user" && (
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
            {error && (
              <div className="flex flex-col gap-1">
                <div>An error occurred.</div>
                <div className="text-muted-foreground text-xs mb-2">
                  {error.message}
                </div>
                <Button type="button" onClick={() => regenerate()}>
                  Retry
                </Button>
              </div>
            )}
            <motion.div
              onViewportEnter={() => setOnBottom(true)}
              onViewportLeave={() => setOnBottom(false)}
              ref={bottomRef}
            />
          </div>
        </div>
      )}
      {!readOnly && (
        <MessageInput
          apiKeys={apiKeys}
          useWebSearch={useWebSearch}
          setUseWebSearch={setUseWebSearch}
          selectedModelData={selectedModelData}
          status={status}
          value={input}
          setValue={(value) => setInput(value)}
          ref={ref}
          setHeight={setHeight}
          onSubmit={(message, files) => {
            let modelProviders: string[] = []
            if (selectedModelData.modelId.startsWith("openrouter:")) {
              modelProviders = ["openrouter"]
            } else {
              const prov = MODELS.find(
                (m) => m.id === selectedModelData.modelId
              )!.providers
              modelProviders = Object.keys(prov)
            }
            let foundKey: boolean = false
            let providers = new URLSearchParams()
            for (const provider of modelProviders) {
              providers.append("providers", provider)
              if (apiKeys[provider]) {
                foundKey = true
              }
            }
            if (!foundKey) {
              router.push("/settings/api-keys?" + providers.toString())
              return
            }
            if (messages.length === 0) {
              window.history.replaceState({}, "", `/chat/${id}`)
            }
            if (message.trim() === "" || status !== "ready") return
            setSentMessage(true)
            sendMessage({
              role: "user",
              parts: [
                {
                  text: message.trim(),
                  type: "text",
                },
                ...files.map((f) => ({
                  type: "file" as const,
                  mediaType: f.mediaType,
                  filename: f.filename,
                  url: f.url,
                })),
              ],
            })
            setInput("")
          }}
        />
      )}
    </>
  )
}
