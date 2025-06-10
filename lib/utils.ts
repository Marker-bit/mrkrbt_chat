import { CoreAssistantMessage, CoreToolMessage } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export const fetcher = (url: string) => fetch(url).then(res => res.json())

export const convertFileArrayToFileList = (fileArray: File[]) => {
  const dataTransfer = new DataTransfer();
  fileArray.forEach(file => {
    dataTransfer.items.add(file);
  });
  return dataTransfer.files;
}