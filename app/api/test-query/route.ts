export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Let's find the Starter Plan ID
    const planRes = await pool.query("SELECT id FROM plans WHERE plan_name = 'Starter Plan' LIMIT 1");
    if (planRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Starter Plan not found' });
    }
    const starterPlanId = planRes.rows[0].id;

    // Update existing applications to point to Starter Plan
    const updateRes = await pool.query(
      "UPDATE applications SET plan_id = $1 RETURNING *",
      [starterPlanId]
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${updateRes.rowCount} applications to use Starter Plan`,
      applications: updateRes.rows
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
