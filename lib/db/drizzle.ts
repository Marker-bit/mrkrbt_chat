import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { initEnv } from "../env";

initEnv()

export const db = drizzle(process.env.DATABASE_URL!, {schema});
