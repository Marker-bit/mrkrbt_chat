"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react";
import { MemoizedMarkdown } from "./memoized-markdown";
import { TextShimmer } from "./ui/text-shimmer";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/db/db-types";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoningText: string;
  messageId: string;
  metadata: Message["metadata"];
}

export function MessageReasoning({
  isLoading,
  reasoningText,
  messageId,
  metadata,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [reasoningSeconds, setReasoningSeconds] = useState(0);

  useEffect(() => {
    if (metadata?.reasoningStartDate && metadata?.reasoningEndDate) {
      if (intervalId) clearInterval(intervalId);
      setReasoningSeconds(
        (new Date(metadata?.reasoningEndDate).getTime() -
          new Date(metadata?.reasoningStartDate).getTime()) /
          1000
      );
    } else if (metadata?.reasoningStartDate) {
      const interval = setInterval(() => {
        if (!metadata?.reasoningStartDate) {
          clearInterval(interval);
          return;
        }
        setReasoningSeconds(
          (new Date().getTime() -
            new Date(metadata.reasoningStartDate).getTime()) /
            1000
        );
      }, 50);

      setIntervalId(interval);

      return () => clearInterval(interval);
    }
  }, [metadata?.reasoningStartDate, metadata?.reasoningEndDate]);

  useEffect(() => {
    if (!metadata?.reasoningEndDate) {
      setIsExpanded(true);
    }
  }, [metadata?.reasoningEndDate]);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  useEffect(() => {
    if (!isLoading) {
      setIsExpanded(false);
    }
  }, [reasoningText, isLoading]);

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-row gap-2 items-center group/reasoning cursor-pointer"
        onClick={() => {
          setIsExpanded((a) => !a);
        }}
      >
        <div className="relative">
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin group-hover/reasoning:scale-0 transition" />
          ) : (
            <BrainIcon className="size-4 group-hover/reasoning:scale-0 transition" />
          )}

          <div className="absolute top-0 left-0 w-full h-full bg-background opacity-0 group-hover/reasoning:opacity-100 transition">
            <ChevronRightIcon
              className={cn("size-4 transition", isExpanded && "rotate-90")}
            />
          </div>
        </div>
        <div className="font-medium select-none leading-tight w-full">
          {isLoading ? (
            <TextShimmer duration={1} className="w-fit my-0!" key="loading">
              Reasoning...
            </TextShimmer>
          ) : (
            <div className="relative w-full">
              <div className="pointer-events-none opacity-0">a</div>
              <div className="absolute top-0 left-0">
                <AnimatePresence mode="popLayout" initial={false}>
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      key="hide"
                      className="origin-left overflow-hidden"
                    >
                      Hide reasoning
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                      key="show"
                      className="origin-left overflow-hidden"
                    >
                      Show reasoning
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          <div className="text-muted-foreground text-xs">
            {reasoningSeconds.toFixed(2)}s
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="relative group/reasoning">
            <motion.div
              data-testid="message-reasoning"
              key="content"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={variants}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="pl-4 text-zinc-600 dark:text-zinc-400 flex flex-col gap-4"
            >
              <div className="-my-4">
                <MemoizedMarkdown
                  id={`reasoning-${messageId}`}
                  content={reasoningText}
                />
              </div>
            </motion.div>
            <button className="absolute top-2 bottom-0 left-0 w-8 translate-x-[-50%] flex justify-center group/border" onClick={() => setIsExpanded(false)}>
              <div className="h-full w-0.5 bg-black/10 dark:bg-white/10 group-hover/border:w-3 group-hover/border:bg-black/20 group-hover/border:dark:bg-white/20 transition-[width,background]" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
