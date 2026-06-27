import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryType = searchParams.get('category_type') || ''
    
    let query = 'SELECT * FROM income_categories'
    const params: any[] = []
    
    if (categoryType) {
      query += ' WHERE category_type = $1'
      params.push(categoryType)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const result = await pool.query(query, params)
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Fetch income categories error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category_type } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const query = `
      INSERT INTO income_categories (name, description, category_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await pool.query(query, [name, description || '', category_type || 'Income'])
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Create income category error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
