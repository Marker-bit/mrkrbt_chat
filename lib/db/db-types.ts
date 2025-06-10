import type { Message as MessageType } from "ai";
import { chat } from "./schema";

export type Chat = typeof chat.$inferSelect;

export type Message = MessageType & { modelId?: string };
