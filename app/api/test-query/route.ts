import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query('ALTER TABLE segments DROP COLUMN IF EXISTS services');
    return NextResponse.json({ success: true, message: 'Dropped services column' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
