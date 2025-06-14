"use client";

import { saveChatModelAsCookie } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import {
  effortToString,
  FeatureId,
  FEATURES,
  ModelData,
  MODELS,
  PROVIDERS,
} from "@/lib/models";
import { cn, fetcher } from "@/lib/utils";
import {
  BrainCircuitIcon,
  BrainCogIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  FilterIcon,
  PinIcon,
  PinOffIcon,
  RouteIcon,
  SearchIcon,
  Tally1Icon,
  Tally2Icon,
  Tally3Icon,
} from "lucide-react";
import {
  startTransition,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import useSWR from "swr";
import FeatureIcon from "./feature-icon";
import OpenRouterModel from "./openrouter-model";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ModelPopover({
  selectedModelData,
  apiKeys,
}: {
  selectedModelData: ModelData;
  apiKeys: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureId[]>([]);
  const [search, setSearch] = useState("");
  const {
    data: favouriteModels,
    isLoading,
    mutate,
  } = useSWR<string[]>("/api/favourite-models", fetcher, { fallbackData: [] });

  // let favouriteModels = MODELS.slice(0, 6);

  let filteredModels = MODELS.filter((model) =>
    favouriteModels ? !favouriteModels?.includes(model.id) : true
  );
  let filteredFavouriteModels = favouriteModels!.map(
    (model) => MODELS.find((m) => m.id === model)!
  );

  if (selectedFeatures.length > 0) {
    filteredModels = filteredModels.filter((model) =>
      selectedFeatures.some((feature) => model.features.includes(feature))
    );
    filteredFavouriteModels = filteredFavouriteModels.filter((model) =>
      selectedFeatures.some((feature) => model.features.includes(feature))
    );
  }

  if (search) {
    filteredModels = filteredModels.filter((model) =>
      model.title.toLowerCase().includes(search.toLowerCase())
    );
    filteredFavouriteModels = filteredFavouriteModels.filter((model) =>
      model.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const [optimisticModelData, setOptimisticModelData] =
    useOptimistic(selectedModelData);

  const openRouterModel =
    optimisticModelData.modelId.startsWith("openrouter:") &&
    optimisticModelData.modelId.slice(11);

  const selectedChatModel = useMemo(
    () =>
      MODELS.find((chatModel) => chatModel.id === optimisticModelData.modelId),
    [optimisticModelData, MODELS]
  );

  const setModel = (modelId: string) => {
    setOpen(false);

    startTransition(() => {
      const chosenModel = MODELS.find((model) => model.id === modelId)!;
      const modelAvailableProviders = Object.keys(chosenModel.providers);
      let provider: string | undefined;
      if (
        !modelAvailableProviders.includes(
          optimisticModelData.options.provider || ""
        )
      ) {
        provider = Object.keys(chosenModel.providers).find(
          (provider) => provider in apiKeys && apiKeys[provider].length > 0
        );
      } else {
        provider = optimisticModelData.options.provider;
      }
      const newModelData: ModelData = {
        ...optimisticModelData,
        modelId,
        options: { ...optimisticModelData.options, provider },
      };
      setOptimisticModelData(newModelData);
      saveChatModelAsCookie(newModelData);
    });
  };

  const setOpenRouterModel = (modelId: string) => {
    setOpen(false);

    startTransition(() => {
      const newModelData: ModelData = {
        ...optimisticModelData,
        modelId: `openrouter:${modelId}`,
        options: { ...optimisticModelData.options, provider: "openrouter" },
      };
      setOptimisticModelData(newModelData);
      saveChatModelAsCookie(newModelData);
    });
  };

  const setEffort = (effort: ModelData["options"]["effort"]) => {
    setOpen(false);
    startTransition(() => {
      setOptimisticModelData({
        ...optimisticModelData,
        options: { ...optimisticModelData.options, effort },
      });
      saveChatModelAsCookie({
        ...optimisticModelData,
        options: { ...optimisticModelData.options, effort },
      });
    });
  };

  const setProvider = (providerId: string) => {
    startTransition(() => {
      setOptimisticModelData({
        ...optimisticModelData,
        options: { ...optimisticModelData.options, provider: providerId },
      });
      saveChatModelAsCookie({
        ...optimisticModelData,
        options: { ...optimisticModelData.options, provider: providerId },
      });
    });
  };

  const selectedProvider = useMemo(
    () =>
      optimisticModelData.options.provider
        ? PROVIDERS.find(
            (provider) => provider.id === optimisticModelData.options.provider
          )!
        : null,
    [optimisticModelData, PROVIDERS]
  );

  const setPinned = async (pinned: boolean, modelId: string) => {
    const updatePromise = authClient.updateUser({
      favouriteModels: pinned
        ? [...favouriteModels!, modelId]
        : favouriteModels!.filter((model) => model !== modelId),
    });

    toast.promise(updatePromise, {
      loading: "Saving...",
      success: () => {
        mutate(() =>
          pinned
            ? [...favouriteModels!, modelId]
            : favouriteModels!.filter((model) => model !== modelId)
        );
        return "Saved successfully";
      },
      error: "Failed to save",
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-sm" ref={buttonRef}>
            <div className="hidden sm:flex gap-2 items-center">
              {openRouterModel ? (
                <div className="font-mono">{openRouterModel}</div>
              ) : (
                <>
                  <div>{selectedChatModel?.title}</div>
                  {selectedChatModel?.additionalTitle && (
                    <div className="text-xs text-muted-foreground max-sm:hidden">
                      ({selectedChatModel.additionalTitle})
                    </div>
                  )}
                </>
              )}
              <ChevronUpIcon className="size-4" />
            </div>
            <div className="sm:hidden">
              <BrainCircuitIcon />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            big ? "w-[680px]" : "w-[420px]",
            "max-w-screen max-h-[calc(100vh-80px)] p-0 flex flex-col"
          )}
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
                  setBig(true);
                }
                setSearch(e.target.value);
              }}
            />
          </div>
          {big ? (
            <div className="flex flex-col gap-2 overflow-y-auto grow p-4 w-full">
              <div className="text-primary text-lg flex gap-2 items-center">
                <PinIcon className="size-4" />
                Favorites
              </div>
              <div className="grid grid-cols-5 auto-rows-[160px] gap-2">
                {filteredFavouriteModels.map((model) => (
                  <div
                    className="h-full w-full relative group"
                    key={model.id + "-big"}
                  >
                    <Button
                      variant="outline"
                      className="flex flex-col gap-2 text-start hover:bg-accent w-full h-full relative p-4"
                      onClick={() => setModel(model.id)}
                    >
                      <model.icon className="size-8" />
                      <div className="flex flex-col text-center">
                        <div className="font-bold">{model.model}</div>
                        <div className="text-sm">{model.version}</div>
                        {model.additionalTitle && (
                          <div className="text-primary text-xs">
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
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 z-10 translate-y-[20%] transition bg-background p-1 rounded-xl pointer-events-none group-hover:pointer-events-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setPinned(false, model.id)}
                      >
                        <PinOffIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-primary text-lg">Others</div>
              <div className="grid grid-cols-5 auto-rows-[160px] gap-2">
                {filteredModels.map((model) => (
                  <div
                    className="h-full w-full relative group"
                    key={model.id + "-big"}
                  >
                    <Button
                      variant="outline"
                      className="flex flex-col gap-2 text-start hover:bg-accent w-full h-full relative p-4"
                      onClick={() => setModel(model.id)}
                    >
                      <model.icon className="size-8" />
                      <div className="flex flex-col text-center">
                        <div className="font-bold">{model.model}</div>
                        <div className="text-sm">{model.version}</div>
                        {model.additionalTitle && (
                          <div className="text-primary text-xs">
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
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 z-10 translate-y-[20%] transition bg-background p-1 rounded-xl pointer-events-none group-hover:pointer-events-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setPinned(true, model.id)}
                      >
                        <PinIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2 grow overflow-auto">
              {isLoading || !favouriteModels ? (
                <></>
              ) : (
                filteredFavouriteModels.map((model) => {
                  return (
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
                        {selectedModelData.modelId === model.id && (
                          <CheckIcon className="size-4" />
                        )}
                      </div>
                    </Button>
                  );
                })
              )}
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
            <div className="flex gap-2 items-center">
              {apiKeys && "openrouter" in apiKeys && apiKeys["openrouter"] && (
                <OpenRouterModel
                  openRouterModel={openRouterModel}
                  setOpenRouterModel={setOpenRouterModel}
                />
              )}
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
                  className="max-w-64"
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
          </div>
        </PopoverContent>
      </Popover>
      {!openRouterModel && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  {selectedProvider ? (
                    <>
                      <selectedProvider.icon />
                      <div className="max-sm:hidden">
                        {selectedProvider.title}
                      </div>
                    </>
                  ) : (
                    <>
                      <RouteIcon />
                      <div className="max-sm:hidden">Provider</div>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <DropdownMenuContent className="min-w-72">
              {selectedChatModel &&
                Object.keys(selectedChatModel.providers).map((providerId) => {
                  const provider = PROVIDERS.find((p) => p.id === providerId)!;
                  const hasApiKey =
                    provider.id in apiKeys && apiKeys[provider.id].length > 0;
                  return (
                    <DropdownMenuItem
                      key={provider.id}
                      onClick={() => setProvider(provider.id)}
                      disabled={!hasApiKey}
                    >
                      <provider.icon className="size-4" />
                      {provider.title}
                      <div className="ml-auto flex gap-2 items-center">
                        {selectedChatModel.providers[provider.id].features.map(
                          (feature) => {
                            const realFeature = FEATURES.find(
                              (f) => f.id === feature
                            );
                            return (
                              realFeature?.displayInModels && (
                                <FeatureIcon key={feature} id={feature} />
                              )
                            );
                          }
                        )}
                        {optimisticModelData.options.provider ===
                          provider.id && <CheckIcon className="size-4" />}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
            <TooltipContent>Provider</TooltipContent>
          </Tooltip>
        </DropdownMenu>
      )}
      {selectedChatModel?.features.includes("effort-control") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <BrainCogIcon />
              <div className="max-sm:hidden">
                {effortToString(selectedModelData.options.effort)}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEffort("low")}>
              <Tally1Icon />
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEffort("medium")}>
              <Tally2Icon />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEffort("high")}>
              <Tally3Icon />
              High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
