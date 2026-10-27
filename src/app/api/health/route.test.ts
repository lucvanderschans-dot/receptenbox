import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDb } from "@/db";

import { GET } from "./route";

vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));
vi.mock("@/db", () => ({ getDb: vi.fn() }));

function mockDb(execute: () => Promise<unknown>) {
  vi.mocked(getDb).mockReturnValue({ execute } as unknown as ReturnType<typeof getDb>);
}

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 when the database answers", async () => {
    mockDb(async () => ({ rows: [{ "?column?": 1 }] }));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 without error details when the database fails", async () => {
    mockDb(async () => {
      // Shape of a Drizzle query error wrapping the driver error.
      throw new Error("Failed query: select 1", {
        cause: new Error("connect ECONNREFUSED 127.0.0.1:5433"),
      });
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "error" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Health check failed"),
      "connect ECONNREFUSED 127.0.0.1:5433",
    );
  });

  it("logs the individual errors of an AggregateError", async () => {
    mockDb(async () => {
      throw new Error("Failed query: select 1", {
        cause: new AggregateError([
          new Error("connect ECONNREFUSED ::1:5433"),
          new Error("connect ECONNREFUSED 127.0.0.1:5433"),
        ]),
      });
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      "connect ECONNREFUSED ::1:5433; connect ECONNREFUSED 127.0.0.1:5433",
    );
  });

  it("returns 503 when the environment is invalid", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("Invalid environment variables:\n- DATABASE_URL: is not set");
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "error" });
  });
});
