'use server'

import pool from '@/lib/db'

export async function fetchAllPlans() {
  try {
    const res = await pool.query(`
      SELECT id, plan_name as name, description, first_billing_duration as validity_days
      FROM plans 
      WHERE status = 'Active' 
      ORDER BY created_at DESC
    `)
    return { success: true, data: res.rows }
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    return { success: false, error: 'Failed to fetch plans' }
  }
}

export async function fetchActivePlan() {
  try {
    // In a real app, you would query the 'bills' or 'institutions' table using the session's institution_id
    // For this demo, we simulate getting the institution's assigned plan (e.g., the first active one)
    const res = await pool.query(`
      SELECT id, plan_name as name, description, first_billing_duration as validity_days
      FROM plans 
      WHERE status = 'Active' 
      ORDER BY created_at ASC 
      LIMIT 1
    `)
    
    if (res.rows.length > 0) {
      return { success: true, data: res.rows[0] }
    }
    return { success: false, error: 'No active plan found' }
  } catch (error: any) {
    console.error('Error fetching active plan:', error)
    return { success: false, error: 'Failed to fetch active plan' }
  }
}
