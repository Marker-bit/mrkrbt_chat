import type { Message as MessageType } from "ai";
import { chat } from "./schema";
import { ModelData } from "../models";

export type Chat = typeof chat.$inferSelect;

export type Message = MessageType & {modelData?: ModelData};
