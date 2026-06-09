import { z } from "zod";

export const MODE = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const databaseEnvSchema = z.object({
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("afterdark"),
  NODE_ENV: z.enum([MODE.DEVELOPMENT, MODE.PRODUCTION, MODE.TEST]).default(MODE.DEVELOPMENT),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
