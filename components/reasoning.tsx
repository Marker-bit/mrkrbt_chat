"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react"
import { MemoizedMarkdown } from "./memoized-markdown"
import { TextShimmer } from "./ui/text-shimmer"
import { cn } from "@/lib/utils"

interface MessageReasoningProps {
  isLoading: boolean
  reasoningText: string
  messageId: string
}

export function MessageReasoning({
  isLoading,
  reasoningText,
  messageId,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true)

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
  }

  useEffect(() => {
    if (!isLoading) {
      setIsExpanded(false)
    }
  }, [reasoningText])

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-row gap-2 items-center group/reasoning cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
      >
        <div className="relative">
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <BrainIcon className="size-4" />
          )}

          <div
            className={cn(
              "absolute top-0 left-0 w-full h-full bg-background opacity-0 group-hover/reasoning:opacity-100 transition",
              isExpanded ? "rotate-90" : ""
            )}
          >
            <ChevronRightIcon className="size-4" />
          </div>
        </div>
        <div className="font-medium select-none">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <TextShimmer
                duration={1}
                className="w-fit"
              >
                Reasoning
              </TextShimmer>
            ) : isExpanded ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                key="hide"
                className="origin-left"
              >
                Hide reasoning
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                key="show"
                className="origin-left"
              >
                Show reasoning
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
            <MemoizedMarkdown
              id={`reasoning-${messageId}`}
              content={reasoningText}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
