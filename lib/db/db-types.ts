import type { UIDataTypes, UIMessage } from "ai";
import { attachment, chat } from "./schema";
import { ModelData } from "../models";
import { Tools } from "../tools";

export type Chat = typeof chat.$inferSelect;

export type Message = UIMessage<{model: ModelData}, UIDataTypes, Tools>;

export type Attachment = typeof attachment.$inferSelect;

export type APIKeys = Record<string, string>;