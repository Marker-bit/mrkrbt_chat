"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface WrapTextIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface WrapTextIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  wrapEnabled: boolean;
}

const WrapText = forwardRef<WrapTextIconHandle, WrapTextIconProps>(
  (
    { onMouseEnter, onMouseLeave, wrapEnabled, className, size = 28, ...props },
    ref
  ) => {
    return (
      <div className={cn(className)} {...props}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          width={size}
          height={size}
          initial="normal"
        >
          <path d="M3 6h18" />
          <motion.path
            d="M3 12h15a3 3 0 1 1 0 6h-4"
            variants={{
              disabled: {
                pathLength: 0.5,
              },
              enabled: {
                pathLength: 1,
              },
            }}
            transition={{ duration: 0.3 }}
            animate={wrapEnabled ? "enabled" : "disabled"}
          />
          <path d="M3 18h7" />
          <motion.path
            d="m16 16-2 2 2 2"
            variants={{
              disabled: {
                pathLength: 0,
                pathOffset: 0.5,
                opacity: 0,
              },
              enabled: {
                // pathLength: [1, 0, 1],
                pathLength: 1,
                pathOffset: 0,
                opacity: 1,
                transition: {
                  delay: 0.1,
                },
              },
            }}
            transition={{ duration: 0.3 }}
            animate={wrapEnabled ? "enabled" : "disabled"}
          />
        </motion.svg>
      </div>
    );
  }
);

WrapText.displayName = "WrapTextIcon";

export { WrapText as WrapTextIcon };
