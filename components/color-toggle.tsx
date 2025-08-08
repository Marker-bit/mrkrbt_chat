"use client"

import { CheckIcon, PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useColor } from "./color-provider";

export function ColorToggle() {
  const { color, setColor } = useColor()

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <PaletteIcon className="size-4" />
              <span className="sr-only">Toggle color</span>
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setColor("pink")}>
            Pink
            {color === "pink" && (
              <CheckIcon className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColor("neutral")}>
            Neutral
            {color === "neutral" && (
              <CheckIcon className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
        <TooltipContent>
          <span className="text-xs">Color</span>
        </TooltipContent>
      </Tooltip>
    </DropdownMenu>
  )
}
