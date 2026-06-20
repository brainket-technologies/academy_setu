import pool from "@/lib/db";

export const runtime = "nodejs"; // pg requires Node.js runtime

export async function GET() {
  const client = await pool.connect();
  try {
    const timeResult = await client.query<{ now: string }>("SELECT NOW() AS now");
    const versionResult = await client.query<{ version: string }>(
      "SELECT version() AS version"
    );

    return Response.json({
      success: true,
      message: "✅ PostgreSQL connection successful!",
      serverTime: timeResult.rows[0].now,
      pgVersion: versionResult.rows[0].version,
      database: "railway",
      host: "thomas.proxy.rlwy.net",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        success: false,
        message: "❌ PostgreSQL connection failed",
        error: message,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
