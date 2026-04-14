import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export const hasDatabase = !!process.env.DATABASE_URL;

export const pool = hasDatabase
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

if (!hasDatabase) {
  console.warn(
    "[db] DATABASE_URL not set — LLM logs will be kept in memory only.",
  );
}
