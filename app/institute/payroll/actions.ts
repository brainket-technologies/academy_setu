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
      paid_days NUMERIC(5,1) DEFAULT 0,
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
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS paid_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS absent_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS half_days NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS paid_leaves NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS non_paid_leaves NUMERIC(5,1) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS gross_salary NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS leave_deduction NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE institute_payroll ADD COLUMN IF NOT EXISTS pending_amount NUMERIC(12,2);
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

    -- Ensure institute_payroll_transactions exists
    CREATE TABLE IF NOT EXISTS institute_payroll_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      payroll_id UUID REFERENCES institute_payroll(id) ON DELETE CASCADE,
      staff_id VARCHAR(255),
      staff_name VARCHAR(255) NOT NULL,
      month_year VARCHAR(20) NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
      transaction_id VARCHAR(100),
      payment_date DATE DEFAULT CURRENT_DATE,
      account_details JSONB DEFAULT '{}',
      screenshot_url TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_inst_payroll_tx_lookup
      ON institute_payroll_transactions (payroll_id, staff_id);
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
  paidDays: number
  absentDays: number
  halfDays: number
  paidLeave: number
  nonPaidLeave: number
  basicSalary: number
  grossSalary: number
  leaveDeduction: number
  netSalary: number
  paidAmount: number
  pendingAmount: number
  formattedGrossSalary: string
  formattedLeaveDeduction: string
  formattedNetSalary: string
  formattedPaidAmount: string
  formattedPendingAmount: string
  status: 'Paid' | 'Unpaid' | 'Partial'
  paymentMethod?: string
  paymentDate?: string
  transactionId?: string
}

export interface PayrollTransactionItem {
  id: string
  payrollId: string
  staffId: string
  staffName: string
  monthYear: string
  amount: number
  formattedAmount: string
  paymentMethod: string
  transactionId: string
  paymentDate: string
  accountDetails?: any
  screenshotUrl?: string
  notes?: string
  createdAt: string
}

export interface EmployeePayrollSummary {
  id: string
  name: string
  userType: 'Teacher' | 'Employee' | 'Driver'
  role: string
  department: string
  employeeId: string
  phone?: string
  email?: string
  joiningDate?: string
  applicableStartDate?: string
  basicSalary: number
  grossSalary: number
  formattedGrossSalary: string
  formattedBasicSalary: string
  latestMonthStatus: 'Paid' | 'Unpaid' | 'Partial'
  latestMonthYear: string
  totalMonthsLogged: number
  totalPaidMonths: number
  totalUnpaidMonths: number
  totalPaidAmount: number
  totalPendingAmount: number
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
    phone?: string
    email?: string
    joiningDate?: string
    applicableStartDate?: string
  }> = []

  // 1. Teachers
  try {
    const tchRes = await pool.query(`
      SELECT id, name, basic_salary, gross_salary, details, joining_date, contact, email, applicable_start_date
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

      // Determine payroll applicable start date
      let appDate = t.applicable_start_date ? String(t.applicable_start_date).split('T')[0] : ''
      if (!appDate && details?.payroll?.applicableStartDate) {
        appDate = String(details.payroll.applicableStartDate).split('T')[0]
      }
      if (!appDate && details?.applicableStartDate) {
        appDate = String(details.applicableStartDate).split('T')[0]
      }
      if (!appDate && t.joining_date) {
        appDate = String(t.joining_date).split('T')[0]
      }

      staffList.push({
        id: String(t.id),
        name: cleanName,
        userType: 'Teacher',
        role: 'Teacher',
        department: 'Academics',
        employeeId: `TCH-${String(idx + 1).padStart(3, '0')}`,
        basicSalary: basic,
        grossSalary: gross,
        allowedMonthlyPaidLeaves: allowedLeaves,
        phone: t.contact ? String(t.contact) : undefined,
        email: t.email ? String(t.email) : undefined,
        joiningDate: t.joining_date ? String(t.joining_date).split('T')[0] : undefined,
        applicableStartDate: appDate || undefined
      })
    })
  } catch (err) {
    console.error('loadAllStaff teachers error:', err)
  }

  // 2. Staff Members / Employees
  try {
    const empRes = await pool.query(`
      SELECT id, name, role, basic_salary, gross_salary, details, joining_date, phone, email, applicable_start_date
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

      // Determine payroll applicable start date
      let appDate = e.applicable_start_date ? String(e.applicable_start_date).split('T')[0] : ''
      if (!appDate && details?.payroll?.applicableStartDate) {
        appDate = String(details.payroll.applicableStartDate).split('T')[0]
      }
      if (!appDate && details?.applicableStartDate) {
        appDate = String(details.applicableStartDate).split('T')[0]
      }
      if (!appDate && e.joining_date) {
        appDate = String(e.joining_date).split('T')[0]
      }

      staffList.push({
        id: String(e.id),
        name: cleanName,
        userType,
        role: roleStr,
        department: isDriver ? 'Transport' : 'Administration',
        employeeId: `${isDriver ? 'DRV' : 'EMP'}-${String(idx + 1).padStart(3, '0')}`,
        basicSalary: basic,
        grossSalary: gross,
        allowedMonthlyPaidLeaves: allowedLeaves,
        phone: e.phone ? String(e.phone) : undefined,
        email: e.email ? String(e.email) : undefined,
        joiningDate: e.joining_date ? String(e.joining_date).split('T')[0] : undefined,
        applicableStartDate: appDate || undefined
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
        allowedMonthlyPaidLeaves: 2,
        phone: d.driver_mobile ? String(d.driver_mobile) : undefined,
        applicableStartDate: '2026-10-01'
      })
    })
  } catch (err) {
    console.error('loadAllStaff drivers error:', err)
  }

  return staffList
}

