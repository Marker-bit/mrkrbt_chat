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
import { FEATURES, MODELS } from "@/lib/models";
import { cn } from "@/lib/utils";
import { saveChatModelAsCookie } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import FeatureIcon from "./feature-icon";

export default function ModelPopover({
  selectedModelId,
}: {
  selectedModelId: string;
}) {
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  let favouriteModels = MODELS.slice(0, 6);

  let filteredModels = MODELS;

  if (selectedFeatures.length > 0) {
    filteredModels = filteredModels.filter(
      (model) =>
        selectedFeatures.some((feature) => model.features.includes(feature))
    );
    favouriteModels = favouriteModels.filter(
      (model) =>
        selectedFeatures.some((feature) => model.features.includes(feature))
    );
  }

  if (search) {
    filteredModels = filteredModels.filter((model) =>
      model.title.toLowerCase().includes(search.toLowerCase())
    );
    favouriteModels = favouriteModels.filter((model) =>
      model.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedChatModel = useMemo(
    () => MODELS.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId, MODELS]
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
              value={search}
              onChange={(e) => {
                if (search.length === 0) {
                  setBig(true)
                }
                setSearch(e.target.value)
              }}
            />
          </div>
          {big ? (
            <div className="grid grid-cols-5 auto-rows-[160px] gap-2 p-2 grow overflow-auto">
              {filteredModels.map((model) => (
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
                    {model.features.map((feature) => {
                      const realFeature = FEATURES.find(
                        (f) => f.id === feature
                      );
                      return (
                        realFeature?.displayInModels && (
                          <FeatureIcon key={feature} id={feature} />
                        )
                      );
                    })}
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
                  <div className="ml-auto flex gap-2 items-center">
                    {model.features.map((feature) => {
                      const realFeature = FEATURES.find(
                        (f) => f.id === feature
                      );
                      return (
                        realFeature?.displayInModels && (
                          <FeatureIcon key={feature} id={feature} />
                        )
                      );
                    })}
                    {selectedModelId === model.id && (
                      <CheckIcon className="size-4" />
                    )}
                  </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <FilterIcon />
                  {selectedFeatures.length > 0 && (
                    <div className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={20}
                className="w-64"
              >
                {selectedFeatures.length > 0 && (
                  <>
                    <DropdownMenuItem
                      onClick={(evt) => {
                        evt.preventDefault();
                        setSelectedFeatures([]);
                      }}
                    >
                      Clear filters
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {FEATURES.map((feature) => (
                  <DropdownMenuItem
                    key={feature.id}
                    onClick={(evt) => {
                      evt.preventDefault();
                      setSelectedFeatures((prev) =>
                        prev.includes(feature.id)
                          ? prev.filter((id) => id !== feature.id)
                          : [...prev, feature.id]
                      );
                    }}
                  >
                    <FeatureIcon className="mr-2" id={feature.id} />
                    {feature.name}
                    {selectedFeatures.includes(feature.id) && (
                      <div className="ml-auto">
                        <CheckIcon className="size-4" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
