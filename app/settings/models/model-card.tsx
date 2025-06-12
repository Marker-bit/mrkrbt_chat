import FeatureIcon from "@/components/feature-icon";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Model, PROVIDERS } from "@/lib/models";
import React from "react";

export default function ModelCard({
  model,
  isPinned,
  setPinned
}: {
  model: Model;
  isPinned: boolean;
  setPinned: (isPinned: boolean) => void;
}) {
  return (
    <div className="p-4 border rounded-xl flex gap-2 items-start relative">
      <Switch className="absolute top-4 right-4" checked={isPinned} onCheckedChange={setPinned} />
      <model.icon className="size-8" />
      <div className="flex flex-col gap-2">
        <div className="font-medium">{model.title}</div>
        {model.providers && Object.keys(model.providers).length > 0 && (
          <div className="flex gap-2 items-center">
            {Object.keys(model.providers).map((provider) => {
              const found = PROVIDERS.find((p) => p.id === provider)!;
              return (
                <Tooltip key={provider}>
                  <TooltipTrigger>
                    <Badge variant="outline">
                      <found.icon className="size-4" />
                      {found.title}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary">
                    <div className="flex gap-2 items-center">
                      {model.providers[provider].features.map((feature) => (
                        <FeatureIcon noTooltip key={feature} id={feature} />
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
