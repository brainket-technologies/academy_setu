import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_parent_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('include_deleted') === 'true'

    const query = includeDeleted
      ? `SELECT c.*, 
          COUNT(s.id) FILTER (WHERE s.is_deleted = false) as sub_count
         FROM ticket_parent_categories c
         LEFT JOIN ticket_categories s ON s.parent_category = c.name
         GROUP BY c.id
         ORDER BY c.name ASC`
      : `SELECT c.*, 
          COUNT(s.id) FILTER (WHERE s.is_deleted = false) as sub_count
         FROM ticket_parent_categories c
         LEFT JOIN ticket_categories s ON s.parent_category = c.name
         WHERE c.is_deleted = false
         GROUP BY c.id
         ORDER BY c.name ASC`

    const result = await pool.query(query)

    // Also pick up any parent_category from ticket_categories not yet in ticket_parent_categories
    const unseeded = await pool.query(`
      SELECT DISTINCT parent_category 
      FROM ticket_categories 
      WHERE parent_category IS NOT NULL 
        AND parent_category != '' 
        AND parent_category NOT IN (SELECT name FROM ticket_parent_categories)
    `)
    for (const row of unseeded.rows) {
      await pool.query(`
        INSERT INTO ticket_parent_categories (name, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [row.parent_category])
    }

    // Re-query if unseeded rows were added
    const finalResult = unseeded.rows.length > 0
      ? await pool.query(query)
      : result

    return NextResponse.json({
      success: true,
      data: finalResult.rows.map(r => ({
        ...r,
        sub_count: parseInt(r.sub_count || '0')
      }))
    })
  } catch (error) {
    console.error('Parent categories GET error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable()
    const body = await request.json()
    const name = String(body.name || '').trim()
    const description = String(body.description || '').trim()

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const result = await pool.query(`
      INSERT INTO ticket_parent_categories (name, description, is_deleted, created_at, updated_at)
      VALUES ($1, $2, false, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE 
        SET is_deleted = false, 
            description = CASE WHEN $2 != '' THEN $2 ELSE ticket_parent_categories.description END,
            updated_at = NOW()
      RETURNING *
    `, [name, description])

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Parent categories POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureTable()
    const body = await request.json()
    const id = body.id
    const oldName = String(body.oldName || '').trim()
    const newName = String(body.name || body.newName || '').trim()
    const description = body.description

    if (!newName) {
      return NextResponse.json({ success: false, error: 'New category name is required' }, { status: 400 })
    }

    let updateRes
    if (id) {
      const getOld = await pool.query('SELECT name FROM ticket_parent_categories WHERE id = $1', [id])
      const prevName = getOld.rows[0]?.name || oldName

      updateRes = await pool.query(`
        UPDATE ticket_parent_categories 
        SET name = $1, 
            description = COALESCE($2, description),
            updated_at = NOW() 
        WHERE id = $3 
        RETURNING *
      `, [newName, description, id])

      if (prevName && prevName !== newName) {
        // Also update subcategories parent_category column
        await pool.query(`
          UPDATE ticket_categories 
          SET parent_category = $1, updated_at = NOW() 
          WHERE parent_category = $2
        `, [newName, prevName])
      }
    } else if (oldName) {
      updateRes = await pool.query(`
        UPDATE ticket_parent_categories 
        SET name = $1, 
            description = COALESCE($2, description),
            updated_at = NOW() 
        WHERE name = $3 
        RETURNING *
      `, [newName, description, oldName])

      if (oldName !== newName) {
        await pool.query(`
          UPDATE ticket_categories 
          SET parent_category = $1, updated_at = NOW() 
          WHERE parent_category = $2
        `, [newName, oldName])
      }
    } else {
      return NextResponse.json({ success: false, error: 'Category identifier (id or oldName) required' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: updateRes.rows[0] })
  } catch (error) {
    console.error('Parent categories PUT error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')

    if (!id && !name) {
      return NextResponse.json({ success: false, error: 'Category id or name is required' }, { status: 400 })
    }

    let targetName = name
    if (id && !targetName) {
      const cat = await pool.query('SELECT name FROM ticket_parent_categories WHERE id = $1', [id])
      targetName = cat.rows[0]?.name
    }

    // Soft delete parent category
    if (id) {
      await pool.query('UPDATE ticket_parent_categories SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id])
    } else if (name) {
      await pool.query('UPDATE ticket_parent_categories SET is_deleted = true, updated_at = NOW() WHERE name = $1', [name])
    }

    // Soft delete child subcategories as well
    if (targetName) {
      await pool.query('UPDATE ticket_categories SET is_deleted = true, updated_at = NOW() WHERE parent_category = $1', [targetName])
    }

    return NextResponse.json({ success: true, message: 'Category and its subcategories moved to trash' })
  } catch (error) {
    console.error('Parent categories DELETE error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

