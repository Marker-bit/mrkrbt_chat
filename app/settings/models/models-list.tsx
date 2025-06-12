"use client";

import { MODELS } from "@/lib/models";
import ModelCard from "./model-card";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ModelsList({
  initialFavouriteModels,
}: {
  initialFavouriteModels: string[];
}) {
  const { data: favouriteModels } = useSWR<string[]>(
    "/api/favourite-models",
    fetcher,
    { fallbackData: initialFavouriteModels }
  );
  return (
    <div className="flex flex-col gap-2">
      {MODELS.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          isPinned={
            favouriteModels ? favouriteModels.includes(model.id) : false
          }
          setPinned={async (isPinned: boolean) => {
            const updatePromise = authClient.updateUser({
              favouriteModels: isPinned
                ? [...favouriteModels!, model.id]
                : favouriteModels!.filter((m) => m !== model.id),
            });

            toast.promise(updatePromise, {
              loading: "Saving...",
              success: () => {
                mutate(() =>
                  isPinned
                    ? [...favouriteModels!, model.id]
                    : favouriteModels!.filter((m) => m !== model.id)
                );
                return "Saved successfully";
              },
              error: "Failed to save",
            });
          }}
        />
      ))}
    </div>
  );
}
