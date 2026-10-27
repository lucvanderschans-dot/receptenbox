import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./env";

const SECRET = "s3cr3t-p4ssw0rd";

function parseError(source: Record<string, string | undefined>): Error {
  try {
    parseServerEnv(source);
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error("parseServerEnv threw a non-Error value");
  }
  throw new Error("parseServerEnv did not throw");
}

describe("parseServerEnv", () => {
  it.each([
    "postgres://user:pass@localhost:5433/receptenbox",
    "postgresql://user:pass@db.example.com/receptenbox?sslmode=require",
  ])("accepts %s", (url) => {
    expect(parseServerEnv({ DATABASE_URL: url })).toEqual({ DATABASE_URL: url });
  });

  it("ignores unrelated variables", () => {
    const env = parseServerEnv({
      DATABASE_URL: "postgres://localhost/receptenbox",
      UNRELATED: "x",
    });
    expect(env).toEqual({ DATABASE_URL: "postgres://localhost/receptenbox" });
  });

  it("rejects a missing DATABASE_URL", () => {
    expect(parseError({}).message).toContain("DATABASE_URL: is not set");
  });

  it.each([
    ["an empty string", ""],
    ["a non-URL", `not a url ${SECRET}`],
    ["another protocol", `mysql://user:${SECRET}@localhost/receptenbox`],
  ])("rejects %s", (_label, value) => {
    expect(parseError({ DATABASE_URL: value }).message).toContain(
      "DATABASE_URL: must be a postgres:// or postgresql:// URL",
    );
  });

  it.each([
    `not a url ${SECRET}`,
    `mysql://user:${SECRET}@localhost/receptenbox`,
    `https://user:${SECRET}@localhost/receptenbox`,
  ])("never includes the value in the error (%#)", (value) => {
    const error = parseError({ DATABASE_URL: value });

    expect(error.message).not.toContain(SECRET);
    expect(String(error.stack)).not.toContain(SECRET);
    expect(error.cause).toBeUndefined();
    expect(JSON.stringify(error, Object.getOwnPropertyNames(error))).not.toContain(SECRET);
  });
});
