"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainIcon, ChevronDownIcon, Loader2Icon } from "lucide-react";
import { MemoizedMarkdown } from "./memoized-markdown";
import { TextShimmer } from "./ui/text-shimmer";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoningText: string;
  messageId: string;
}

export function MessageReasoning({
  isLoading,
  reasoningText,
  messageId
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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
  }, [reasoningText])

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <Loader2Icon className="animate-spin size-4" />
          <TextShimmer duration={1} className="font-medium w-fit">Reasoning</TextShimmer>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <BrainIcon className="size-4" />
          <div className="font-medium">Reasoned for a few seconds</div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon className="size-4" />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <MemoizedMarkdown id={`reasoning-${messageId}`} content={reasoningText} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