// Generate or recalculate payroll records for a given month (e.g. '2026-11') on the basis of salary and attendance
export async function generatePayrollForMonth(
  targetMonthYear?: string,
  calcBasis: 'attendance_days' | 'monthly_fixed' = 'attendance_days'
): Promise<{
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

    // 2b. Fetch verified approved leave requests (paid and unpaid) for this month from institute_leave_requests
    let leavesByStaffId: Record<string, { paid: number; unpaid: number }> = {}
    let leavesByStaffName: Record<string, { paid: number; unpaid: number }> = {}
    try {
      const leaveRes = await pool.query(`
        SELECT staff_id, LOWER(TRIM(staff_name)) as staff_name_clean,
               COALESCE(SUM(paid_days), 0) as approved_paid,
               COALESCE(SUM(unpaid_days), 0) as approved_unpaid
        FROM institute_leave_requests
        WHERE status = 'Approved'
          AND (TO_CHAR(from_date, 'YYYY-MM') = $1 OR TO_CHAR(to_date, 'YYYY-MM') = $1)
        GROUP BY staff_id, LOWER(TRIM(staff_name))
      `, [ym])

      leaveRes.rows.forEach((r: any) => {
        const sId = String(r.staff_id || '').trim()
        const sName = String(r.staff_name_clean || '').trim()
        const p = parseFloat(r.approved_paid) || 0
        const u = parseFloat(r.approved_unpaid) || 0

        if (sId) {
          if (!leavesByStaffId[sId]) leavesByStaffId[sId] = { paid: 0, unpaid: 0 }
          leavesByStaffId[sId].paid += p
          leavesByStaffId[sId].unpaid += u
        }
        if (sName) {
          if (!leavesByStaffName[sName]) leavesByStaffName[sName] = { paid: 0, unpaid: 0 }
          leavesByStaffName[sName].paid += p
          leavesByStaffName[sName].unpaid += u
        }
      })
    } catch (lErr) {
      console.warn('Could not query institute_leave_requests for payroll sync (table might be fresh):', lErr)
    }

    // 3. Check existing payroll records to preserve paid status, paid_amount and transaction info
    const existingRes = await pool.query(`
      SELECT staff_id, staff_name, status, paid_amount, pending_amount, payment_method, payment_date, transaction_id
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
      // Check if target month is before employee's payroll applicable start date
      if (staff.applicableStartDate) {
        const staffAppYM = staff.applicableStartDate.slice(0, 7)
        if (/^\d{4}-\d{2}$/.test(staffAppYM) && ym < staffAppYM) {
          continue // Skip staff if target month is before their payroll applicable date
        }
      }

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

      // Paid vs Non-Paid Leaves based on verified approved leave requests or quota
      const reqLeave = leavesByStaffId[staff.id] || leavesByStaffName[sNameKey]
      const paidLeave = reqLeave ? reqLeave.paid : Math.min(leaveDays, staff.allowedMonthlyPaidLeaves || 2)
      const nonPaidLeave = reqLeave ? reqLeave.unpaid : Math.max(0, leaveDays - (staff.allowedMonthlyPaidLeaves || 2))
      const totalAbsentAndUnpaid = Math.max(absentDays, nonPaidLeave)
      const dailyRate = staff.grossSalary / totalMonthDays

      let paidDays = 0
      let leaveDeduction = 0
      let netSalary = 0
      let computedAbsent = totalAbsentAndUnpaid

      if (calcBasis === 'attendance_days') {
        // Attendance pro-rata: Paid for days present + approved paid leaves
        const effectivePresent = presentDays + (halfDays * 0.5)
        paidDays = Math.min(totalMonthDays, Number((effectivePresent + paidLeave).toFixed(1)))
        const unpaidDays = Math.max(0, Number((totalMonthDays - paidDays).toFixed(1)))
        computedAbsent = Math.max(totalAbsentAndUnpaid, unpaidDays)
        leaveDeduction = Math.round(unpaidDays * dailyRate)
        netSalary = Math.max(0, Math.round(staff.grossSalary - leaveDeduction))
      } else {
        // Monthly fixed: Deducts marked absences and approved unpaid leaves only
        const totalDeductionUnits = totalAbsentAndUnpaid + (halfDays * 0.5)
        leaveDeduction = Math.round(totalDeductionUnits * dailyRate)
        paidDays = Math.max(0, Number((totalMonthDays - totalDeductionUnits).toFixed(1)))
        netSalary = Math.max(0, Math.round(staff.grossSalary - leaveDeduction))
        computedAbsent = totalAbsentAndUnpaid
      }

      // Check existing payment status
      const existKey = `${staff.id}_${sNameKey}`
      const existing = existingMap[existKey]
      const prevPaid = existing ? (parseFloat(existing.paid_amount) || (existing.status === 'Paid' ? netSalary : 0)) : 0
      const pendingAmount = Math.max(0, netSalary - prevPaid)
      const status = pendingAmount <= 0 && prevPaid > 0 ? 'Paid' : (prevPaid > 0 ? 'Partial' : (existing?.status === 'Paid' ? 'Paid' : 'Unpaid'))
      const paymentMethod = existing?.payment_method || null
      const paymentDate = existing?.payment_date || null
      const transactionId = existing?.transaction_id || null

      // Upsert into institute_payroll
      await pool.query(`
        INSERT INTO institute_payroll (
          institution_id, employee_name, staff_id, staff_name, user_type, role, department, employee_id,
          month_year, total_month_days, present_days, paid_days, absent_days, half_days,
          paid_leaves, non_paid_leaves, basic_salary, gross_salary, leave_deduction,
          net_salary, paid_amount, pending_amount, status, payment_method, payment_date, transaction_id, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW()
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
          paid_days = EXCLUDED.paid_days,
          absent_days = EXCLUDED.absent_days,
          half_days = EXCLUDED.half_days,
          paid_leaves = EXCLUDED.paid_leaves,
          non_paid_leaves = EXCLUDED.non_paid_leaves,
          basic_salary = EXCLUDED.basic_salary,
          gross_salary = EXCLUDED.gross_salary,
          leave_deduction = EXCLUDED.leave_deduction,
          net_salary = EXCLUDED.net_salary,
          paid_amount = CASE WHEN institute_payroll.status = 'Paid' THEN EXCLUDED.net_salary ELSE institute_payroll.paid_amount END,
          pending_amount = CASE 
            WHEN institute_payroll.status = 'Paid' THEN 0 
            ELSE GREATEST(0, EXCLUDED.net_salary - COALESCE(institute_payroll.paid_amount, 0)) 
          END,
          status = CASE 
            WHEN institute_payroll.status = 'Paid' THEN 'Paid' 
            WHEN COALESCE(institute_payroll.paid_amount, 0) > 0 AND GREATEST(0, EXCLUDED.net_salary - COALESCE(institute_payroll.paid_amount, 0)) > 0 THEN 'Partial'
            WHEN COALESCE(institute_payroll.paid_amount, 0) >= EXCLUDED.net_salary AND EXCLUDED.net_salary > 0 THEN 'Paid'
            ELSE EXCLUDED.status 
          END,
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
        paidDays,
        computedAbsent,
        halfDays,
        paidLeave,
        nonPaidLeave,
        staff.basicSalary,
        staff.grossSalary,
        leaveDeduction,
        netSalary,
        prevPaid,
        pendingAmount,
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
             month_year, total_month_days, present_days, paid_days, absent_days, half_days,
             paid_leaves, non_paid_leaves, basic_salary, gross_salary, leave_deduction,
             net_salary, paid_amount, pending_amount, status, payment_method,
             TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date, transaction_id
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
      const grossNum = parseFloat(r.gross_salary) || 0
      const paidNum = parseFloat(r.paid_amount) || (r.status === 'Paid' ? netNum : 0)
      const pendingNum = r.pending_amount !== null && r.pending_amount !== undefined
        ? parseFloat(r.pending_amount)
        : (r.status === 'Paid' ? 0 : Math.max(0, netNum - paidNum))

      let statusVal: 'Paid' | 'Unpaid' | 'Partial' = 'Unpaid'
      if (pendingNum <= 0 && paidNum > 0) statusVal = 'Paid'
      else if (paidNum > 0 && pendingNum > 0) statusVal = 'Partial'
      else statusVal = (r.status as any) || 'Unpaid'

      const totalDays = parseInt(r.total_month_days, 10) || 30
      const presentDays = parseFloat(r.present_days) || 0
      const paidLeave = parseFloat(r.paid_leaves) || 0
      const paidDays = r.paid_days !== null && r.paid_days !== undefined
        ? parseFloat(r.paid_days)
        : Math.min(totalDays, Number((presentDays + paidLeave).toFixed(1)))

      return {
        id: String(r.id),
        staffId: String(r.staff_id || ''),
        userType: (r.user_type as any) || 'Teacher',
        name: r.staff_name,
        role: r.role || 'Teacher',
        department: r.department || 'Academics',
        employeeId: r.employee_id || '',
        monthYear: r.month_year,
        totalDays,
        presentDays,
        paidDays,
        absentDays: parseFloat(r.absent_days) || 0,
        halfDays: parseFloat(r.half_days) || 0,
        paidLeave,
        nonPaidLeave: parseFloat(r.non_paid_leaves) || 0,
        basicSalary: parseFloat(r.basic_salary) || 0,
        grossSalary: grossNum,
        leaveDeduction: deductionNum,
        netSalary: netNum,
        paidAmount: paidNum,
        pendingAmount: pendingNum,
        formattedGrossSalary: `₹${grossNum.toLocaleString('en-IN')}/-`,
        formattedLeaveDeduction: deductionNum > 0 ? `₹${deductionNum.toLocaleString('en-IN')}/-` : '₹0',
        formattedNetSalary: `₹${netNum.toLocaleString('en-IN')}/-`,
        formattedPaidAmount: `₹${paidNum.toLocaleString('en-IN')}/-`,
        formattedPendingAmount: `₹${pendingNum.toLocaleString('en-IN')}/-`,
        status: statusVal,
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

// Fetch single payroll record with full transaction history
export async function fetchPayrollRecordById(payrollId: string): Promise<{
  success: boolean
  payroll?: PayrollItem
  transactions?: PayrollTransactionItem[]
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const payRes = await pool.query(
      `SELECT * FROM institute_payroll WHERE id = $1`,
      [payrollId]
    )

    if (payRes.rows.length === 0) {
      return { success: false, error: 'Payroll record not found' }
    }

    const r = payRes.rows[0]
    const deductionNum = parseFloat(r.leave_deduction) || 0
    const netNum = parseFloat(r.net_salary) || 0

    // Fetch transactions
    const txRes = await pool.query(
      `SELECT * FROM institute_payroll_transactions WHERE payroll_id = $1 ORDER BY created_at DESC`,
      [payrollId]
    )

    const transactions: PayrollTransactionItem[] = txRes.rows.map((tx: any) => ({
      id: String(tx.id),
      payrollId: String(tx.payroll_id),
      staffId: String(tx.staff_id || ''),
      staffName: tx.staff_name,
      monthYear: tx.month_year,
      amount: parseFloat(tx.amount),
      formattedAmount: `₹${parseFloat(tx.amount).toLocaleString('en-IN')}/-`,
      paymentMethod: tx.payment_method || 'Bank Transfer',
      transactionId: tx.transaction_id,
      paymentDate: tx.payment_date ? String(tx.payment_date).split('T')[0] : '',
      accountDetails: tx.account_details,
      screenshotUrl: tx.screenshot_url,
      notes: tx.notes,
      createdAt: tx.created_at ? tx.created_at.toISOString() : ''
    }))

    const txSum = transactions.reduce((sum, t) => sum + t.amount, 0)
    const paidNum = txSum > 0 ? txSum : (r.status === 'Paid' ? netNum : (parseFloat(r.paid_amount) || 0))
    const pendingNum = Math.max(0, netNum - paidNum)
    const statusVal: 'Paid' | 'Unpaid' | 'Partial' = pendingNum <= 0 && paidNum > 0 ? 'Paid' : (paidNum > 0 ? 'Partial' : (r.status as any || 'Unpaid'))

    const totalDays = parseInt(r.total_month_days, 10) || 30
    const presentDays = parseFloat(r.present_days) || 0
    const paidLeave = parseFloat(r.paid_leaves) || 0
    const grossNum = parseFloat(r.gross_salary) || 0
    const paidDays = r.paid_days !== null && r.paid_days !== undefined
      ? parseFloat(r.paid_days)
      : Math.min(totalDays, Number((presentDays + paidLeave).toFixed(1)))

    const payroll: PayrollItem = {
      id: String(r.id),
      staffId: String(r.staff_id || ''),
      userType: (r.user_type as any) || 'Teacher',
      name: r.staff_name,
      role: r.role || 'Teacher',
      department: r.department || 'Academics',
      employeeId: r.employee_id || '',
      monthYear: r.month_year,
      totalDays,
      presentDays,
      paidDays,
      absentDays: parseFloat(r.absent_days) || 0,
      halfDays: parseFloat(r.half_days) || 0,
      paidLeave,
      nonPaidLeave: parseFloat(r.non_paid_leaves) || 0,
      basicSalary: parseFloat(r.basic_salary) || 0,
      grossSalary: grossNum,
      leaveDeduction: deductionNum,
      netSalary: netNum,
      paidAmount: paidNum,
      pendingAmount: pendingNum,
      formattedGrossSalary: `₹${grossNum.toLocaleString('en-IN')}/-`,
      formattedLeaveDeduction: deductionNum > 0 ? `₹${deductionNum.toLocaleString('en-IN')}/-` : '₹0',
      formattedNetSalary: `₹${netNum.toLocaleString('en-IN')}/-`,
      formattedPaidAmount: `₹${paidNum.toLocaleString('en-IN')}/-`,
      formattedPendingAmount: `₹${pendingNum.toLocaleString('en-IN')}/-`,
      status: statusVal,
      paymentMethod: r.payment_method || undefined,
      paymentDate: r.payment_date ? String(r.payment_date).split('T')[0] : undefined,
      transactionId: r.transaction_id || undefined
    }

    return { success: true, payroll, transactions }
  } catch (err: any) {
    console.error('fetchPayrollRecordById error:', err)
    return { success: false, error: err.message || 'Failed to fetch payroll record' }
  }
}

// Fetch all payroll transactions for a specific staff member
export async function fetchStaffAllTransactions(params: {
  staffId: string
  staffName?: string
}): Promise<{
  success: boolean
  transactions: PayrollTransactionItem[]
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const { staffId, staffName } = params

    const res = await pool.query(`
      SELECT * FROM institute_payroll_transactions
      WHERE staff_id = $1 OR (staff_name ILIKE $2 AND $2 <> '')
      ORDER BY created_at DESC
    `, [staffId, staffName ? `%${staffName.trim()}%` : ''])

    const transactions: PayrollTransactionItem[] = res.rows.map((tx: any) => ({
      id: String(tx.id),
      payrollId: String(tx.payroll_id),
      staffId: String(tx.staff_id || ''),
      staffName: tx.staff_name,
      monthYear: tx.month_year,
      amount: parseFloat(tx.amount),
      formattedAmount: `₹${parseFloat(tx.amount).toLocaleString('en-IN')}/-`,
      paymentMethod: tx.payment_method || 'Bank Transfer',
      transactionId: tx.transaction_id,
      paymentDate: tx.payment_date ? String(tx.payment_date).split('T')[0] : '',
      accountDetails: tx.account_details,
      screenshotUrl: tx.screenshot_url,
      notes: tx.notes,
      createdAt: tx.created_at ? tx.created_at.toISOString() : ''
    }))

    return { success: true, transactions }
  } catch (err: any) {
    console.error('fetchStaffAllTransactions error:', err)
    return { success: false, transactions: [], error: err.message || 'Failed to fetch staff transactions' }
  }
}

// Update payroll item days, deductions, and salary directly
export async function updatePayrollItemDetails(params: {
  payrollId: string
  presentDays: number
  paidDays: number
  paidLeaves: number
  nonPaidLeaves: number
  absentDays: number
  leaveDeduction: number
  netSalary: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensurePayrollTable()
    const { payrollId, presentDays, paidDays, paidLeaves, nonPaidLeaves, absentDays, leaveDeduction, netSalary } = params

    const current = await pool.query(`SELECT paid_amount, status FROM institute_payroll WHERE id = $1`, [payrollId])
    if (current.rows.length === 0) return { success: false, error: 'Payroll record not found' }

    const paidAmount = parseFloat(current.rows[0].paid_amount) || 0
    const pendingAmount = Math.max(0, netSalary - paidAmount)
    const newStatus = pendingAmount <= 0 && paidAmount > 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid')

    await pool.query(`
      UPDATE institute_payroll
      SET present_days = $1,
          paid_days = $2,
          paid_leaves = $3,
          non_paid_leaves = $4,
          absent_days = $5,
          leave_deduction = $6,
          net_salary = $7,
          pending_amount = $8,
          status = $9,
          updated_at = NOW()
      WHERE id = $10
    `, [presentDays, paidDays, paidLeaves, nonPaidLeaves, absentDays, leaveDeduction, netSalary, pendingAmount, newStatus, payrollId])

    return { success: true }
  } catch (err: any) {
    console.error('updatePayrollItemDetails error:', err)
    return { success: false, error: err.message || 'Failed to update payroll details' }
  }
}

export interface RecordTransactionParams {
  payrollId: string
  amount: number
  paymentMethod: string
  transactionId?: string
  accountDetails?: {
    accountNo?: string
    ifscCode?: string
    bankName?: string
    holderName?: string
    upiId?: string
    chequeNo?: string
  }
  screenshotUrl?: string
  notes?: string
}

// Record a single payment transaction (supports full one-time or multiple partial payments)
export async function recordPayrollTransaction(params: RecordTransactionParams): Promise<{
  success: boolean
  transaction?: PayrollTransactionItem
  newStatus?: 'Paid' | 'Unpaid' | 'Partial'
  paidAmount?: number
  pendingAmount?: number
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const { payrollId, amount, paymentMethod, transactionId, accountDetails, screenshotUrl, notes } = params

    if (!payrollId || !amount || amount <= 0) {
      return { success: false, error: 'A valid payroll ID and amount greater than 0 are required' }
    }

    // 1. Fetch current payroll record
    const payRes = await pool.query(
      `SELECT * FROM institute_payroll WHERE id = $1`,
      [payrollId]
    )

    if (payRes.rows.length === 0) {
      return { success: false, error: 'Payroll record not found' }
    }

    const r = payRes.rows[0]
    const instId = r.institution_id
    const netSalary = parseFloat(r.net_salary) || 0

    // Compute previous paid amount from existing transactions
    const txSumRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid FROM institute_payroll_transactions WHERE payroll_id = $1`,
      [payrollId]
    )
    const prevPaid = parseFloat(txSumRes.rows[0].total_paid) || 0
    const newPaid = prevPaid + amount
    const newPending = Math.max(0, netSalary - newPaid)
    const newStatus: 'Paid' | 'Partial' = newPending <= 0 ? 'Paid' : 'Partial'

    const txnId = transactionId || `TXN-${Date.now().toString().slice(-6)}`

    // 2. Insert transaction into institute_payroll_transactions
    const insTx = await pool.query(`
      INSERT INTO institute_payroll_transactions (
        institution_id, payroll_id, staff_id, staff_name, month_year, amount,
        payment_method, transaction_id, payment_date, account_details, screenshot_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11)
      RETURNING *
    `, [
      instId,
      payrollId,
      r.staff_id,
      r.staff_name,
      r.month_year,
      amount,
      paymentMethod || 'Bank Transfer',
      txnId,
      JSON.stringify(accountDetails || {}),
      screenshotUrl || '',
      notes || ''
    ])

    // 3. Update institute_payroll with new paid_amount, pending_amount and status
    await pool.query(`
      UPDATE institute_payroll
      SET paid_amount = $1,
          pending_amount = $2,
          status = $3,
          payment_method = $4,
          transaction_id = $5,
          payment_date = CURRENT_DATE,
          updated_at = NOW()
      WHERE id = $6
    `, [newPaid, newPending, newStatus, paymentMethod, txnId, payrollId])

    const createdTx = insTx.rows[0]

    return {
      success: true,
      newStatus,
      paidAmount: newPaid,
      pendingAmount: newPending,
      transaction: {
        id: String(createdTx.id),
        payrollId: String(createdTx.payroll_id),
        staffId: String(createdTx.staff_id || ''),
        staffName: createdTx.staff_name,
        monthYear: createdTx.month_year,
        amount: parseFloat(createdTx.amount),
        formattedAmount: `₹${parseFloat(createdTx.amount).toLocaleString('en-IN')}/-`,
        paymentMethod: createdTx.payment_method,
        transactionId: createdTx.transaction_id,
        paymentDate: createdTx.payment_date ? String(createdTx.payment_date).split('T')[0] : '',
        accountDetails: createdTx.account_details,
        screenshotUrl: createdTx.screenshot_url,
        notes: createdTx.notes,
        createdAt: createdTx.created_at ? createdTx.created_at.toISOString() : ''
      }
    }
  } catch (err: any) {
    console.error('recordPayrollTransaction error:', err)
    return { success: false, error: err.message || 'Failed to record transaction' }
  }
}

export interface MultiMonthPaymentItem {
  payrollId: string
  monthYear: string
  amount: number
}

export interface RecordMultiMonthTransactionParams {
  staffId: string
  staffName: string
  items: MultiMonthPaymentItem[]
  paymentMethod: string
  transactionId?: string
  accountDetails?: {
    accountNo?: string
    ifscCode?: string
    bankName?: string
    holderName?: string
    upiId?: string
    chequeNo?: string
  }
  notes?: string
}

// Record payment for multiple months in one single transaction (supports full or less/partial amounts)
export async function recordMultiMonthPayrollTransaction(params: RecordMultiMonthTransactionParams): Promise<{
  success: boolean
  transactionId?: string
  totalPaid?: number
  itemsUpdated?: number
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const { staffId, staffName, items, paymentMethod, transactionId, accountDetails, notes } = params

    if (!items || items.length === 0) {
      return { success: false, error: 'No months provided for payment' }
    }

    const validItems = items.filter(it => it.amount > 0)
    if (validItems.length === 0) {
      return { success: false, error: 'At least one month must have an amount greater than 0' }
    }

    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'
    const txnId = transactionId?.trim() || `TXN-MULTI-${Date.now().toString().slice(-6)}`

    let totalDisbursed = 0
    let updatedCount = 0

    for (const item of validItems) {
      const payRes = await pool.query(`SELECT * FROM institute_payroll WHERE id = $1`, [item.payrollId])
      if (payRes.rows.length === 0) continue

      const r = payRes.rows[0]
      const netSalary = parseFloat(r.net_salary) || 0

      // Compute previous paid amount from existing transactions
      const txSumRes = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_paid FROM institute_payroll_transactions WHERE payroll_id = $1`,
        [item.payrollId]
      )
      const prevPaid = parseFloat(txSumRes.rows[0].total_paid) || 0
      const newPaid = prevPaid + item.amount
      const newPending = Math.max(0, netSalary - newPaid)
      const newStatus: 'Paid' | 'Partial' = newPending <= 0 ? 'Paid' : 'Partial'

      const itemNotes = notes
        ? `${notes} (Multi-month batch: ${item.monthYear})`
        : `Multi-month disbursement for ${item.monthYear}`

      // Insert transaction into institute_payroll_transactions
      await pool.query(`
        INSERT INTO institute_payroll_transactions (
          institution_id, payroll_id, staff_id, staff_name, month_year, amount,
          payment_method, transaction_id, payment_date, account_details, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10)
      `, [
        r.institution_id || instId,
        item.payrollId,
        r.staff_id || staffId,
        r.staff_name || staffName,
        r.month_year,
        item.amount,
        paymentMethod || 'Bank Transfer',
        txnId,
        JSON.stringify(accountDetails || {}),
        itemNotes
      ])

      // Update institute_payroll
      await pool.query(`
        UPDATE institute_payroll
        SET paid_amount = $1,
            pending_amount = $2,
            status = $3,
            payment_method = $4,
            transaction_id = $5,
            payment_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = $6
      `, [newPaid, newPending, newStatus, paymentMethod, txnId, item.payrollId])

      totalDisbursed += item.amount
      updatedCount++
    }

    return {
      success: true,
      transactionId: txnId,
      totalPaid: totalDisbursed,
      itemsUpdated: updatedCount
    }
  } catch (err: any) {
    console.error('recordMultiMonthPayrollTransaction error:', err)
    return { success: false, error: err.message || 'Failed to record multi-month transaction' }
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

// ── NEW: Fetch Employee Directory for main Payroll page (Employee Details only) ──
export async function fetchEmployeePayrollDirectory(): Promise<{
  success: boolean
  employees: EmployeePayrollSummary[]
  stats: {
    totalStaff: number
    teachersCount: number
    employeesCount: number
    driversCount: number
    totalGrossPayrollScale: number
    currentMonthDisbursed: number
    currentMonthPending: number
    currentMonthPaidCount: number
    currentMonthUnpaidCount: number
    currentMonthYear: string
  }
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const session = await getSession('institute_session')
    let instId = session?.userId || 'default-inst'

    const now = new Date()
    const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const staffList = await loadAllStaff(instId)

    // Ensure current month records exist
    const curCheck = await pool.query(
      `SELECT COUNT(*) FROM institute_payroll WHERE month_year = $1`,
      [curYM]
    )
    if (parseInt(curCheck.rows[0].count, 10) === 0 && staffList.length > 0) {
      await generatePayrollForMonth(curYM)
    }

    // Aggregated stats from institute_payroll
    const aggRes = await pool.query(`
      SELECT staff_id, LOWER(TRIM(staff_name)) as name_key,
             COUNT(*) as total_months,
             COUNT(*) FILTER (WHERE status = 'Paid') as paid_months,
             COUNT(*) FILTER (WHERE status != 'Paid') as unpaid_months,
             COALESCE(SUM(paid_amount), 0) as total_paid,
             COALESCE(SUM(pending_amount), 0) as total_pending
      FROM institute_payroll
      GROUP BY staff_id, LOWER(TRIM(staff_name))
    `)

    const aggMap: Record<string, any> = {}
    aggRes.rows.forEach((r: any) => {
      if (r.staff_id) aggMap[r.staff_id] = r
      if (r.name_key) aggMap[r.name_key] = r
    })

    // Fetch latest status for current month or most recent month
    const latestRes = await pool.query(`
      SELECT DISTINCT ON (COALESCE(staff_id, LOWER(TRIM(staff_name))))
             staff_id, LOWER(TRIM(staff_name)) as name_key, month_year, status, paid_amount, pending_amount
      FROM institute_payroll
      ORDER BY COALESCE(staff_id, LOWER(TRIM(staff_name))), month_year DESC
    `)

    const latestMap: Record<string, any> = {}
    latestRes.rows.forEach((r: any) => {
      if (r.staff_id) latestMap[r.staff_id] = r
      if (r.name_key) latestMap[r.name_key] = r
    })

    const employees: EmployeePayrollSummary[] = staffList.map(s => {
      // Clean up records prior to staff's applicable date in the background if present
      if (s.applicableStartDate) {
        const sAppYM = s.applicableStartDate.slice(0, 7)
        if (/^\d{4}-\d{2}$/.test(sAppYM)) {
          pool.query(`
            DELETE FROM institute_payroll
            WHERE (staff_id = $1 OR LOWER(TRIM(staff_name)) = LOWER(TRIM($2)))
              AND month_year < $3
          `, [s.id, s.name, sAppYM]).catch(() => {})
        }
      }

      const sNameKey = s.name.toLowerCase().trim()
      const agg = aggMap[s.id] || aggMap[sNameKey] || {}
      const latest = latestMap[s.id] || latestMap[sNameKey] || {}

      const totalPaid = parseFloat(agg.total_paid) || 0
      const totalPending = parseFloat(agg.total_pending) || 0
      const totalMonths = parseInt(agg.total_months, 10) || 0
      const paidMonths = parseInt(agg.paid_months, 10) || 0
      const unpaidMonths = parseInt(agg.unpaid_months, 10) || 0

      let latestStatus: 'Paid' | 'Unpaid' | 'Partial' = (latest.status as any) || 'Unpaid'

      return {
        id: s.id,
        name: s.name,
        userType: s.userType,
        role: s.role,
        department: s.department,
        employeeId: s.employeeId,
        phone: s.phone,
        email: s.email,
        joiningDate: s.joiningDate,
        applicableStartDate: s.applicableStartDate,
        basicSalary: s.basicSalary,
        grossSalary: s.grossSalary,
        formattedGrossSalary: `₹${s.grossSalary.toLocaleString('en-IN')}/-`,
        formattedBasicSalary: `₹${s.basicSalary.toLocaleString('en-IN')}/-`,
        latestMonthStatus: latestStatus,
        latestMonthYear: latest.month_year || curYM,
        totalMonthsLogged: totalMonths,
        totalPaidMonths: paidMonths,
        totalUnpaidMonths: unpaidMonths,
        totalPaidAmount: totalPaid,
        totalPendingAmount: totalPending
      }
    })

    // Compute stats
    const totalStaff = employees.length
    const teachersCount = employees.filter(e => e.userType === 'Teacher').length
    const employeesCount = employees.filter(e => e.userType === 'Employee').length
    const driversCount = employees.filter(e => e.userType === 'Driver').length
    const totalGrossPayrollScale = employees.reduce((sum, e) => sum + e.grossSalary, 0)

    // Current month query for stats
    const curMonthRes = await pool.query(`
      SELECT status, paid_amount, pending_amount
      FROM institute_payroll
      WHERE month_year = $1
    `, [curYM])

    let curDisbursed = 0
    let curPending = 0
    let curPaidCount = 0
    let curUnpaidCount = 0

    curMonthRes.rows.forEach((r: any) => {
      curDisbursed += parseFloat(r.paid_amount) || 0
      curPending += parseFloat(r.pending_amount) || 0
      if (r.status === 'Paid') curPaidCount++
      else curUnpaidCount++
    })

    return {
      success: true,
      employees,
      stats: {
        totalStaff,
        teachersCount,
        employeesCount,
        driversCount,
        totalGrossPayrollScale,
        currentMonthDisbursed: curDisbursed,
        currentMonthPending: curPending,
        currentMonthPaidCount: curPaidCount,
        currentMonthUnpaidCount: curUnpaidCount,
        currentMonthYear: curYM
      }
    }
  } catch (err: any) {
    console.error('fetchEmployeePayrollDirectory error:', err)
    return {
      success: false,
      employees: [],
      stats: {
        totalStaff: 0,
        teachersCount: 0,
        employeesCount: 0,
        driversCount: 0,
        totalGrossPayrollScale: 0,
        currentMonthDisbursed: 0,
        currentMonthPending: 0,
        currentMonthPaidCount: 0,
        currentMonthUnpaidCount: 0,
        currentMonthYear: ''
      },
      error: err.message || 'Failed to fetch employee directory'
    }
  }
}

