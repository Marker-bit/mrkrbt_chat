import { FEATURES } from "@/lib/models";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function FeatureIcon({
  id,
  className,
  noTooltip = false,
}: {
  id: string;
  className?: string;
  noTooltip?: boolean;
}) {
  const feature = useMemo(
    () => FEATURES.find((feature) => feature.id === id)!,
    [id]
  );

  if (noTooltip) {
    return (
      <div
        className={cn("p-1 rounded-md bg-(--color)/20", className)}
        style={{ "--color": feature.color } as React.CSSProperties}
      >
        <feature.icon
          className="size-4 text-(--color)"
          style={{ "--color": feature.color } as React.CSSProperties}
        />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("p-1 rounded-md bg-(--color)/20", className)}
          style={{ "--color": feature.color } as React.CSSProperties}
        >
          <feature.icon
            className="size-4 text-(--color)"
            style={{ "--color": feature.color } as React.CSSProperties}
          />
        </div>
      </TooltipTrigger>
      {feature.description && (
        <TooltipContent>{feature.description}</TooltipContent>
      )}
    </Tooltip>
  );
}
