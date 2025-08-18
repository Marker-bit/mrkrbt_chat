// taken from intern3.chat since the cloneathon ended
// https://github.com/intern3-chat/intern3-chat/blob/main/src/hooks/use-code-highlighter.ts

import { useColor } from "@/components/color-provider";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { type Highlighter, createHighlighter } from "shiki";

// Create a singleton highlighter instance
let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = async (): Promise<Highlighter> => {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = createHighlighter({
    themes: [
      "vitesse-dark",
      "vitesse-light",
      "catppuccin-latte",
      "catppuccin-frappe",
    ],
    langs: [
      "javascript",
      "typescript",
      "jsx",
      "tsx",
      "python",
      "java",
      "c",
      "cpp",
      "csharp",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "scala",
      "html",
      "css",
      "scss",
      "sass",
      "json",
      "xml",
      "yaml",
      "markdown",
      "bash",
      "shell",
      "sql",
      "dockerfile",
      "nginx",
      "apache",
      "plaintext",
    ],
  });

  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
};

interface UseCodeHighlighterOptions {
  codeString: string;
  language: string;
  inline?: boolean;
  shouldHighlight?: boolean;
}

export const useCodeHighlighter = ({
  codeString,
  language,
  shouldHighlight = true,
}: UseCodeHighlighterOptions) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isHighlighting, setIsHighlighting] = useState(true);
  const { resolvedTheme } = useTheme();
  const { color } = useColor();

  useEffect(() => {
    const highlightCode = async () => {
      if (!shouldHighlight || !codeString) {
        setIsHighlighting(false);
        return;
      }

      try {
        setIsHighlighting(true);
        const highlighter = await getHighlighter();

        // Check if the language is supported, fallback to plaintext if not
        const supportedLangs = highlighter.getLoadedLanguages();
        const langToUse = supportedLangs.includes(language)
          ? language
          : "plaintext";

        const highlighted = highlighter.codeToHtml(codeString, {
          lang: langToUse,
          theme:
            resolvedTheme === "dark"
              ? color === "pink"
                ? "catppuccin-frappe"
                : "vitesse-dark"
              : color === "pink"
                ? "catppuccin-latte"
                : "vitesse-light",
          // transformers: [
          //     {
          //         pre(node) {
          //             // Remove default styling to use our custom styles
          //             node.properties.style = undefined
          //             node.properties.class = cn(
          //                 "relative my-0 max-w-full resize-none overflow-x-auto overflow-y-auto text-wrap rounded-t-none rounded-b-lg bg-[#0d1117] py-3 ps-[0.75rem] pe-[0.75rem] text-[#e6edf3] text-[0.8125rem] leading-4",
          //                 !expanded && "max-h-72"
          //             )
          //         },
          //         code(node) {
          //             node.properties.class = cn(
          //                 wrapped
          //                     ? "whitespace-pre-wrap break-words"
          //                     : "whitespace-pre break-keep"
          //             )
          //         }
          //     }
          // ]
        });

        setHighlightedCode(highlighted);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text if highlighting fails
        setHighlightedCode(`<pre><code>${codeString}</code></pre>`);
      } finally {
        setIsHighlighting(false);
      }
    };

    highlightCode();
  }, [codeString, language, shouldHighlight, resolvedTheme, color]);

  return {
    highlightedCode,
    isHighlighting,
  };
};
