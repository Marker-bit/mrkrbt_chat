import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  AlertCircleIcon,
  ArrowUpIcon,
  ChevronUpIcon,
  GlobeIcon,
  Paperclip,
  PaperclipIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { RefObject, useEffect, useMemo } from "react";
import useMeasure from "react-use-measure";
import ModelPopover from "./model-popover";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { ModelData, MODELS } from "@/lib/models";

export default function MessageInput({
  value,
  setValue,
  ref,
  setHeight,
  onSubmit,
  status,
  selectedModelData,
  setFiles,
  useWebSearch,
  setUseWebSearch,
  apiKeys,
}: {
  value: string;
  setValue: (value: string) => void;
  ref?: RefObject<AutosizeTextAreaRef | null>;
  setHeight?: (height: number) => void;
  onSubmit?: (message: string) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  selectedModelData: ModelData;
  setFiles: (files: File[]) => void;
  useWebSearch: boolean;
  setUseWebSearch: (value: boolean) => void;
  apiKeys: Record<string, string>;
}) {
  const [
    { files, errors },
    { openFileDialog, removeFile, getInputProps, clearFiles },
  ] = useFileUpload({
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*,application/pdf",
  });
  const [measureRef, bounds] = useMeasure();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey || window.innerWidth < 768) {
        return;
      } else {
        e.preventDefault();
        onSubmit?.(value);
        setValue("");
      }
    }
  };

  useEffect(() => {
    setFiles(files.map((file) => file.file as File));
  }, [files]);

  // const availableChatModels = MODELS;

  // const [optimisticModelId, setOptimisticModelId] =
  //   useOptimistic(selectedModelData);

  const selectedChatModel = useMemo(
    () =>
      MODELS.find((chatModel) => chatModel.id === selectedModelData.modelId),
    [selectedModelData, MODELS]
  );

  const selectedProvider = useMemo(
    () =>
      selectedModelData.options.provider
        ? selectedChatModel?.providers[selectedModelData.options.provider]
        : null,
    [selectedChatModel, selectedModelData]
  );

  useEffect(() => {
    setHeight?.(bounds.height);
  }, [bounds.height, setHeight]);

  return (
    <div className="w-full absolute bottom-0 left-0 px-2 pointer-events-none">
      <div
        className="pointer-events-auto border-8 border-accent border-b-0 p-4 w-full max-w-3xl mx-auto rounded-3xl rounded-b-none flex flex-col gap-2 backdrop-blur-lg bg-background/50"
        ref={measureRef}
      >
        <input
          {...getInputProps()}
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
                  {file.file.type.startsWith("image") && (
                    <div className="bg-accent aspect-square shrink-0 rounded">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-10 rounded-[inherit] object-cover"
                      />
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              onClick={openFileDialog}
              variant="outline"
              className="h-auto flex"
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        )}

        {errors.length > 0 && (
          <div
            className="text-red-700 dark:text-red-300 flex items-center gap-1 text-xs bg-red-500/20 rounded px-2 py-1"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
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
                  onClick={() => {
                    openFileDialog();
                  }}
                >
                  <PaperclipIcon />
                </Button>
              )}
            <Button
              size="icon"
              onClick={() => {
                if (status === "streaming") {
                  stop();
                } else {
                  onSubmit?.(value);
                  setValue("");
                  clearFiles();
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
  );
}
