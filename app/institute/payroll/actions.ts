'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

// Ensure institute_payroll table and columns exist
export async function ensurePayrollTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_payroll (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      staff_id VARCHAR(255),
      staff_name VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) NOT NULL DEFAULT 'Teacher',
      role VARCHAR(100) DEFAULT 'Teacher',
      department VARCHAR(100) DEFAULT 'General',
      employee_id VARCHAR(100),
      month_year VARCHAR(20) NOT NULL,
      total_month_days INT NOT NULL DEFAULT 30,
      present_days NUMERIC(5,1) DEFAULT 0,
      absent_days NUMERIC(5,1) DEFAULT 0,
      half_days NUMERIC(5,1) DEFAULT 0,
      paid_leaves NUMERIC(5,1) DEFAULT 0,
      non_paid_leaves NUMERIC(5,1) DEFAULT 0,
      basic_salary NUMERIC(12,2) DEFAULT 0,
      gross_salary NUMERIC(12,2) DEFAULT 0,
      leave_deduction NUMERIC(12,2) DEFAULT 0,
      net_salary NUMERIC(12,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Unpaid',
      payment_method VARCHAR(50),
      payment_date DATE,
      transaction_id VARCHAR(100),
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure all columns exist in case table was created with older schema
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS staff_id VARCHAR(255);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS staff_name VARCHAR(255);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS role VARCHAR(100);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS total_month_days INT DEFAULT 30;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS present_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS absent_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS half_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS paid_leaves NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS non_paid_leaves NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS gross_salary NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS leave_deduction NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS payment_date DATE;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS remarks TEXT;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Ensure institution_id is flexible varchar
    ALTER TABLE institute_payroll DROP CONSTRAINT IF EXISTS institute_payroll_institution_id_fkey;
    ALTER TABLE institute_payroll ALTER COLUMN institution_id TYPE VARCHAR(255) USING institution_id::varchar;
    ALTER TABLE institute_payroll ALTER COLUMN employee_name DROP NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_inst_payroll_lookup 
      ON institute_payroll (institution_id, month_year, user_type);
  `)
}

export interface PayrollItem {
  id: string
  staffId: string
  userType: 'Teacher' | 'Employee' | 'Driver'
  name: string
  role: string
  department: string
  employeeId?: string
  monthYear: string
  totalDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  paidLeave: number
  nonPaidLeave: number
  basicSalary: number
  grossSalary: number
  leaveDeduction: number
  netSalary: number
  formattedLeaveDeduction: string
  formattedNetSalary: string
  status: 'Paid' | 'Unpaid'
  paymentMethod?: string
  paymentDate?: string
  transactionId?: string
}

// Fetch all staff members across Teachers, Staff Members, and Drivers
async function loadAllStaff(instId?: string) {
  const staffList: Array<{
    id: string
    name: string
    userType: 'Teacher' | 'Employee' | 'Driver'
    role: string
    department: string
    employeeId: string
    basicSalary: number
    grossSalary: number
    allowedMonthlyPaidLeaves: number
  }> = []

  // 1. Teachers
  try {
    const tchRes = await pool.query(`
      SELECT id, name, basic_salary, gross_salary, details, joining_date
      FROM institute_teachers
      WHERE status != 'Deleted'
      ORDER BY name ASC
    `)

    tchRes.rows.forEach((t: any, idx: number) => {
      const cleanName = String(t.name || '').trim()
      if (!cleanName) return

      let gross = parseFloat(String(t.gross_salary || '0'))
      let basic = parseFloat(String(t.basic_salary || '0'))
      let allowedLeaves = 2 // default 2 paid leaves/month

      const details = t.details
      if (details?.payroll) {
        if (!gross && details.payroll.grossSalary) {
          gross = parseFloat(String(details.payroll.grossSalary || '0'))
        }
        if (!basic && details.payroll.basicSalary) {
          basic = parseFloat(String(details.payroll.basicSalary || '0'))
        }
        if (Array.isArray(details.payroll.allocatedLeaves) && details.payroll.allocatedLeaves.length > 0) {
          const totalAllowed = details.payroll.allocatedLeaves.reduce(
            (sum: number, l: any) => sum + (parseFloat(l.allowedLeaves) || 0), 0
          )
          const isAnnual = details.payroll.leaveQuotaFrequency !== 'Monthly'
          allowedLeaves = isAnnual ? Math.max(1, Math.round(totalAllowed / 12)) : Math.max(1, totalAllowed)
        }
      }

      // If gross is still 0, provide standard teaching faculty scale
      if (!gross) gross = 45000
      if (!basic) basic = Math.round(gross * 0.7)

      staffList.push({
        id: String(t.id),
        name: cleanName,
        userType: 'Teacher',
        role: 'Teacher',
        department: 'Academics',
        employeeId: `TCH-${String(idx + 1).padStart(3, '0')}`,
        basicSalary: basic,
        grossSalary: gross,
        allowedMonthlyPaidLeaves: allowedLeaves
      })
    })
  } catch (err) {
    console.error('loadAllStaff teachers error:', err)
  }

  // 2. Staff Members / Employees
  try {
    const empRes = await pool.query(`
      SELECT id, name, role, basic_salary, gross_salary, details, joining_date
      FROM institute_staff_members
      WHERE status != 'Deleted'
      ORDER BY name ASC
    `)

    empRes.rows.forEach((e: any, idx: number) => {
      const cleanName = String(e.name || '').trim()
      if (!cleanName) return

      let gross = parseFloat(String(e.gross_salary || '0'))
      let basic = parseFloat(String(e.basic_salary || '0'))
      let allowedLeaves = 2

      const details = e.details
      if (details?.payroll) {
        if (!gross && details.payroll.grossSalary) {
          gross = parseFloat(String(details.payroll.grossSalary || '0'))
        }
        if (!basic && details.payroll.basicSalary) {
          basic = parseFloat(String(details.payroll.basicSalary || '0'))
        }
      }

      const roleStr = String(e.role || 'Staff').trim()
      const isDriver = roleStr.toLowerCase().includes('driver')
      const userType: 'Teacher' | 'Employee' | 'Driver' = isDriver ? 'Driver' : 'Employee'

      if (!gross) gross = isDriver ? 22000 : 28000
      if (!basic) basic = Math.round(gross * 0.7)

      staffList.push({
        id: String(e.id),
        name: cleanName,
        userType,
        role: roleStr,
        department: isDriver ? 'Transport' : 'Administration',
        employeeId: `${isDriver ? 'DRV' : 'EMP'}-${String(idx + 1).padStart(3, '0')}`,
        basicSalary: basic,
        grossSalary: gross,
        allowedMonthlyPaidLeaves: allowedLeaves
      })
    })
  } catch (err) {
    console.error('loadAllStaff employees error:', err)
  }

  // 3. Transportation Drivers
  try {
    const trRes = await pool.query(`
      SELECT DISTINCT driver_name, driver_mobile, vehicle_no
      FROM institute_transportation
      WHERE driver_name IS NOT NULL AND TRIM(driver_name) != ''
    `)
    trRes.rows.forEach((d: any, idx: number) => {
      const cleanName = String(d.driver_name || '').trim()
      if (!cleanName || staffList.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) return
      staffList.push({
        id: `drv-${idx + 1}`,
        name: cleanName,
        userType: 'Driver',
        role: 'Driver',
        department: 'Transport',
        employeeId: `DRV-${String(idx + 1).padStart(3, '0')}`,
        basicSalary: 16000,
        grossSalary: 22000,
        allowedMonthlyPaidLeaves: 2
      })
    })
  } catch (err) {
    console.error('loadAllStaff drivers error:', err)
  }

  return staffList
}

// Generate or recalculate payroll records for a given month (e.g. '2026-11') on the basis of salary and attendance
export async function generatePayrollForMonth(targetMonthYear?: string): Promise<{
  success: boolean
  count?: number
  monthYear?: string
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const session = await getSession('institute_session')
    let instId = session?.userId
    if (!instId || instId === 'default-inst') {
      const instCheck = await pool.query(`SELECT institution_id FROM institute_teachers LIMIT 1`)
      if (instCheck.rows.length > 0 && instCheck.rows[0].institution_id) {
        instId = String(instCheck.rows[0].institution_id)
      } else {
        instId = 'default-inst'
      }
    }

    // Determine target month (default to current year-month e.g. '2026-11')
    const now = new Date()
    const ym = targetMonthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const [yearStr, monthStr] = ym.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    // Number of days in the month
    const totalMonthDays = new Date(year, month, 0).getDate()

    // 1. Load all staff
    const allStaff = await loadAllStaff(instId)
    if (allStaff.length === 0) {
      return { success: false, error: 'No staff members found to generate payroll for.' }
    }

    // 2. Fetch all attendance records for this month
    const attRes = await pool.query(`
      SELECT staff_id, staff_name, status, attendance_date
      FROM institute_staff_attendance
      WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1
    `, [ym])

    const attendanceByStaffName: Record<string, { present: number; absent: number; leave: number; halfDay: number }> = {}
    const attendanceByStaffId: Record<string, { present: number; absent: number; leave: number; halfDay: number }> = {}

    attRes.rows.forEach((r: any) => {
      const sName = String(r.staff_name || '').toLowerCase().trim()
      const sId = String(r.staff_id || '').trim()
      const status = String(r.status || 'Present').trim()

      const initCounts = () => ({ present: 0, absent: 0, leave: 0, halfDay: 0 })

      if (sName) {
        if (!attendanceByStaffName[sName]) attendanceByStaffName[sName] = initCounts()
        if (status === 'Present') attendanceByStaffName[sName].present++
        else if (status === 'Absent') attendanceByStaffName[sName].absent++
        else if (status === 'Leave') attendanceByStaffName[sName].leave++
        else if (status === 'Half Day') attendanceByStaffName[sName].halfDay++
      }

      if (sId) {
        if (!attendanceByStaffId[sId]) attendanceByStaffId[sId] = initCounts()
        if (status === 'Present') attendanceByStaffId[sId].present++
        else if (status === 'Absent') attendanceByStaffId[sId].absent++
        else if (status === 'Leave') attendanceByStaffId[sId].leave++
        else if (status === 'Half Day') attendanceByStaffId[sId].halfDay++
      }
    })

    // 3. Check existing payroll records to preserve paid status and transaction info
    const existingRes = await pool.query(`
      SELECT staff_id, staff_name, status, payment_method, payment_date, transaction_id
      FROM institute_payroll
      WHERE month_year = $1
    `, [ym])

    const existingMap: Record<string, any> = {}
    existingRes.rows.forEach((r: any) => {
      const key = `${String(r.staff_id || '')}_${String(r.staff_name || '').toLowerCase().trim()}`
      existingMap[key] = r
    })

    // 4. Calculate for each staff member
    let insertedCount = 0

    for (const staff of allStaff) {
      const sNameKey = staff.name.toLowerCase().trim()
      const att = attendanceByStaffId[staff.id] || attendanceByStaffName[sNameKey] || {
        present: 0,
        absent: 0,
        leave: 0,
        halfDay: 0
      }

      const presentDays = att.present
      const absentDays = att.absent
      const leaveDays = att.leave
      const halfDays = att.halfDay

      // Paid vs Non-Paid Leaves based on allowed quota
      const allowedQuota = staff.allowedMonthlyPaidLeaves || 2
      const paidLeave = Math.min(leaveDays, allowedQuota)
      const nonPaidLeave = Math.max(0, leaveDays - allowedQuota)

      // Total deduction units: each absent = 1 day, each non-paid leave = 1 day, each half-day = 0.5 day
      const totalDeductionUnits = absentDays + nonPaidLeave + (halfDays * 0.5)

      // Daily Salary Rate = Gross Salary / total days in month
      const dailyRate = staff.grossSalary / totalMonthDays
      const leaveDeduction = Math.round(totalDeductionUnits * dailyRate)
      const netSalary = Math.max(0, Math.round(staff.grossSalary - leaveDeduction))

      // Check if previously marked paid
      const existKey = `${staff.id}_${sNameKey}`
      const existing = existingMap[existKey]
      const status = existing?.status === 'Paid' ? 'Paid' : 'Unpaid'
      const paymentMethod = existing?.payment_method || null
      const paymentDate = existing?.payment_date || null
      const transactionId = existing?.transaction_id || null

      // Upsert into institute_payroll
      await pool.query(`
        INSERT INTO institute_payroll (
          institution_id, employee_name, staff_id, staff_name, user_type, role, department, employee_id,
          month_year, total_month_days, present_days, absent_days, half_days,
          paid_leaves, non_paid_leaves, basic_salary, gross_salary, leave_deduction,
          net_salary, status, payment_method, payment_date, transaction_id, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW()
        )
        ON CONFLICT (institution_id, staff_id, month_year) DO UPDATE SET
          employee_name = EXCLUDED.employee_name,
          staff_name = EXCLUDED.staff_name,
          user_type = EXCLUDED.user_type,
          role = EXCLUDED.role,
          department = EXCLUDED.department,
          employee_id = EXCLUDED.employee_id,
          total_month_days = EXCLUDED.total_month_days,
          present_days = EXCLUDED.present_days,
          absent_days = EXCLUDED.absent_days,
          half_days = EXCLUDED.half_days,
          paid_leaves = EXCLUDED.paid_leaves,
          non_paid_leaves = EXCLUDED.non_paid_leaves,
          basic_salary = EXCLUDED.basic_salary,
          gross_salary = EXCLUDED.gross_salary,
          leave_deduction = EXCLUDED.leave_deduction,
          net_salary = EXCLUDED.net_salary,
          status = CASE WHEN institute_payroll.status = 'Paid' THEN 'Paid' ELSE EXCLUDED.status END,
          updated_at = NOW()
      `, [
        instId,
        staff.name,
        staff.id,
        staff.name,
        staff.userType,
        staff.role,
        staff.department,
        staff.employeeId,
        ym,
        totalMonthDays,
        presentDays,
        absentDays,
        halfDays,
        paidLeave,
        nonPaidLeave,
        staff.basicSalary,
        staff.grossSalary,
        leaveDeduction,
        netSalary,
        status,
        paymentMethod,
        paymentDate,
        transactionId
      ])

      insertedCount++
    }

    return { success: true, count: insertedCount, monthYear: ym }
  } catch (err: any) {
    console.error('generatePayrollForMonth error:', err)
    return { success: false, error: err.message || 'Failed to generate payroll' }
  }
}

// Fetch payroll records for display
export async function fetchPayrollRecords(params?: {
  monthYear?: string
  userType?: string
}): Promise<{ success: boolean; data: PayrollItem[]; error?: string }> {
  try {
    await ensurePayrollTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    let query = `
      SELECT id, staff_id, staff_name, user_type, role, department, employee_id,
             month_year, total_month_days, present_days, absent_days, half_days,
             paid_leaves, non_paid_leaves, basic_salary, gross_salary, leave_deduction,
             net_salary, status, payment_method, TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date,
             transaction_id
      FROM institute_payroll
      WHERE 1=1
    `
    const sqlParams: any[] = []
    let pIdx = 1

    if (params?.monthYear && params.monthYear !== 'All') {
      query += ` AND month_year = $${pIdx++}`
      sqlParams.push(params.monthYear)
    }

    if (params?.userType && params.userType !== 'All') {
      query += ` AND LOWER(user_type) = LOWER($${pIdx++})`
      sqlParams.push(params.userType)
    }

    query += ` ORDER BY user_type ASC, staff_name ASC`

    let res = await pool.query(query, sqlParams)

    // If no payroll records exist for this month yet, auto-generate them!
    if (res.rows.length === 0 && params?.monthYear && params.monthYear !== 'All') {
      await generatePayrollForMonth(params.monthYear)
      res = await pool.query(query, sqlParams)
    }

    // If still 0 and no filter was applied, auto-generate current month
    if (res.rows.length === 0) {
      const now = new Date()
      const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      await generatePayrollForMonth(curYM)
      res = await pool.query(query, sqlParams)
    }

    const items: PayrollItem[] = res.rows.map((r: any) => {
      const deductionNum = parseFloat(r.leave_deduction) || 0
      const netNum = parseFloat(r.net_salary) || 0

      return {
        id: String(r.id),
        staffId: String(r.staff_id || ''),
        userType: (r.user_type as any) || 'Teacher',
        name: r.staff_name,
        role: r.role || 'Teacher',
        department: r.department || 'Academics',
        employeeId: r.employee_id || '',
        monthYear: r.month_year,
        totalDays: parseInt(r.total_month_days, 10) || 30,
        presentDays: parseFloat(r.present_days) || 0,
        absentDays: parseFloat(r.absent_days) || 0,
        halfDays: parseFloat(r.half_days) || 0,
        paidLeave: parseFloat(r.paid_leaves) || 0,
        nonPaidLeave: parseFloat(r.non_paid_leaves) || 0,
        basicSalary: parseFloat(r.basic_salary) || 0,
        grossSalary: parseFloat(r.gross_salary) || 0,
        leaveDeduction: deductionNum,
        netSalary: netNum,
        formattedLeaveDeduction: deductionNum > 0 ? `₹${deductionNum.toLocaleString('en-IN')}/-` : '₹0',
        formattedNetSalary: `₹${netNum.toLocaleString('en-IN')}/-`,
        status: (r.status as any) || 'Unpaid',
        paymentMethod: r.payment_method || undefined,
        paymentDate: r.payment_date || undefined,
        transactionId: r.transaction_id || undefined
      }
    })

    return { success: true, data: items }
  } catch (err: any) {
    console.error('fetchPayrollRecords error:', err)
    return { success: false, data: [], error: err.message || 'Failed to fetch payroll records' }
  }
}

// Mark a payroll record as Paid or Unpaid
export async function updatePayrollStatus(params: {
  payrollId: string
  status: 'Paid' | 'Unpaid'
  paymentMethod?: string
  transactionId?: string
  remarks?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensurePayrollTable()
    const { payrollId, status, paymentMethod = 'Bank Transfer', transactionId, remarks } = params

    await pool.query(`
      UPDATE institute_payroll
      SET status = $1,
          payment_method = $2,
          transaction_id = $3,
          remarks = $4,
          payment_date = CASE WHEN $1 = 'Paid' THEN CURRENT_DATE ELSE NULL END,
          updated_at = NOW()
      WHERE id = $5
    `, [status, paymentMethod, transactionId || `TXN-${Date.now().toString().slice(-6)}`, remarks || '', payrollId])

    return { success: true }
  } catch (err: any) {
    console.error('updatePayrollStatus error:', err)
    return { success: false, error: err.message || 'Failed to update payroll status' }
  }
}

// Delete a payroll record
export async function deletePayrollRecord(payrollId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensurePayrollTable()
    await pool.query(`DELETE FROM institute_payroll WHERE id = $1`, [payrollId])
    return { success: true }
  } catch (err: any) {
    console.error('deletePayrollRecord error:', err)
    return { success: false, error: err.message || 'Failed to delete payroll record' }
  }
}
