import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

import { getServerEnv } from "./src/lib/env";

// drizzle-kit does not read .env.local itself. Load it only when present:
// in CI and deployments the variables come from the environment instead.
// Variables that are already set are never overridden.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: getServerEnv().DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
