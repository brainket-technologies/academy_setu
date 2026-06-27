import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    console.log('DEBUG PROFILE - Session decoded:', session)
    if (!session || !session.userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized', 
        debug: { sessionExists: !!session, userIdExists: !!session?.userId, session } 
      }, { status: 401 })
    }

    const query = `
      SELECT id, name, email, role, phone, avatar_url, id_no, joining_date, gender 
      FROM admins 
      WHERE id = $1 
      LIMIT 1
    `
    let result = await pool.query(query, [session.userId])
    console.log('DEBUG PROFILE - Query result rows count by ID:', result.rows.length)
    
    // Fallback: If UUID has changed due to database reseeds, look up by email
    if (result.rows.length === 0 && session.email) {
      console.log('DEBUG PROFILE - Stale UUID, attempting email fallback:', session.email)
      const fallbackQuery = `
        SELECT id, name, email, role, phone, avatar_url, id_no, joining_date, gender 
        FROM admins 
        WHERE email = $1 
        LIMIT 1
      `
      result = await pool.query(fallbackQuery, [session.email.toLowerCase().trim()])
      console.log('DEBUG PROFILE - Query result rows count by email:', result.rows.length)
    }
    
    if (result.rows.length === 0) {
      // Find what users exist to see if database got cleared or matches
      const allAdmins = await pool.query('SELECT id, name, email FROM admins LIMIT 10')
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in database', 
        debug: { 
          queriedId: session.userId, 
          queriedEmail: session.email,
          existsInDB: false,
          availableAdmins: allAdmins.rows 
        } 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve real user ID from database (handling stale UUIDs due to reseeds)
    let dbUserId = session.userId
    const checkId = await pool.query('SELECT id FROM admins WHERE id = $1 LIMIT 1', [dbUserId])
    if (checkId.rows.length === 0 && session.email) {
      const checkEmail = await pool.query('SELECT id FROM admins WHERE email = $1 LIMIT 1', [session.email.toLowerCase().trim()])
      if (checkEmail.rows.length > 0) {
        dbUserId = checkEmail.rows[0].id
      }
    }

    const body = await request.json()
    const { avatar_url, currentPassword, newPassword } = body

    // 1. If only updating avatar/profile picture
    if (avatar_url !== undefined && currentPassword === undefined) {
      const query = `
        UPDATE admins 
        SET avatar_url = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING id, avatar_url
      `
      const result = await pool.query(query, [avatar_url, dbUserId])
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        message: 'Profile picture updated successfully',
        data: result.rows[0]
      })
    }

    // 2. If updating password
    if (currentPassword && newPassword) {
      // Fetch current password hash
      const checkRes = await pool.query('SELECT password_hash FROM admins WHERE id = $1 LIMIT 1', [dbUserId])
      if (checkRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const dbHash = checkRes.rows[0].password_hash
      const isMatch = await bcrypt.compare(currentPassword, dbHash)
      
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
      }

      const newHash = await bcrypt.hash(newPassword, 10)
      const updateQuery = `
        UPDATE admins 
        SET password_hash = $1, updated_at = NOW() 
        WHERE id = $2
      `
      await pool.query(updateQuery, [newHash, dbUserId])

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
