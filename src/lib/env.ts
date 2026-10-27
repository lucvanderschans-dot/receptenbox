import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    // Never interpolate issue.input here: it would put the password in the message.
    error: (issue) =>
      issue.input === undefined ? "is not set" : "must be a postgres:// or postgresql:// URL",
  }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates server environment variables.
 *
 * The thrown error only names the invalid variables and why they are invalid.
 * It never contains the values: DATABASE_URL includes a password, and this
 * message ends up in logs. For the same reason the ZodError is not attached
 * as `cause`.
 */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (result.success) {
    return result.data;
  }

  const problems = result.error.issues.map((issue) => {
    const name = issue.path.join(".") || "(root)";
    return `${name}: ${issue.message}`;
  });
  throw new Error(`Invalid environment variables:\n- ${problems.join("\n- ")}`);
}

let cachedEnv: ServerEnv | undefined;

/**
 * Returns the validated server environment, parsed on first use.
 * Lazy on purpose, so importing this module (e.g. during `next build`)
 * does not require the variables to be set.
 */
export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
