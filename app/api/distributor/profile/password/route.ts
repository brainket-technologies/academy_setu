import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getDistributorSessionAction } from '@/app/distributor/login/actions'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getDistributorSessionAction()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current and new password are required' }, { status: 400 })
    }

    const result = await pool.query(
      'SELECT password_hash FROM distributors WHERE id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }

    const distributor = result.rows[0]

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, distributor.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await pool.query(
      'UPDATE distributors SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, session.userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Distributor password update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })
  }
}
