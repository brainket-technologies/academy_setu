import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID NOT NULL,
        admission_no VARCHAR,
        roll_no VARCHAR,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR,
        avatar VARCHAR,
        class_name VARCHAR,
        contact VARCHAR,
        fees_status VARCHAR,
        tag VARCHAR,
        status VARCHAR DEFAULT 'Active',
        login_disabled BOOLEAN DEFAULT false,
        remark TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const instRes = await pool.query('SELECT id FROM institutions');
    if (instRes.rows.length === 0) return NextResponse.json({ error: 'No institution found' });
    
    // Clean existing dummy students
    await pool.query('DELETE FROM institute_students');

    for (const row of instRes.rows) {
      const instId = row.id;
      
      // Insert Students
      const students = [
        `('${instId}', 'SCH3654', '1456', 'Sohan', 'Singh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sohan', 'Class V', '9900990909', 'Paid', 'General', 'Active')`,
        `('${instId}', 'SCH3655', '1457', 'Rohan', 'Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', 'Class III', '9900990908', 'Unpaid', 'VIP', 'Inactive')`,
        `('${instId}', 'SCH3656', '1458', 'Neha', 'Gupta', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha', 'Class X', '9900990907', 'Paid', 'General', 'Active')`,
        `('${instId}', 'SCH3657', '1459', 'Aryan', 'Singh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan', 'Class V', '9900990906', 'Paid', 'General', 'Active')`,
        `('${instId}', 'SCH3658', '1460', 'Priya', 'Verma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'Class V', '9900990905', 'Unpaid', 'General', 'Active')`,
        `('${instId}', 'SCH3659', '1461', 'Rahul', 'Kumar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', 'Class VII', '9900990904', 'Paid', 'General', 'Inactive')`,
        `('${instId}', 'SCH3660', '1462', 'Amit', 'Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', 'Class VI', '9900990903', 'Paid', 'VIP', 'Active')`,
        `('${instId}', 'SCH3661', '1463', 'Suresh', 'Singh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh', 'Class V', '9900990902', 'Paid', 'General', 'Active')`,
        `('${instId}', 'SCH3662', '1464', 'Sneha', 'Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', 'Class IV', '9900990901', 'Unpaid', 'General', 'Inactive')`,
        `('${instId}', 'SCH3663', '1465', 'Vikram', 'Singh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', 'Class III', '9900990900', 'Paid', 'VIP', 'Inactive')`
      ].join(',');

      await pool.query(`
        INSERT INTO institute_students (
          institution_id, admission_no, roll_no, first_name, last_name, avatar, class_name, contact, fees_status, tag, status
        ) VALUES ${students}
      `);
    }
    
    return NextResponse.json({ success: true, message: 'Created students table and inserted 10 dummy students!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
