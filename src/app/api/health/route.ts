import { sql } from "drizzle-orm";
import { connection } from "next/server";

import { getDb } from "@/db";

const noStore = { "Cache-Control": "no-store" };

/**
 * Health check: reports whether the app can reach the database.
 * The response never contains error details; those go to the server log.
 */
export async function GET(): Promise<Response> {
  // With cacheComponents, GET handlers are prerendered at build time until they
  // hit request-time work. Stopping here keeps the build away from the database
  // and makes every request run the check for real.
  await connection();

  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok" }, { headers: noStore });
  } catch (error) {
    console.error("Health check failed: database unreachable:", rootCauseMessage(error));
    return Response.json({ status: "error" }, { status: 503, headers: noStore });
  }
}

// Drizzle wraps driver errors as "Failed query: ..."; the useful part
// (e.g. ECONNREFUSED) is the original error in `cause`. When a host resolves
// to several addresses, Node throws an AggregateError with an empty message.
function rootCauseMessage(error: unknown): string {
  if (!(error instanceof Error)) return "unknown error";
  const cause = error.cause instanceof Error ? error.cause : error;
  if (cause.message) return cause.message;
  if (cause instanceof AggregateError) {
    return cause.errors.map((e) => (e instanceof Error ? e.message : String(e))).join("; ");
  }
  return cause.name;
}
