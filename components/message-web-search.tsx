import { ChevronDownIcon, GlobeIcon, Search, SearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { MemoizedMarkdown } from "./memoized-markdown";

export default function MessageWebSearch({
  result,
  query,
}: {
  result: {
    title: string;
    url: string;
    content: string;
    publishedDate: string;
  }[];
  query: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 items-center">
        <GlobeIcon className="size-4" />
        <div className="font-medium">Searched the web</div>
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <ChevronDownIcon className="size-4" />
        </button>
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
              <div className="p-2 border rounded-xl flex gap-2 items-center">
                <SearchIcon className="size-4" /> {query}
              </div>
              {result.map((item) => (
                <div
                  key={item.url}
                  className="flex flex-col gap-2 p-2 border rounded-xl"
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {new URL(item.url).hostname}
                  </div>
                  <div className="prose prose-sm dark:prose-invert line-clamp-3">
                    <MemoizedMarkdown id={item.url} content={item.content} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
