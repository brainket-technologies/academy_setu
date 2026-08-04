import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'promo_codes' AND column_name = 'segment' AND data_type IN ('character varying', 'text')
        ) THEN
          ALTER TABLE promo_codes ALTER COLUMN segment TYPE TEXT[] USING string_to_array(segment, ',');
        END IF;
        
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'promo_codes' AND column_name = 'applicable_by' AND data_type IN ('character varying', 'text')
        ) THEN
          ALTER TABLE promo_codes ALTER COLUMN applicable_by DROP DEFAULT;
          ALTER TABLE promo_codes ALTER COLUMN applicable_by TYPE TEXT[] USING string_to_array(applicable_by, ',');
          ALTER TABLE promo_codes ALTER COLUMN applicable_by SET DEFAULT '{}';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'promo_codes' AND column_name = 'min_applicable_amount'
        ) THEN
          ALTER TABLE promo_codes ADD COLUMN min_applicable_amount NUMERIC(10,2) DEFAULT 0;
        END IF;
      END $$;
    `).catch(err => console.error("Database migration promo_codes error:", err));

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const segment = searchParams.get('segment') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = 'SELECT * FROM promo_codes'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(code ILIKE $${params.length} OR description ILIKE $${params.length})`)
    }

    if (segment) {
      params.push(segment)
      conditions.push(`$${params.length} = ANY(segment)`)
    }

    if (status) {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    if (startDate) {
      params.push(startDate)
      conditions.push(`start_date >= $${params.length}`)
    }

    if (endDate) {
      params.push(endDate)
      conditions.push(`start_date <= $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countQuery, params)
    const totalCount = parseInt(countResult.rows[0].count)

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Promo code list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'promo_codes' AND column_name = 'segment' AND data_type IN ('character varying', 'text')
        ) THEN
          ALTER TABLE promo_codes ALTER COLUMN segment TYPE TEXT[] USING string_to_array(segment, ',');
        END IF;
        
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'promo_codes' AND column_name = 'applicable_by' AND data_type IN ('character varying', 'text')
        ) THEN
          ALTER TABLE promo_codes ALTER COLUMN applicable_by DROP DEFAULT;
          ALTER TABLE promo_codes ALTER COLUMN applicable_by TYPE TEXT[] USING string_to_array(applicable_by, ',');
          ALTER TABLE promo_codes ALTER COLUMN applicable_by SET DEFAULT '{}';
        END IF;
      END $$;
    `).catch(err => console.error("Database migration promo_codes error:", err));

    const body = await request.json()
    const { code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses, start_date, has_expiry, expiry_date, min_applicable_amount } = body

    if (!code || !discount_type || discount_value == null) {
      return NextResponse.json({ success: false, error: 'Code, Discount Type, and Discount Value are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO promo_codes (code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses, start_date, has_expiry, expiry_date, min_applicable_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        code.toUpperCase(),
        description || '',
        segment || [],
        applicable_by || [],
        applicable_one || false,
        discount_name || '',
        discount_type,
        discount_value,
        max_uses || 0,
        start_date || null,
        has_expiry || false,
        has_expiry ? (expiry_date || null) : null,
        min_applicable_amount || 0
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Promo code create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
