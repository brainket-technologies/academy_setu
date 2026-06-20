import { Pool } from "pg";

// Re-use the pool across module reloads in dev (Next.js HMR)
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // required for Railway proxy
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

const pool: Pool =
  process.env.NODE_ENV === "development"
    ? (globalThis._pgPool ??= createPool())
    : createPool();

export default pool;
