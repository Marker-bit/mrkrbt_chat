import { config } from "dotenv";

export function initEnv() {
  return config({ path: '.env', quiet: true });
}