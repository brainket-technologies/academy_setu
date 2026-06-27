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
    ssl: { rejectUnauthorized: false },

    // ─── Production-grade pool settings ────────────────────────────────────────
    max: 50,                        // maximum simultaneous DB connections
    min: 5,                         // keep 5 warm connections at all times
    idleTimeoutMillis: 60_000,      // close idle connections after 60 s
    connectionTimeoutMillis: 3_000, // fail-fast if DB is unreachable
    maxUses: 7_500,                 // recycle connections after 7 500 queries to avoid memory drift
    allowExitOnIdle: false,         // keep pool alive in serverless warm instances
  });
}

function getPool(): Pool {
  if (process.env.NODE_ENV === "development") {
    return (globalThis._pgPool ??= createPool());
  }
  return (globalThis._pgPool ??= createPool());
}

const pool: Pool = getPool();

export default pool;
