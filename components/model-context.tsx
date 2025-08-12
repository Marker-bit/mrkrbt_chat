"use client";

import { DEFAULT_MODEL_DATA, ModelData } from "@/lib/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  modelData: ModelData;
  setModelData: (val: ModelData) => void;
  getModelData: () => ModelData;
}

export const useSelectedModelData = create<StoreState>()(
  persist(
    (set, get) => ({
      modelData: DEFAULT_MODEL_DATA,
      setModelData: (val) => set({ modelData: val }),
      getModelData: () => get().modelData,
    }),
    {
      name: "modelData", // key in localStorage
    }
  )
);
