import {
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeIcon,
  Loader2Icon,
  Search,
  SearchIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useState } from "react"
import { MemoizedMarkdown } from "./memoized-markdown"
import { cn } from "@/lib/utils"
import { TextShimmer } from "./ui/text-shimmer"

export default function MessageWebSearch({
  result,
  query,
}: {
  result: {
    title: string | null
    url: string
    content: string
    publishedDate: string | undefined
  }[]
  query: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-row gap-2 items-center group/reasoning cursor-pointer"
        onClick={() => {
          setIsExpanded((a) => !a)
        }}
      >
        <div className="relative">
          <GlobeIcon className="size-4 group-hover/reasoning:scale-0 transition" />

          <div className="absolute top-0 left-0 w-full h-full bg-background opacity-0 group-hover/reasoning:opacity-100 transition">
            <ChevronRightIcon
              className={cn("size-4 transition", isExpanded && "rotate-90")}
            />
          </div>
        </div>
        <div className="font-medium select-none flex flex-col leading-tight">
          <AnimatePresence mode="popLayout" initial={false}>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                key="hide-search-results"
                className="origin-left overflow-hidden"
              >
                Hide search results
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                key="show-search-results"
                className="origin-left overflow-hidden"
              >
                Show search results
              </motion.div>
            )}
          </AnimatePresence>
          <div className="text-muted-foreground text-xs">{query}</div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-2">
              {result.map((item) => (
                <a
                  key={item.url}
                  className="flex gap-2 p-2 px-3 border rounded-xl items-center no-underline!"
                  href={item.url}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${item.url}`}
                    className="size-6 rounded-md m-0!"
                  />
                  <div className="flex flex-col leading-tight">
                    <div>{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new URL(item.url).hostname}
                    </div>
                  </div>
                  <SquareArrowOutUpRightIcon className="size-4 ml-auto" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
