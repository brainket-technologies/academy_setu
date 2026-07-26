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
    max: 20,                        // maximum simultaneous DB connections
    min: 0,                         // don't keep warm connections for serverless
    idleTimeoutMillis: 60_000,      // close idle connections after 60 s
    connectionTimeoutMillis: 15_000, // wait up to 15 seconds for DB to wake up
    maxUses: 7_500,                 // recycle connections after 7 500 queries to avoid memory drift
    allowExitOnIdle: true,          // allow exit to prevent hanging processes
  });
}

function getPool(): Pool {
  if (!globalThis._pgPool) {
    globalThis._pgPool = createPool();
  }
  return globalThis._pgPool;
}

const pool: Pool = getPool();

export default pool;
