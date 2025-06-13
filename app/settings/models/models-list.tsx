"use client";

import FeatureIcon from "@/components/feature-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { FeatureId, FEATURES, MODELS } from "@/lib/models";
import { RECOMMENDED_MODELS } from "@/lib/rec-models";
import { fetcher } from "@/lib/utils";
import { CheckIcon, CopyXIcon, FilterIcon } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import ModelCard from "./model-card";

export default function ModelsList({
  initialFavouriteModels,
}: {
  initialFavouriteModels: string[];
}) {
  const { data: favouriteModels, mutate } = useSWR<string[]>(
    "/api/favourite-models",
    fetcher,
    { fallbackData: initialFavouriteModels }
  );
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureId[]>([]);

  const filteredModels = MODELS.filter((model) =>
    selectedFeatures.every((feature) => model.features.includes(feature))
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <div className="sm:hidden">
                <FilterIcon />
              </div>
              <div className="hidden sm:block">Filter by features</div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-64">
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
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.updateUser({
                favouriteModels: RECOMMENDED_MODELS,
              });
              mutate(RECOMMENDED_MODELS);
            }}
            className="hidden sm:block"
          >
            Select recommended models
          </Button>
          <Button
            variant="outline"
            disabled={favouriteModels?.length === 0}
            onClick={async () => {
              await authClient.updateUser({
                favouriteModels: [],
              });
              mutate([]);
            }}
          >
            <div className="sm:hidden">
              <CopyXIcon />
            </div>
            <div className="hidden sm:block">Unselect all</div>
          </Button>
        </div>
      </div>
      {filteredModels.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          isPinned={
            favouriteModels ? favouriteModels.includes(model.id) : false
          }
          setPinned={async (isPinned: boolean) => {
            await authClient.updateUser({
              favouriteModels: isPinned
                ? [...favouriteModels!, model.id]
                : favouriteModels!.filter((m) => m !== model.id),
            });
            mutate(() =>
              isPinned
                ? [...favouriteModels!, model.id]
                : favouriteModels!.filter((m) => m !== model.id)
            );
          }}
        />
      ))}
    </div>
  );
}
