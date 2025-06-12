"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteChats } from "@/lib/actions";
import { Chat } from "@/lib/db/db-types";
import { chat } from "@/lib/db/schema";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function SettingsChatList({
  chats: chatsPromise,
}: {
  chats: Promise<Chat[]>;
}) {
  const chats = use(chatsPromise);

  const [checked, setChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const exportChats = () => {
    const selectedChats = chats.filter((chat) => checked.includes(chat.id));
    const data = JSON.stringify(
      selectedChats.map((chat) => ({
        ...chat,
        messages: undefined,
        state: undefined,
        userId: undefined,
      })),
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chats.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteChatsRun = async () => {
    setLoading(true);
    await deleteChats(checked);
    setLoading(false);
    setChecked([]);
    router.refresh();
  };

  return (
    <div className="border rounded-xl flex flex-col divide-y">
      <div className="flex justify-between items-center py-2 px-4">
        <div className="flex gap-2 items-center">
          <Checkbox
            checked={
              checked.length === chats.length
                ? true
                : checked.length > 0
                ? "indeterminate"
                : false
            }
            onCheckedChange={(checked) =>
              setChecked(checked ? chats.map((chat) => chat.id) : [])
            }
          />
          <div className="flex flex-col leading-tight">
            <div className="font-bold">{checked.length} selected</div>
            <div className="text-muted-foreground/80 text-xs">
              from {chats.length}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            disabled={checked.length === 0}
            onClick={exportChats}
          >
            <DownloadIcon />
            Export
          </Button>
          <Button
            disabled={checked.length === 0 || loading}
            onClick={deleteChatsRun}
          >
            <TrashIcon />
            Delete
          </Button>
        </div>
      </div>
      {chats.map((chat) => (
        <div key={chat.id} className="py-2 px-4 flex gap-2 items-center">
          <Checkbox
            checked={checked.includes(chat.id)}
            onCheckedChange={(checked) =>
              setChecked((cur) =>
                checked === true
                  ? [...cur, chat.id]
                  : cur.filter((id) => id !== chat.id)
              )
            }
          />
          {chat.title}
          <div className="ml-auto text-xs text-muted-foreground/80 font-mono">
            {new Date(chat.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
