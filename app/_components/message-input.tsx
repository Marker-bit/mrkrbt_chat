import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ArrowUp, ChevronUpIcon, GlobeIcon } from "lucide-react";
import { RefObject, useEffect } from "react";
import useMeasure from "react-use-measure";

export default function MessageInput({
  value,
  setValue,
  ref,
  setHeight
}: {
  value: string;
  setValue: (value: string) => void;
  ref?: RefObject<AutosizeTextAreaRef | null>;
  setHeight?: (height: number) => void
}) {
  const [measureRef, bounds] = useMeasure();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey || window.innerWidth < 768) {
        return
      } else {
        e.preventDefault()
      }
    }
  }

  useEffect(() => {
    setHeight?.(bounds.height)
  }, [bounds.height, setHeight])

  return (
    <div className="w-full fixed bottom-0 left-0 px-2">
      <div className="border-8 border-accent border-b-0 p-4 w-full max-w-3xl mx-auto rounded-3xl rounded-b-none flex flex-col gap-2 backdrop-blur-md" ref={measureRef}>
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
          <div className="flex gap-2 items-stretch">
            <Button variant="ghost" size="sm">
              <div>Gemini 2.5 Flash</div>
              <ChevronUpIcon className="size-4" />
            </Button>
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
          <Button size="icon" disabled={!value.trim()}>
            <ArrowUp className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
