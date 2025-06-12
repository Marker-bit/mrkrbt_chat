import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { isInlineCode, useShikiHighlighter, type Element } from "react-shiki";
import { Button } from "./ui/button";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  TextIcon,
  WrapTextIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CodeHighlightProps {
  className?: string | undefined;
  children?: ReactNode | undefined;
  node?: Element | undefined;
}

const fileExtensions: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  html: "html",
  css: "css",
  json: "json",
  md: "md",
  markdown: "md",
  txt: "txt",
  text: "txt"
}

export const CodeHighlight = ({
  className,
  children,
  node,
  ...props
}: CodeHighlightProps) => {
  const code = String(children);
  const language = className?.match(/language-(\w+)/)?.[1];
  const [wordWrap, setWordWrap] = useState(false);
  const {resolvedTheme} = useTheme()

  const isInline = node ? isInlineCode(node) : false;

  const highlightedCode = useShikiHighlighter(
    code,
    language,
    {
      light: "vitesse-light",
      dark: "vitesse-dark",
      dim: "vitesse-black",
    },
    {
      delay: 150,
      defaultColor: resolvedTheme,
    }
  );

  const [copied, setCopied] = useState(false);

  return !isInline ? (
    <div
      className={cn(
        "shiki not-prose relative [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-transparent!",
        wordWrap && "[&_pre]:whitespace-pre-wrap"
      )}
    >
      <div className="p-2 px-4 flex gap-2 items-center justify-between bg-secondary text-black dark:text-white">
        {language || "text"}
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" onClick={() => {
            const link = document.createElement("a");
            link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(code);
            const ext = fileExtensions[language || "text"];
            link.download = "code." + (ext ?? "txt");
            link.click();
          }}>
            <DownloadIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWordWrap(!wordWrap)}
          >
            {wordWrap ? <WrapTextIcon /> : <TextIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(code);
              if (copied) return;
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
      </div>
      <div className="p-2 px-4 wrap-anywhere text-wrap">{highlightedCode}</div>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
