import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { serverEnv } from "./config/env.server";

const pool = new Pool({
  host: serverEnv.DB_HOST,
  port: serverEnv.DB_PORT,
  user: serverEnv.DB_USER,
  password: serverEnv.DB_PASSWORD,
  database: serverEnv.DB_NAME,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export type { DatabaseEnv } from "@afterdark/validators/database";