// ── NEW: Fetch All-Month Payroll History for a Specific Staff Member ──
export async function fetchStaffAllMonthsPayroll(params: {
  staffId: string
  staffName?: string
  year?: string
}): Promise<{
  success: boolean
  employee?: {
    id: string
    name: string
    userType: 'Teacher' | 'Employee' | 'Driver'
    role: string
    department: string
    employeeId: string
    basicSalary: number
    grossSalary: number
    formattedGrossSalary: string
    phone?: string
    email?: string
    joiningDate?: string
    applicableStartDate?: string
    applicableMonth?: string
  }
  records: PayrollItem[]
  availableYears: string[]
  summary: {
    totalGross: number
    totalNet: number
    totalPaid: number
    totalPending: number
    totalDeduction: number
    totalMonths: number
    paidMonths: number
    unpaidMonths: number
  }
  error?: string
}> {
  try {
    await ensurePayrollTable()
    const { staffId, staffName, year } = params
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    // 1. Locate staff details
    const allStaff = await loadAllStaff(instId)
    const staff = allStaff.find(
      s => s.id === staffId || (staffName && s.name.toLowerCase().trim() === staffName.toLowerCase().trim())
    )

    if (!staff) {
      return {
        success: false,
        records: [],
        availableYears: ['2026'],
        summary: { totalGross: 0, totalNet: 0, totalPaid: 0, totalPending: 0, totalDeduction: 0, totalMonths: 0, paidMonths: 0, unpaidMonths: 0 },
        error: 'Staff member not found'
      }
    }

    // 2. Determine payroll applicable month from employee's profile
    const now = new Date()
    const curYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    let applicableMonth = curYM
    if (staff.applicableStartDate) {
      const ym = staff.applicableStartDate.slice(0, 7) // 'YYYY-MM'
      if (/^\d{4}-\d{2}$/.test(ym)) {
        applicableMonth = ym
      }
    }

    // 2a. Delete any dummy/stale records before the employee's payroll applicable month
    await pool.query(`
      DELETE FROM institute_payroll
      WHERE (staff_id = $1 OR LOWER(TRIM(staff_name)) = LOWER(TRIM($2)))
        AND month_year < $3
    `, [staff.id, staff.name, applicableMonth])

    // 2b. Compute valid months list ONLY from applicableMonth up to curYM
    const validMonths: string[] = []
    const [fromY, fromM] = applicableMonth.split('-').map(Number)
    const [toY, toM] = curYM.split('-').map(Number)

    let y = toY
    let m = toM
    while (y > fromY || (y === fromY && m >= fromM)) {
      validMonths.push(`${y}-${String(m).padStart(2, '0')}`)
      m--
      if (m < 1) {
        m = 12
        y--
      }
    }

    // 2c. Ensure existing or generated records for each valid applicable month
    for (const ym of validMonths) {
      const existCheck = await pool.query(`
        SELECT id FROM institute_payroll
        WHERE (staff_id = $1 OR LOWER(TRIM(staff_name)) = LOWER(TRIM($2)))
          AND month_year = $3
      `, [staff.id, staff.name, ym])

      if (existCheck.rows.length === 0) {
        await generatePayrollForMonth(ym)
      }
    }

    // 3. Query all records for this staff (strictly >= applicableMonth and <= curYM)
    let query = `
      SELECT id, staff_id, staff_name, user_type, role, department, employee_id,
             month_year, total_month_days, present_days, paid_days, absent_days, half_days,
             paid_leaves, non_paid_leaves, basic_salary, gross_salary, leave_deduction,
             net_salary, paid_amount, pending_amount, status, payment_method,
             TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date, transaction_id
      FROM institute_payroll
      WHERE (staff_id = $1 OR LOWER(TRIM(staff_name)) = LOWER(TRIM($2)))
        AND month_year >= $3
        AND month_year <= $4
    `
    const sqlParams: any[] = [staff.id, staff.name, applicableMonth, curYM]
    let pIdx = 5

    if (year && year !== 'All') {
      query += ` AND month_year LIKE $${pIdx++}`
      sqlParams.push(`${year}-%`)
    }

    query += ` ORDER BY month_year DESC`

    const res = await pool.query(query, sqlParams)

    const records: PayrollItem[] = res.rows.map((r: any) => {
      const deductionNum = parseFloat(r.leave_deduction) || 0
      const netNum = parseFloat(r.net_salary) || 0
      const grossNum = parseFloat(r.gross_salary) || 0
      const paidNum = parseFloat(r.paid_amount) || (r.status === 'Paid' ? netNum : 0)
      const pendingNum = r.pending_amount !== null && r.pending_amount !== undefined
        ? parseFloat(r.pending_amount)
        : (r.status === 'Paid' ? 0 : Math.max(0, netNum - paidNum))

      let statusVal: 'Paid' | 'Unpaid' | 'Partial' = 'Unpaid'
      if (pendingNum <= 0 && paidNum > 0) statusVal = 'Paid'
      else if (paidNum > 0 && pendingNum > 0) statusVal = 'Partial'
      else statusVal = (r.status as any) || 'Unpaid'

      const totalDays = parseInt(r.total_month_days, 10) || 30
      const presentDays = parseFloat(r.present_days) || 0
      const paidLeave = parseFloat(r.paid_leaves) || 0
      const paidDays = r.paid_days !== null && r.paid_days !== undefined
        ? parseFloat(r.paid_days)
        : Math.min(totalDays, Number((presentDays + paidLeave).toFixed(1)))

      return {
        id: String(r.id),
        staffId: String(r.staff_id || ''),
        userType: (r.user_type as any) || 'Teacher',
        name: r.staff_name,
        role: r.role || 'Teacher',
        department: r.department || 'Academics',
        employeeId: r.employee_id || '',
        monthYear: r.month_year,
        totalDays,
        presentDays,
        paidDays,
        absentDays: parseFloat(r.absent_days) || 0,
        halfDays: parseFloat(r.half_days) || 0,
        paidLeave,
        nonPaidLeave: parseFloat(r.non_paid_leaves) || 0,
        basicSalary: parseFloat(r.basic_salary) || 0,
        grossSalary: grossNum,
        leaveDeduction: deductionNum,
        netSalary: netNum,
        paidAmount: paidNum,
        pendingAmount: pendingNum,
        formattedGrossSalary: `₹${grossNum.toLocaleString('en-IN')}/-`,
        formattedLeaveDeduction: deductionNum > 0 ? `₹${deductionNum.toLocaleString('en-IN')}/-` : '₹0',
        formattedNetSalary: `₹${netNum.toLocaleString('en-IN')}/-`,
        formattedPaidAmount: `₹${paidNum.toLocaleString('en-IN')}/-`,
        formattedPendingAmount: `₹${pendingNum.toLocaleString('en-IN')}/-`,
        status: statusVal,
        paymentMethod: r.payment_method || undefined,
        paymentDate: r.payment_date || undefined,
        transactionId: r.transaction_id || undefined
      }
    })

    // Extract available years
    const yearSet = new Set<string>()
    res.rows.forEach((r: any) => {
      if (r.month_year) {
        yearSet.add(r.month_year.split('-')[0])
      }
    })
    const availableYears = Array.from(yearSet).sort().reverse()
    if (!availableYears.includes('2026')) availableYears.unshift('2026')

    // Summaries
    const totalGross = records.reduce((s, r) => s + r.grossSalary, 0)
    const totalNet = records.reduce((s, r) => s + r.netSalary, 0)
    const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0)
    const totalPending = records.reduce((s, r) => s + r.pendingAmount, 0)
    const totalDeduction = records.reduce((s, r) => s + r.leaveDeduction, 0)
    const paidMonths = records.filter(r => r.status === 'Paid').length
    const unpaidMonths = records.filter(r => r.status !== 'Paid').length

    return {
      success: true,
      employee: {
        id: staff.id,
        name: staff.name,
        userType: staff.userType,
        role: staff.role,
        department: staff.department,
        employeeId: staff.employeeId,
        basicSalary: staff.basicSalary,
        grossSalary: staff.grossSalary,
        formattedGrossSalary: `₹${staff.grossSalary.toLocaleString('en-IN')}/-`,
        phone: staff.phone,
        email: staff.email,
        joiningDate: staff.joiningDate,
        applicableStartDate: staff.applicableStartDate,
        applicableMonth
      },
      records,
      availableYears,
      summary: {
        totalGross,
        totalNet,
        totalPaid,
        totalPending,
        totalDeduction,
        totalMonths: records.length,
        paidMonths,
        unpaidMonths
      }
    }
  } catch (err: any) {
    console.error('fetchStaffAllMonthsPayroll error:', err)
    return {
      success: false,
      records: [],
      availableYears: ['2026'],
      summary: { totalGross: 0, totalNet: 0, totalPaid: 0, totalPending: 0, totalDeduction: 0, totalMonths: 0, paidMonths: 0, unpaidMonths: 0 },
      error: err.message || 'Failed to fetch staff payroll history'
    }
  }
}
