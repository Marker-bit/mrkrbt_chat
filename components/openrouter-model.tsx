"use client";

import { RouteIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";

export default function OpenRouterModel({
  setOpenRouterModel,
  openRouterModel
}: {
  setOpenRouterModel: (modelId: string) => void;
  openRouterModel: string | false;
}) {
  const [model, setModel] = useState(openRouterModel || "");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <RouteIcon />
          {openRouterModel && (
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="right">
        <h2 className="text-sm font-semibold">OpenRouter model</h2>
        <p className="text-xs text-muted-foreground mb-2">
          Choose any OpenRouter model, and we will run it for you. Find the
          model{" "}
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            className="underline"
          >
            here
          </a>
          .
        </p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setOpenRouterModel(model);
          }}
        >
          <Input
            id="model"
            placeholder="Any OpenRouter model"
            aria-label="OpenRouter model"
            className="font-mono"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row sm:justify-end">
            <Button size="sm">Save</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
