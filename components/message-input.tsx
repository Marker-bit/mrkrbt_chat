import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/autosize-textarea"
import { Button } from "@/components/ui/button"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { ModelData, MODELS } from "@/lib/models"
import { upload } from "@vercel/blob/client"
import {
  AlertCircleIcon,
  ArrowUpIcon,
  GlobeIcon,
  Loader2Icon,
  PaperclipIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { RefObject, useEffect, useMemo, useRef, useState } from "react"
import useMeasure from "react-use-measure"
import ModelPopover from "./model-popover"

export type SuccessFile = {
  filename: string
  id: string
  size: number
  mediaType: string
  url: string
  state: "success"
}

export default function MessageInput({
  value,
  setValue,
  ref,
  setHeight,
  onSubmit,
  status,
  selectedModelData,
  useWebSearch,
  setUseWebSearch,
  apiKeys,
}: {
  value: string
  setValue: (value: string) => void
  ref?: RefObject<AutosizeTextAreaRef | null>
  setHeight?: (height: number) => void
  onSubmit?: (message: string, files: SuccessFile[]) => void
  status: "submitted" | "streaming" | "ready" | "error"
  selectedModelData: ModelData
  useWebSearch: boolean
  setUseWebSearch: (value: boolean) => void
  apiKeys: Record<string, string>
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<
    ({ filename: string; id: string; size: number; mediaType: string } & (
      | { state: "success"; url: string }
      | {
          state: "uploading"
        }
    ))[]
  >([])
  const [measureRef, bounds] = useMeasure()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey || window.innerWidth < 768) {
        return
      } else {
        e.preventDefault()
        onSubmit?.(
          value,
          files.filter((f) => f.state === "success")
        )
        setValue("")
        setFiles([])
      }
    }
  }

  const selectedChatModel = useMemo(
    () =>
      MODELS.find((chatModel) => chatModel.id === selectedModelData.modelId),
    [selectedModelData, MODELS]
  )

  const selectedProvider = useMemo(
    () =>
      selectedModelData.options.provider
        ? selectedChatModel?.providers[selectedModelData.options.provider]
        : null,
    [selectedChatModel, selectedModelData]
  )

  useEffect(() => {
    setHeight?.(bounds.height)
  }, [bounds.height, setHeight])

  return (
    <div className="w-full absolute bottom-0 left-0 px-2">
      <div
        className="border-8 border-accent border-b-0 p-4 w-full max-w-3xl mx-auto rounded-3xl rounded-b-none flex flex-col gap-2 backdrop-blur-lg bg-background/50"
        ref={measureRef}
      >
        <input
          type="file"
          onChange={async (e) => {
            console.log(e.target.files)
            if (e.target.files && e.target.files.length > 0) {
              let promises: Promise<void>[] = []
              for (const file of e.target.files) {
                const id = crypto.randomUUID()
                setFiles((oldF) => [
                  ...oldF,
                  {
                    state: "uploading",
                    filename: file.name,
                    id,
                    size: file.size,
                    mediaType: file.type,
                  },
                ])
                promises.push(
                  (async () => {
                    const newBlob = await upload(file.name, file, {
                      access: "public",
                      handleUploadUrl: "/api/attachments/upload",
                    })

                    const newFile = {
                      state: "success" as const,
                      filename: file.name,
                      id,
                      size: file.size,
                      mediaType: file.type,
                      url: newBlob.url,
                    }
                    setFiles((oldF) =>
                      oldF.map((f) => (f.id === newFile.id ? newFile : f))
                    )
                  })()
                )
              }
              await Promise.all(promises)
            }
          }}
          ref={inputRef}
          accept="*"
          multiple
          className="sr-only"
          aria-label="Upload file"
        />

        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.mediaType.startsWith("image") &&
                    (file.state === "success" ? (
                      <div className="bg-accent aspect-square shrink-0 rounded">
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="size-10 rounded-[inherit] object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-10 flex items-center justify-center">
                        <Loader2Icon className="animate-spin size-4" />
                      </div>
                    ))}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.filename}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  onClick={() =>
                    setFiles((files) => files.filter((f) => f.id !== file.id))
                  }
                  aria-label="Remove file"
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.click()
                }
              }}
              variant="outline"
              className="h-auto flex"
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        )}

        <AutosizeTextarea
          className="w-full resize-none outline-0 border-0 bg-transparent"
          placeholder="Type a message..."
          maxHeight={240}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          ref={ref}
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-between w-full items-center">
          <div className="flex gap-2">
            <ModelPopover
              apiKeys={apiKeys}
              selectedModelData={selectedModelData}
            />
            {selectedChatModel?.supportsTools && (
              <Button
                variant={useWebSearch ? "default" : "outline"}
                className="rounded-full"
                aria-label="Toggle search"
                onClick={() => setUseWebSearch(!useWebSearch)}
              >
                <GlobeIcon />
                <div className="max-sm:hidden">Search</div>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {selectedProvider &&
              (selectedProvider.features.includes("pdfs") ||
                selectedProvider.features.includes("vision")) && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.click()
                    }
                  }}
                >
                  <PaperclipIcon />
                </Button>
              )}
            <Button
              size="icon"
              onClick={() => {
                if (status === "streaming") {
                  stop()
                } else {
                  onSubmit?.(
                    value,
                    files.filter((f) => f.state === "success")
                  )
                  setValue("")
                  setFiles([])
                }
              }}
              disabled={status !== "ready" || value.trim() === ""}
            >
              <ArrowUpIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
