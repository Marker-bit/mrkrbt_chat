import { db } from "@/lib/db/drizzle";
import { chat } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import SettingsChatList from "./settings-chat-list";

export default function Page() {
  const chats = db.select().from(chat).orderBy(desc(chat.createdAt));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">History & Export</h1>
      <SettingsChatList chats={chats} />
    </div>
  );
}