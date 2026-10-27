import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getServerEnv } from "@/lib/env";

import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema> & { $client: Pool };

// Stored on globalThis so hot reloads in development reuse the same pool
// instead of opening new connections on every code change.
const globalForDb = globalThis as typeof globalThis & { receptenboxDb?: Database };

function createDb(): Database {
  const pool = new Pool({ connectionString: getServerEnv().DATABASE_URL });

  // An idle client can fail (e.g. the database restarts). Without a listener
  // that error would crash the process; the pool replaces the client itself.
  pool.on("error", (error) => {
    console.error("Unexpected error on idle database client", error.message);
  });

  return drizzle({ client: pool, schema });
}

/**
 * Returns the shared database client, created on first use.
 * Lazy on purpose: importing this module must not need DATABASE_URL or a
 * running database, so `next build` works without either.
 */
export function getDb(): Database {
  globalForDb.receptenboxDb ??= createDb();
  return globalForDb.receptenboxDb;
}
