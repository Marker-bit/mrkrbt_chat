"use client";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "date-fns";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  CornerDownRightIcon,
  LibraryIcon,
  LucideIcon,
  PlusIcon,
  SearchIcon,
  TextCursorInputIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nanoid } from "nanoid";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "./utils";
import { Input } from "@/components/ui/input";

export type Library = {
  prompts: Prompt[];
};

export type Prompt = {
  prompt: string;
  createdAt: Date;
  id: string;
};

export type PromptAction = {
  title: string;
  icon: LucideIcon;
  execute: ({
    prompt,
    setInput,
    deletePrompt,
  }: {
    prompt: Prompt;
    setInput: Dispatch<SetStateAction<string>>;
    deletePrompt: () => void;
  }) => void;
};

const promptActions: PromptAction[] = [
  {
    title: "Copy prompt into clipboard",
    icon: ClipboardIcon,
    execute: async ({ prompt }) => {
      await navigator.clipboard.writeText(prompt.prompt);
    },
  },
  {
    title: "Insert at the end",
    icon: CornerDownRightIcon,
    execute: async ({ prompt, setInput }) => {
      setInput((i) => i + "\n" + prompt.prompt);
    },
  },
  {
    title: "Replace message",
    icon: TextCursorInputIcon,
    execute: async ({ prompt, setInput }) => {
      setInput(prompt.prompt);
    },
  },
  {
    title: "Delete prompt",
    icon: TrashIcon,
    execute: async ({ deletePrompt }) => {
      deletePrompt();
    },
  },
];

function Prompt(actionArgs: Parameters<PromptAction["execute"]>[0]) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClipped, setIsClipped] = useState(false);
  const prompt = actionArgs.prompt;

  useEffect(() => {
    setIsClipped(
      textRef.current
        ? textRef.current.clientHeight !== textRef.current.scrollHeight
        : false
    );
  }, [textRef.current]);

  return (
    <div className="border p-2 rounded-xl flex flex-col text-start items-start">
      <div className="text-xs text-muted-foreground">
        created on {formatDate(prompt.createdAt, "dd.MM.yyyy")}
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap w-full",
          !isExpanded && "line-clamp-2"
        )}
        ref={textRef}
      >
        {prompt.prompt}
      </div>
      {isClipped && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded((a) => !a)}
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon /> Less
            </>
          ) : (
            <>
              <ChevronDownIcon /> More
            </>
          )}
        </Button>
      )}
      <div className="flex gap-2 items-center mt-2 ml-auto">
        {promptActions.map((a) => (
          <Tooltip key={`${prompt.id}-${a.title}`}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="size-7"
                size="icon"
                onClick={() => a.execute({ ...actionArgs, prompt })}
              >
                <a.icon className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{a.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export default function PromptLibrary({
  setInput,
}: {
  setInput: Dispatch<SetStateAction<string>>;
}) {
  const [createShown, setCreateShown] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [library, setLibrary] = useLocalStorage<Library>("promptLibrary", {
    prompts: [],
  });
  const [searchText, setSearchText] = useState("");

  const addPrompt = (prompt: string) => {
    setLibrary((l) => ({
      ...l,
      prompts: [...l.prompts, { prompt, createdAt: new Date(), id: nanoid() }],
    }));
  };

  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <LibraryIcon />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>Prompt library</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[400px]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-xl font-semibold">Prompt library</div>
            <div className="text-xs text-muted-foreground">
              Find your saved prompts and paste them into the message input
            </div>
          </div>
          <Button
            size="icon"
            className="shrink-0"
            onClick={() => setCreateShown((a) => !a)}
          >
            <PlusIcon />
          </Button>
        </div>
        <div className="relative my-2">
          <Input
            className="peer ps-9"
            placeholder="Search..."
            type="search"
            value={searchText}
            onChange={(evt) => setSearchText(evt.target.value)}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <SearchIcon size={16} />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto mt-2 flex flex-col space-y-2">
          <AnimatePresence>
            {createShown && (
              <motion.div
                className="flex flex-col gap-2"
                initial={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                  filter: "blur(0px)",
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  filter: "blur(4px)",
                }}
              >
                <AutosizeTextarea
                  className="p-3 border rounded-xl outline-none text-sm"
                  placeholder="New prompt..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                />
                <Button
                  className="ml-auto"
                  onClick={() => {
                    addPrompt(newPrompt);
                    setNewPrompt("");
                    setCreateShown(false);
                  }}
                >
                  Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {library.prompts
            .filter((a) =>
              searchText
                ? a.prompt.toLowerCase().includes(searchText.toLowerCase())
                : true
            )
            .map((p) => (
              <Prompt
                deletePrompt={() =>
                  setLibrary((l) => ({
                    ...l,
                    prompts: l.prompts.filter((pr) => pr.id !== p.id),
                  }))
                }
                key={p.id}
                prompt={p}
                setInput={setInput}
              />
            ))}
          {library.prompts.length === 0 && (
            <div className="rounded-md border px-4 py-3">
              <div className="flex gap-3">
                <TriangleAlertIcon
                  className="hrink-0 mt-0.5 text-amber-500"
                  size={16}
                  aria-hidden="true"
                />
                <div className="flex grow justify-between gap-3">
                  <p className="text-sm">No prompts yet</p>
                  <button
                    onClick={() => setCreateShown(true)}
                    className="group text-sm font-medium whitespace-nowrap"
                  >
                    Add one
                    <ArrowRightIcon
                      className="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
