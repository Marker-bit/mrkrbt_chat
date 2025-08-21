import { useCodeHighlighter } from "@/hooks/use-code-higlighter";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { isInlineCode, type Element } from "react-shiki";
import { WrapTextIcon } from "./icons/lucide-animated/wrap-text";
import { Button } from "./ui/button";
import { DownloadIcon } from "./icons/lucide-animated/download";
import { CopyIcon } from "./icons/lucide-animated/copy";

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
  text: "txt",
  python: "py",
};

export const CodeHighlight = ({
  className,
  children,
  node,
  ...props
}: CodeHighlightProps) => {
  const code = String(children);
  const language = className?.match(/language-(\w+)/)?.[1];
  if (language === "math") {
    return code;
  }
  const [wordWrap, setWordWrap] = useState(false);

  const isInline = node ? isInlineCode(node) : false;

  // const highlightedCode = useShikiHighlighter(
  //   code,
  //   language,
  //   {
  //     light: "vitesse-light",
  //     dark: "vitesse-dark",
  //     dim: "vitesse-black",
  //   },
  //   {
  //     delay: 150,
  //     defaultColor: resolvedTheme,
  //   }
  // )
  const { highlightedCode } = useCodeHighlighter({
    codeString: code,
    language: language ?? "text",
    shouldHighlight: !isInline,
  });

  const animationRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  const copyAnimationRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  const [copied, setCopied] = useState(false);

  return !isInline ? (
    <div
      className={cn(
        "shiki not-prose relative",
        wordWrap && "[&_pre]:whitespace-pre-wrap"
      )}
    >
      <div className="px-2 py-1 flex gap-2 items-center justify-between bg-primary/20 text-foreground">
        {language || "text"}
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onMouseEnter={() => animationRef.current?.startAnimation()}
            onMouseLeave={() => animationRef.current?.stopAnimation()}
            onClick={() => {
              const link = document.createElement("a");
              link.href =
                "data:text/plain;charset=utf-8," + encodeURIComponent(code);
              const ext = fileExtensions[language || "text"];
              link.download = "code." + (ext ?? language);
              link.click();
            }}
          >
            <DownloadIcon ref={animationRef} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setWordWrap(!wordWrap)}
          >
            <WrapTextIcon wrapEnabled={wordWrap} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onMouseEnter={() => copyAnimationRef.current?.startAnimation()}
            onMouseLeave={() => copyAnimationRef.current?.stopAnimation()}
            onClick={() => {
              navigator.clipboard.writeText(code);
              if (copied) return;
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon ref={copyAnimationRef} />}
          </Button>
        </div>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: !highlightedCode
            ? `<pre className="p-2 px-4 overflow-auto"><code>${code}</code></pre>`
            : highlightedCode,
        }}
      />
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
