import FeatureIcon from "@/components/feature-icon";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { findProviderById } from "@/lib/ai/providers/actions";
import { ProviderId } from "@/lib/ai/providers/types";
import { Model } from "@/lib/models";
import React from "react";

export default function ModelCard({
  model,
  isPinned,
  setPinned,
}: {
  model: Model;
  isPinned: boolean;
  setPinned: (isPinned: boolean) => void;
}) {
  return (
    <div className="p-4 border rounded-xl flex gap-2 items-start relative">
      <Switch
        className="absolute top-4 right-4"
        checked={isPinned}
        onCheckedChange={setPinned}
      />
      <model.icon className="size-8" />
      <div className="flex flex-col gap-2">
        <div className="font-medium">{model.title}</div>
        {model.additionalTitle && (
          <div className="text-xs text-muted-foreground -mt-2">
            ({model.additionalTitle})
          </div>
        )}
        {model.providers && Object.keys(model.providers).length > 0 && (
          <div className="flex gap-2 items-center">
            {Object.keys(model.providers).map((p) => {
              const provider = p as ProviderId
              const found = findProviderById(provider)!;
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
                      {model.providers[provider]!.features.map((feature) => (
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
