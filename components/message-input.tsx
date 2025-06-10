import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  ArrowUpIcon,
  ChevronUpIcon,
  GlobeIcon,
  SquareIcon
} from "lucide-react";
import { RefObject, useEffect } from "react";
import useMeasure from "react-use-measure";
import ModelPopover from "./model-popover";

export default function MessageInput({
  value,
  setValue,
  ref,
  setHeight,
  onSubmit,
  status,
  stop,
  selectedModelId,
  setApiKeysOpen
}: {
  value: string;
  setValue: (value: string) => void;
  ref?: RefObject<AutosizeTextAreaRef | null>;
  setHeight?: (height: number) => void;
  onSubmit?: (message: string) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  selectedModelId: string;
  setApiKeysOpen: (open: boolean) => void
}) {
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
  
  // const availableChatModels = MODELS;

  // const [optimisticModelId, setOptimisticModelId] =
  //   useOptimistic(selectedModelId);

  // const selectedChatModel = useMemo(
  //   () =>
  //     availableChatModels.find(
  //       (chatModel) => chatModel.id === optimisticModelId,
  //     ),
  //   [optimisticModelId, availableChatModels],
  // );

  useEffect(() => {
    setHeight?.(bounds.height);
  }, [bounds.height, setHeight]);

  return (
    <div className="w-full absolute bottom-0 left-0 px-2">
      <div
        className="border-8 border-accent border-b-0 p-4 w-full max-w-3xl mx-auto rounded-3xl rounded-b-none flex flex-col gap-2 backdrop-blur-lg bg-background/50"
        ref={measureRef}
      >
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
            <ModelPopover selectedModelId={selectedModelId} />
            <Toggle
              aria-label="Toggle search"
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <GlobeIcon />
              Search
            </Toggle>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              onClick={() => {
                if (status === "streaming") {
                  stop();
                } else {
                  onSubmit?.(value);
                  setValue("");
                }
              }}
              disabled={status === "ready" ? value.trim() === "" : status === "submitted"}
            >
              {(status === 'submitted' || status === 'streaming') ? (
                <SquareIcon className="size-5" />
              ) : (
                <ArrowUpIcon className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
