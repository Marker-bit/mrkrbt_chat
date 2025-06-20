"use client";

import { marked } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { CodeHighlight } from "./code-highlight";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[
          [remarkMath, { singleDollarTextMath: false }],
          remarkBreaks,
          remarkGfm,
        ]}
        rehypePlugins={[rehypeMathjax]}
        components={{
          code: CodeHighlight,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
