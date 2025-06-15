import { saveChatModelAsCookie } from "@/lib/actions";
import { ModelData } from "@/lib/models";
import { useState } from "react";

export function useSelectedModelData({initialModelData}: {initialModelData: ModelData}): {modelData: ModelData, setModelData: (modelData: ModelData) => void} {
  const [localModelData, setLocalModelData] = useState<ModelData>(initialModelData);

  const setModelData = async (modelData: ModelData) => {
    setLocalModelData(modelData);
    await saveChatModelAsCookie(modelData);
  }

  return {modelData: localModelData, setModelData};
}