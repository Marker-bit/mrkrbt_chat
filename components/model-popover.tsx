"use client";

import {
  BrainIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  EyeIcon,
  FileTextIcon,
  FilterIcon,
  GlobeIcon,
  SearchIcon,
} from "lucide-react";
import {
  startTransition,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MODELS } from "@/lib/models";
import { cn } from "@/lib/utils";
import { saveChatModelAsCookie } from "@/lib/actions";

export default function ModelPopover({
  selectedModelId,
}: {
  selectedModelId: string;
}) {
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const favouriteModels = MODELS.slice(0, 6);

  const availableChatModels = MODELS;

  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ),
    [optimisticModelId, availableChatModels]
  );

  const setModel = (modelId: string) => {
    setOpen(false);

    startTransition(() => {
      setOptimisticModelId(modelId);
      saveChatModelAsCookie(modelId);
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" ref={buttonRef}>
            <div>{selectedChatModel?.title}</div>
            {selectedChatModel?.additionalTitle && (
              <div className="text-xs text-muted-foreground">
                ({selectedChatModel.additionalTitle})
              </div>
            )}
            <ChevronUpIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(big ? "w-[680px]" : "w-[420px]", "p-0 flex flex-col")}
          style={{
            height: big
              ? `calc(100vh - ${buttonRef.current?.offsetTop || 0}px)`
              : undefined,
          }}
          align="start"
        >
          <div className="flex gap-2 items-center px-4 py-3 border-b shrink-0">
            <SearchIcon className="size-4" />
            <input
              type="text"
              placeholder="Search models..."
              className="w-full outline-none text-sm"
            />
          </div>
          {big ? (
            <div className="grid grid-cols-5 auto-rows-[160px] gap-2 p-2 grow overflow-auto">
              {MODELS.map((model) => (
                <Button
                  key={model.id + "-big"}
                  variant="outline"
                  className="flex flex-col gap-2 text-start hover:bg-accent h-full"
                  onClick={() => setModel(model.id)}
                >
                  <model.icon className="size-8" />
                  <div className="flex flex-col text-center">
                    <div className="font-bold">{model.model}</div>
                    <div className="text-sm">{model.version}</div>
                    {model.additionalTitle && (
                      <div className="text-primary-foreground text-xs">
                        ({model.additionalTitle})
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center justify-center mt-auto">
                    {model.features.map((feature) =>
                      feature === "image" ? (
                        <div
                          key={feature}
                          className="p-1 rounded-md bg-teal-500/30 text-teal-500"
                        >
                          <EyeIcon className="size-4" />
                        </div>
                      ) : feature === "search" ? (
                        <div
                          key={feature}
                          className="p-1 rounded-md bg-blue-500/30 text-blue-500"
                        >
                          <GlobeIcon className="size-4" />
                        </div>
                      ) : feature === "attachments" ? (
                        <div
                          key={feature}
                          className="p-1 rounded-md bg-indigo-500/30 text-indigo-500"
                        >
                          <FileTextIcon className="size-4" />
                        </div>
                      ) : (
                        feature === "reasoning" && (
                          <div
                            key={feature}
                            className="p-1 rounded-md bg-indigo-500/30 text-indigo-500"
                          >
                            <BrainIcon className="size-4" />
                          </div>
                        )
                      )
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2 grow overflow-auto">
              {favouriteModels.map((model) => (
                <Button
                  key={model.id}
                  variant="ghost"
                  className="justify-start text-start hover:bg-accent h-12"
                  onClick={() => setModel(model.id)}
                >
                  <model.icon className="text-primary size-4" />
                  {model.title}
                  {model.additionalTitle && ` (${model.additionalTitle})`}
                  {selectedModelId === model.id ? (
                    <div className="ml-auto">
                      <CheckIcon className="size-4" />
                    </div>
                  ) : (
                    <div className="ml-auto flex gap-2 items-center">
                      {model.features.map((feature) =>
                        feature === "image" ? (
                          <div
                            key={feature}
                            className="p-1 rounded-md bg-teal-500/30 text-teal-500"
                          >
                            <EyeIcon className="size-4" />
                          </div>
                        ) : feature === "search" ? (
                          <div
                            key={feature}
                            className="p-1 rounded-md bg-blue-500/30 text-blue-500"
                          >
                            <GlobeIcon className="size-4" />
                          </div>
                        ) : feature === "attachments" ? (
                          <div
                            key={feature}
                            className="p-1 rounded-md bg-indigo-500/30 text-indigo-500"
                          >
                            <FileTextIcon className="size-4" />
                          </div>
                        ) : (
                          feature === "reasoning" && (
                            <div
                              key={feature}
                              className="p-1 rounded-md bg-indigo-500/30 text-indigo-500"
                            >
                              <BrainIcon className="size-4" />
                            </div>
                          )
                        )
                      )}
                    </div>
                  )}
                </Button>
              ))}
            </div>
          )}

          <div className="p-2 border-t flex justify-between shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setBig(!big)}>
              {big ? (
                <>
                  <ChevronLeftIcon />
                  Favorites
                </>
              ) : (
                <>
                  <ChevronUpIcon />
                  Show all
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <FilterIcon />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
