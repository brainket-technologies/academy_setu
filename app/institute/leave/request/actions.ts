'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import { generatePayrollForMonth } from '@/app/institute/payroll/actions'

// Format local date YYYY-MM-DD avoiding UTC offset skew
function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(str: string): Date {
  const parts = str.split('-').map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(str)
}

// Ensure DB tables exist
export async function ensureLeaveRequestsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_leave_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      staff_id VARCHAR(255),
      staff_name VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) NOT NULL DEFAULT 'Teacher',
      role VARCHAR(100) DEFAULT 'Teacher',
      department VARCHAR(100) DEFAULT 'Academics',
      employee_id VARCHAR(100),
      leave_type VARCHAR(100) NOT NULL,
      leave_abbr VARCHAR(20) DEFAULT 'CL',
      apply_date DATE NOT NULL DEFAULT CURRENT_DATE,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      duration NUMERIC(4,1) NOT NULL DEFAULT 1,
      reason TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      is_paid BOOLEAN DEFAULT TRUE,
      approved_by VARCHAR(255),
      action_date DATE,
      action_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS staff_id VARCHAR(255);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS staff_name VARCHAR(255);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS role VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS leave_type VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS leave_abbr VARCHAR(20);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS apply_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS from_date DATE;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS to_date DATE;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS duration NUMERIC(4,1) DEFAULT 1;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS reason TEXT;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT TRUE;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS paid_days NUMERIC(4,1) DEFAULT 1;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS unpaid_days NUMERIC(4,1) DEFAULT 0;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS daily_breakdown JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS class_name VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS section_name VARCHAR(50);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS roll_no VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS admission_no VARCHAR(100);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS action_date DATE;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS action_notes TEXT;
    ALTER TABLE institute_leave_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    CREATE INDEX IF NOT EXISTS idx_inst_leave_req_lookup
      ON institute_leave_requests (institution_id, status, user_type);
  `)
}

export interface StaffLeaveQuota {
  leaveType: string
  leaveAbbr: string
  allowedLeaves: number
  usedLeaves: number
  remainingLeaves: number
  frequency: 'Annually' | 'Monthly'
}

export interface StaffMemberWithQuota {
  id: string
  name: string
  userType: 'Teacher' | 'Employee' | 'Driver'
  role: string
  department: string
  employeeId: string
  quotas: StaffLeaveQuota[]
  totalAllowed: number
  totalUsed: number
  totalRemaining: number
}

export interface DailyBreakdownItem {
  date: string // YYYY-MM-DD
  dayOfWeek?: string // Thu, Fri
  displayDate?: string // 12 Nov 2026
  isPaid: boolean
}

export interface StudentLeaveCandidate {
  id: string
  name: string
  rollNo: string
  admissionNo: string
  className: string
  sectionName: string
  status?: string
}

export interface LeaveRequestItem {
  id: string
  staffId: string
  staffName: string
  userType: 'Teacher' | 'Employee' | 'Driver' | 'Student'
  role: string
  department: string
  employeeId: string
  className?: string
  sectionName?: string
  rollNo?: string
  admissionNo?: string
  leaveType: string
  leaveAbbr: string
  applyDate: string
  fromDate: string
  toDate: string
  dateRange: string
  duration: number
  paidDays: number
  unpaidDays: number
  dailyBreakdown: DailyBreakdownItem[]
  reason: string
  status: 'Approved' | 'Pending' | 'Rejected'
  isPaid: boolean
  approvedBy?: string
  actionDate?: string
  actionNotes?: string
  totalAllowedForType: number
  remainingForType: number
  createdAt: string
}

// Fetch all staff members across Teachers, Employees, and Drivers with their allocated & remaining leave quotas
export async function fetchStaffMembersWithLeaveQuotas(): Promise<{
  success: boolean
  staff: StaffMemberWithQuota[]
  error?: string
}> {
  try {
    await ensureLeaveRequestsTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    // 1. Fetch approved leaves count grouped by staff and leave_type (only paid leaves consume from quota)
    const approvedRes = await pool.query(`
      SELECT staff_id, LOWER(TRIM(staff_name)) as staff_name_clean, leave_type, LOWER(TRIM(leave_abbr)) as leave_abbr_clean,
             SUM(COALESCE(paid_days, CASE WHEN is_paid = true THEN duration ELSE 0 END)) as used_days
      FROM institute_leave_requests
      WHERE status = 'Approved'
      GROUP BY staff_id, LOWER(TRIM(staff_name)), leave_type, LOWER(TRIM(leave_abbr))
    `)

    const usedMap: Record<string, number> = {}
    approvedRes.rows.forEach((r: any) => {
      const sId = String(r.staff_id || '').trim()
      const sName = String(r.staff_name_clean || '').trim()
      const lType = String(r.leave_type || '').toLowerCase().trim()
      const lAbbr = String(r.leave_abbr_clean || '').toLowerCase().trim()
      const used = parseFloat(r.used_days) || 0

      if (sId) {
        usedMap[`${sId}_${lType}`] = (usedMap[`${sId}_${lType}`] || 0) + used
        usedMap[`${sId}_${lAbbr}`] = (usedMap[`${sId}_${lAbbr}`] || 0) + used
        usedMap[`${sId}_all`] = (usedMap[`${sId}_all`] || 0) + used
      }
      if (sName) {
        usedMap[`${sName}_${lType}`] = (usedMap[`${sName}_${lType}`] || 0) + used
        usedMap[`${sName}_${lAbbr}`] = (usedMap[`${sName}_${lAbbr}`] || 0) + used
        usedMap[`${sName}_all`] = (usedMap[`${sName}_all`] || 0) + used
      }
    })

    const staffList: StaffMemberWithQuota[] = []
    const seenNames = new Set<string>()

    // 2. Load Teachers
    try {
      const tchRes = await pool.query(`
        SELECT id, name, details, joining_date
        FROM institute_teachers
        WHERE status != 'Deleted'
        ORDER BY name ASC
      `)

      tchRes.rows.forEach((t: any, idx: number) => {
        const cleanName = String(t.name || '').trim()
        if (!cleanName || seenNames.has(cleanName.toLowerCase())) return
        seenNames.add(cleanName.toLowerCase())

        const details = t.details
        const allocatedLeaves = details?.payroll?.allocatedLeaves
        const frequency: 'Annually' | 'Monthly' = details?.payroll?.leaveQuotaFrequency === 'Monthly' ? 'Monthly' : 'Annually'

        let quotas: StaffLeaveQuota[] = []

        if (Array.isArray(allocatedLeaves) && allocatedLeaves.length > 0) {
          quotas = allocatedLeaves.map((l: any) => {
            const lType = String(l.leaveType || 'Casual Leave').trim()
            const lAbbr = String(l.leaveAbbr || 'CL').trim()
            const allowed = parseFloat(l.allowedLeaves) || 12
            const used = usedMap[`${t.id}_${lType.toLowerCase()}`] ||
              usedMap[`${t.id}_${lAbbr.toLowerCase()}`] ||
              usedMap[`${cleanName.toLowerCase()}_${lType.toLowerCase()}`] ||
              usedMap[`${cleanName.toLowerCase()}_${lAbbr.toLowerCase()}`] || 0
            const rem = Math.max(0, Number((allowed - used).toFixed(1)))
            return {
              leaveType: lType,
              leaveAbbr: lAbbr,
              allowedLeaves: allowed,
              usedLeaves: used,
              remainingLeaves: rem,
              frequency
            }
          })
        } else {
          // Standard Teacher Quotas
          const defaults = [
            { leaveType: 'Casual Leave', leaveAbbr: 'CL', allowedLeaves: 12 },
            { leaveType: 'Medical Leave', leaveAbbr: 'ML', allowedLeaves: 12 },
            { leaveType: 'Sick Leave', leaveAbbr: 'SL', allowedLeaves: 10 },
            { leaveType: 'Earned Leave', leaveAbbr: 'EL', allowedLeaves: 12 }
          ]
          quotas = defaults.map(d => {
            const used = usedMap[`${t.id}_${d.leaveType.toLowerCase()}`] ||
              usedMap[`${cleanName.toLowerCase()}_${d.leaveType.toLowerCase()}`] || 0
            return {
              ...d,
              usedLeaves: used,
              remainingLeaves: Math.max(0, d.allowedLeaves - used),
              frequency
            }
          })
        }

        const totalAllowed = quotas.reduce((s, q) => s + q.allowedLeaves, 0)
        const totalUsed = quotas.reduce((s, q) => s + q.usedLeaves, 0)
        const totalRemaining = quotas.reduce((s, q) => s + q.remainingLeaves, 0)

        staffList.push({
          id: String(t.id),
          name: cleanName,
          userType: 'Teacher',
          role: 'Teacher',
          department: 'Academics',
          employeeId: `TCH-${String(idx + 1).padStart(3, '0')}`,
          quotas,
          totalAllowed,
          totalUsed,
          totalRemaining
        })
      })
    } catch (err) {
      console.error('fetchStaffMembersWithLeaveQuotas teachers error:', err)
    }

    // 3. Load Staff Members / Employees
    try {
      const empRes = await pool.query(`
        SELECT id, name, role, details, joining_date
        FROM institute_staff_members
        WHERE status != 'Deleted'
        ORDER BY name ASC
      `)

      empRes.rows.forEach((e: any, idx: number) => {
        const cleanName = String(e.name || '').trim()
        if (!cleanName || seenNames.has(cleanName.toLowerCase())) return
        seenNames.add(cleanName.toLowerCase())

        const details = e.details
        const allocatedLeaves = details?.payroll?.allocatedLeaves
        const casualLeave = parseFloat(details?.payroll?.casualLeave) || 12
        const frequency: 'Annually' | 'Monthly' = details?.payroll?.leaveQuotaFrequency === 'Monthly' ? 'Monthly' : 'Annually'

        let quotas: StaffLeaveQuota[] = []

        if (Array.isArray(allocatedLeaves) && allocatedLeaves.length > 0) {
          quotas = allocatedLeaves.map((l: any) => {
            const lType = String(l.leaveType || 'Casual Leave').trim()
            const lAbbr = String(l.leaveAbbr || 'CL').trim()
            const allowed = parseFloat(l.allowedLeaves) || 12
            const used = usedMap[`${e.id}_${lType.toLowerCase()}`] ||
              usedMap[`${cleanName.toLowerCase()}_${lType.toLowerCase()}`] || 0
            return {
              leaveType: lType,
              leaveAbbr: lAbbr,
              allowedLeaves: allowed,
              usedLeaves: used,
              remainingLeaves: Math.max(0, allowed - used),
              frequency
            }
          })
        } else {
          // Employee default with custom casual leave if configured
          const defaults = [
            { leaveType: 'Casual Leave', leaveAbbr: 'CL', allowedLeaves: casualLeave },
            { leaveType: 'Medical Leave', leaveAbbr: 'ML', allowedLeaves: 10 },
            { leaveType: 'Sick Leave', leaveAbbr: 'SL', allowedLeaves: 10 },
            { leaveType: 'Earned Leave', leaveAbbr: 'EL', allowedLeaves: 12 }
          ]
          quotas = defaults.map(d => {
            const used = usedMap[`${e.id}_${d.leaveType.toLowerCase()}`] ||
              usedMap[`${cleanName.toLowerCase()}_${d.leaveType.toLowerCase()}`] || 0
            return {
              ...d,
              usedLeaves: used,
              remainingLeaves: Math.max(0, d.allowedLeaves - used),
              frequency
            }
          })
        }

        const roleStr = String(e.role || 'Staff').trim()
        const isDriver = roleStr.toLowerCase().includes('driver')
        const userType: 'Teacher' | 'Employee' | 'Driver' = isDriver ? 'Driver' : 'Employee'

        const totalAllowed = quotas.reduce((s, q) => s + q.allowedLeaves, 0)
        const totalUsed = quotas.reduce((s, q) => s + q.usedLeaves, 0)
        const totalRemaining = quotas.reduce((s, q) => s + q.remainingLeaves, 0)

        staffList.push({
          id: String(e.id),
          name: cleanName,
          userType,
          role: roleStr,
          department: isDriver ? 'Transport' : 'Administration',
          employeeId: `${isDriver ? 'DRV' : 'EMP'}-${String(idx + 1).padStart(3, '0')}`,
          quotas,
          totalAllowed,
          totalUsed,
          totalRemaining
        })
      })
    } catch (err) {
      console.error('fetchStaffMembersWithLeaveQuotas employees error:', err)
    }

    return { success: true, staff: staffList }
  } catch (err: any) {
    console.error('fetchStaffMembersWithLeaveQuotas error:', err)
    return { success: false, staff: [], error: err.message || 'Failed to fetch staff leave quotas' }
  }
}

// Fetch active students for student leave requests (only added students in this institute)
export async function fetchStudentsForLeave(): Promise<{
  success: boolean
  students: StudentLeaveCandidate[]
  classes: string[]
  sections: string[]
  error?: string
}> {
  try {
    const session = await getSession('institute_session')
    let instId = session?.userId
    if (!instId || instId === 'default-inst') {
      const instCheck = await pool.query(`SELECT institution_id FROM institute_teachers WHERE institution_id IS NOT NULL LIMIT 1`)
      if (instCheck.rows.length > 0 && instCheck.rows[0].institution_id) {
        instId = String(instCheck.rows[0].institution_id)
      } else {
        const stuCheck = await pool.query(`SELECT institution_id FROM institute_students WHERE institution_id IS NOT NULL LIMIT 1`)
        if (stuCheck.rows.length > 0 && stuCheck.rows[0].institution_id) {
          instId = String(stuCheck.rows[0].institution_id)
        } else {
          instId = 'default-inst'
        }
      }
    }

    const res = await pool.query(`
      SELECT 
        id,
        COALESCE(NULLIF(name, ''), TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))) as name,
        COALESCE(admission_no, '') as admission_no,
        COALESCE(roll_no, '') as roll_no,
        COALESCE(class_name, '') as class_name,
        COALESCE(section_name, '') as section_name,
        COALESCE(status, 'Active') as status
      FROM institute_students
      WHERE institution_id = $1
        AND status NOT IN ('Deleted', 'Dropped', 'Passed')
      ORDER BY class_name ASC, roll_no ASC, name ASC
    `, [instId])

    const classesSet = new Set<string>()
    const sectionsSet = new Set<string>()

    const students: StudentLeaveCandidate[] = res.rows.map((r: any, idx: number) => {
      const cls = String(r.class_name || '').trim() || 'Class 1'
      const sec = String(r.section_name || '').trim().replace(/^section\s+/i, '') || 'A'
      if (cls) classesSet.add(cls)
      if (sec) sectionsSet.add(sec)

      return {
        id: String(r.id),
        name: String(r.name || `Student ${idx + 1}`).trim(),
        rollNo: String(r.roll_no || ''),
        admissionNo: String(r.admission_no || ''),
        className: cls,
        sectionName: sec,
        status: r.status
      }
    })

    return {
      success: true,
      students,
      classes: Array.from(classesSet).sort(),
      sections: Array.from(sectionsSet).sort()
    }
  } catch (err: any) {
    console.error('fetchStudentsForLeave error:', err)
    return { success: false, students: [], classes: [], sections: [], error: err.message }
  }
}

// Fetch leave requests from database
export async function fetchLeaveRequests(params?: {
  userType?: string
  status?: string
  searchQuery?: string
}): Promise<{
  success: boolean
  data: LeaveRequestItem[]
  counts: {
    all: number
    approved: number
    pending: number
    rejected: number
    student: number
    teacher: number
    employee: number
    driver: number
  }
  error?: string
}> {
  try {
    await ensureLeaveRequestsTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    let query = `
      SELECT id, institution_id, staff_id, staff_name, user_type, role, department, employee_id,
             class_name, section_name, roll_no, admission_no,
             leave_type, leave_abbr,
             TO_CHAR(apply_date, 'DD/MM/YYYY') as apply_date_str,
             TO_CHAR(from_date, 'YYYY-MM-DD') as from_date_raw,
             TO_CHAR(to_date, 'YYYY-MM-DD') as to_date_raw,
             TO_CHAR(from_date, 'DD/MM/YYYY') as from_date_str,
             TO_CHAR(to_date, 'DD/MM/YYYY') as to_date_str,
             duration, paid_days, unpaid_days, daily_breakdown, reason, status, is_paid, approved_by,
             TO_CHAR(action_date, 'DD/MM/YYYY') as action_date_str,
             action_notes, created_at
      FROM institute_leave_requests
      WHERE 1=1
    `
    const sqlParams: any[] = []
    let pIdx = 1

    if (params?.userType && params.userType !== 'All') {
      query += ` AND LOWER(user_type) = LOWER($${pIdx++})`
      sqlParams.push(params.userType)
    }

    if (params?.status && params.status !== 'All') {
      query += ` AND LOWER(status) = LOWER($${pIdx++})`
      sqlParams.push(params.status)
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      query += ` AND (staff_name ILIKE $${pIdx} OR leave_type ILIKE $${pIdx} OR role ILIKE $${pIdx} OR employee_id ILIKE $${pIdx} OR class_name ILIKE $${pIdx} OR roll_no ILIKE $${pIdx})`
      sqlParams.push(`%${params.searchQuery.trim()}%`)
      pIdx++
    }

    query += ` ORDER BY created_at DESC, from_date DESC`

    const res = await pool.query(query, sqlParams)

    // Calculate total counts including user_type breakdown
    const countRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'approved') as approved,
        COUNT(*) FILTER (WHERE LOWER(status) = 'pending') as pending,
        COUNT(*) FILTER (WHERE LOWER(status) = 'rejected' OR LOWER(status) = 'reject') as rejected,
        COUNT(*) FILTER (WHERE LOWER(user_type) = 'student') as student,
        COUNT(*) FILTER (WHERE LOWER(user_type) = 'teacher') as teacher,
        COUNT(*) FILTER (WHERE LOWER(user_type) = 'employee') as employee,
        COUNT(*) FILTER (WHERE LOWER(user_type) = 'driver') as driver
      FROM institute_leave_requests
    `)
    const counts = {
      all: parseInt(countRes.rows[0]?.total || '0', 10),
      approved: parseInt(countRes.rows[0]?.approved || '0', 10),
      pending: parseInt(countRes.rows[0]?.pending || '0', 10),
      rejected: parseInt(countRes.rows[0]?.rejected || '0', 10),
      student: parseInt(countRes.rows[0]?.student || '0', 10),
      teacher: parseInt(countRes.rows[0]?.teacher || '0', 10),
      employee: parseInt(countRes.rows[0]?.employee || '0', 10),
      driver: parseInt(countRes.rows[0]?.driver || '0', 10)
    }

    const data: LeaveRequestItem[] = res.rows.map((r: any) => {
      const fromStr = r.from_date_str || ''
      const toStr = r.to_date_str || ''
      const dateRange = fromStr === toStr ? fromStr : `${fromStr} to ${toStr}`

      let normalizedStatus: 'Approved' | 'Pending' | 'Rejected' = 'Pending'
      const st = String(r.status || '').toLowerCase()
      if (st === 'approved') normalizedStatus = 'Approved'
      else if (st === 'rejected' || st === 'reject') normalizedStatus = 'Rejected'

      const dur = parseFloat(r.duration) || 1
      let bdown: DailyBreakdownItem[] = []
      if (r.daily_breakdown) {
        try {
          bdown = typeof r.daily_breakdown === 'string' ? JSON.parse(r.daily_breakdown) : r.daily_breakdown
        } catch (e) {
          bdown = []
        }
      }
      const pDays = r.paid_days !== null && r.paid_days !== undefined
        ? parseFloat(r.paid_days)
        : (r.is_paid !== false ? dur : 0)
      const uDays = r.unpaid_days !== null && r.unpaid_days !== undefined
        ? parseFloat(r.unpaid_days)
        : (r.is_paid !== false ? 0 : dur)

      return {
        id: String(r.id),
        staffId: String(r.staff_id || ''),
        staffName: r.staff_name,
        userType: (r.user_type as any) || 'Teacher',
        role: r.role || 'Teacher',
        department: r.department || 'Academics',
        employeeId: r.employee_id || '',
        className: r.class_name || undefined,
        sectionName: r.section_name || undefined,
        rollNo: r.roll_no || undefined,
        admissionNo: r.admission_no || undefined,
        leaveType: r.leave_type,
        leaveAbbr: r.leave_abbr || 'CL',
        applyDate: r.apply_date_str || '',
        fromDate: r.from_date_raw || '',
        toDate: r.to_date_raw || '',
        dateRange,
        duration: dur,
        paidDays: pDays,
        unpaidDays: uDays,
        dailyBreakdown: bdown,
        reason: r.reason || '',
        status: normalizedStatus,
        isPaid: r.is_paid !== false && uDays === 0,
        approvedBy: r.approved_by || undefined,
        actionDate: r.action_date_str || undefined,
        actionNotes: r.action_notes || undefined,
        totalAllowedForType: 12,
        remainingForType: 10,
        createdAt: r.created_at ? r.created_at.toISOString() : ''
      }
    })

    return { success: true, data, counts }
  } catch (err: any) {
    console.error('fetchLeaveRequests error:', err)
    return {
      success: false,
      data: [],
      counts: { all: 0, approved: 0, pending: 0, rejected: 0, student: 0, teacher: 0, employee: 0, driver: 0 },
      error: err.message || 'Failed to fetch leave requests'
    }
  }
}

// Create a new leave request (by Admin, Staff, or for Student)
export async function createLeaveRequest(params: {
  staffId: string
  staffName: string
  userType: 'Teacher' | 'Employee' | 'Driver' | 'Student'
  role?: string
  department?: string
  employeeId?: string
  className?: string
  sectionName?: string
  rollNo?: string
  admissionNo?: string
  leaveType: string
  leaveAbbr?: string
  applyDate?: string
  fromDate: string
  toDate: string
  duration: number
  paidDays?: number
  unpaidDays?: number
  dailyBreakdown?: DailyBreakdownItem[]
  reason: string
  isPaid?: boolean
  status?: 'Approved' | 'Pending' | 'Rejected'
  actionNotes?: string
}): Promise<{ success: boolean; request?: LeaveRequestItem; error?: string }> {
  try {
    await ensureLeaveRequestsTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    const {
      staffId,
      staffName,
      userType,
      role = userType === 'Student' ? 'Student' : 'Teacher',
      department = userType === 'Student' ? (params.className ? `${params.className}${params.sectionName ? ' - ' + params.sectionName : ''}` : 'Class') : 'Academics',
      employeeId = userType === 'Student' ? (params.rollNo ? `Roll: ${params.rollNo}` : (params.admissionNo || '')) : '',
      className = params.className || '',
      sectionName = params.sectionName || '',
      rollNo = params.rollNo || '',
      admissionNo = params.admissionNo || '',
      leaveType,
      leaveAbbr = 'CL',
      applyDate = formatLocalDate(),
      fromDate,
      toDate,
      duration,
      dailyBreakdown = [],
      reason,
      status = 'Approved',
      actionNotes = 'Admin approved'
    } = params

    if (!staffName || !fromDate || !toDate || !duration || duration <= 0) {
      return { success: false, error: 'Please fill all required leave details.' }
    }

    let finalPaidDays = params.paidDays
    let finalUnpaidDays = params.unpaidDays
    let finalDailyBreakdown = dailyBreakdown

    if (userType === 'Student') {
      // In student there is no paid leave: it is a simple leave that marks Absent in attendance
      finalPaidDays = 0
      finalUnpaidDays = duration
      finalDailyBreakdown = []
    } else if (dailyBreakdown.length > 0) {
      finalPaidDays = dailyBreakdown.filter(d => d.isPaid).length
      finalUnpaidDays = dailyBreakdown.filter(d => !d.isPaid).length
    } else {
      if (finalPaidDays === undefined) {
        finalPaidDays = params.isPaid !== false ? duration : 0
      }
      if (finalUnpaidDays === undefined) {
        finalUnpaidDays = params.isPaid !== false ? 0 : duration
      }
    }
    const finalIsPaid = userType === 'Student' ? false : ((finalUnpaidDays || 0) === 0)
    const actionDate = status === 'Approved' ? formatLocalDate() : null
    const approvedBy = status === 'Approved' ? 'Admin' : null

    // Insert leave request
    const insRes = await pool.query(`
      INSERT INTO institute_leave_requests (
        institution_id, staff_id, staff_name, user_type, role, department, employee_id,
        class_name, section_name, roll_no, admission_no,
        leave_type, leave_abbr, apply_date, from_date, to_date, duration, paid_days, unpaid_days, daily_breakdown, reason,
        status, is_paid, approved_by, action_date, action_notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, NOW(), NOW()
      )
      RETURNING *
    `, [
      instId,
      staffId,
      staffName,
      userType,
      role,
      department,
      employeeId,
      className,
      sectionName,
      rollNo,
      admissionNo,
      leaveType,
      leaveAbbr,
      applyDate,
      fromDate,
      toDate,
      duration,
      finalPaidDays,
      finalUnpaidDays,
      JSON.stringify(finalDailyBreakdown),
      reason,
      status,
      finalIsPaid,
      approvedBy,
      actionDate,
      actionNotes
    ])

    // If status is Approved, immediately sync to attendance!
    if (status === 'Approved') {
      if (userType === 'Student') {
        await syncStudentLeaveToAttendance({
          instId,
          studentId: staffId,
          studentName: staffName,
          rollNo: rollNo || employeeId,
          admissionNo,
          className,
          sectionName,
          fromDate,
          toDate,
          notes: `Leave: ${leaveType} (${reason || 'Approved'})`
        })
      } else {
        await syncLeaveDatesToAttendance({
          instId,
          staffId,
          staffName,
          userType,
          role,
          department,
          employeeId,
          fromDate,
          toDate,
          isPaid: finalIsPaid,
          dailyBreakdown: finalDailyBreakdown,
          notes: `Leave: ${leaveType} (${reason || 'Approved'})`
        })
        await syncLeaveToPayroll({ fromDate, toDate })
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('createLeaveRequest error:', err)
    return { success: false, error: err.message || 'Failed to create leave request' }
  }
}

// Update Leave Request (allows changing leave dates, duration, leave type, isPaid status, day-by-day split, and approval)
export async function updateLeaveRequest(params: {
  requestId: string
  leaveType: string
  leaveAbbr?: string
  fromDate: string
  toDate: string
  duration: number
  paidDays?: number
  unpaidDays?: number
  dailyBreakdown?: DailyBreakdownItem[]
  isPaid: boolean
  status: 'Approved' | 'Pending' | 'Rejected'
  reason?: string
  actionNotes?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureLeaveRequestsTable()
    const {
      requestId,
      leaveType,
      leaveAbbr = 'CL',
      fromDate,
      toDate,
      duration,
      dailyBreakdown = [],
      isPaid,
      status,
      reason = '',
      actionNotes = ''
    } = params

    // 1. Fetch current request to see previous dates
    const curRes = await pool.query(`SELECT * FROM institute_leave_requests WHERE id = $1`, [requestId])
    if (curRes.rows.length === 0) return { success: false, error: 'Leave request not found' }
    const prev = curRes.rows[0]

    let finalPaidDays = params.paidDays
    let finalUnpaidDays = params.unpaidDays
    let finalDailyBreakdown = dailyBreakdown

    if (prev.user_type === 'Student') {
      finalPaidDays = 0
      finalUnpaidDays = duration
      finalDailyBreakdown = []
    } else if (dailyBreakdown.length > 0) {
      finalPaidDays = dailyBreakdown.filter(d => d.isPaid).length
      finalUnpaidDays = dailyBreakdown.filter(d => !d.isPaid).length
    } else {
      if (finalPaidDays === undefined) {
        finalPaidDays = isPaid ? duration : 0
      }
      if (finalUnpaidDays === undefined) {
        finalUnpaidDays = isPaid ? 0 : duration
      }
    }
    const finalIsPaid = prev.user_type === 'Student' ? false : ((finalUnpaidDays || 0) === 0)

    // 2. Clean previous attendance dates
    const prevFrom = prev.from_date ? (prev.from_date instanceof Date ? formatLocalDate(prev.from_date) : String(prev.from_date).split('T')[0]) : ''
    const prevTo = prev.to_date ? (prev.to_date instanceof Date ? formatLocalDate(prev.to_date) : String(prev.to_date).split('T')[0]) : ''
    if (prevFrom && prevTo) {
      if (prev.user_type === 'Student') {
        await cleanStudentLeaveFromAttendance({
          instId: prev.institution_id,
          studentName: prev.staff_name,
          rollNo: prev.roll_no || prev.employee_id,
          admissionNo: prev.admission_no,
          className: prev.class_name,
          fromDate: prevFrom,
          toDate: prevTo
        })
      } else {
        await cleanLeaveDatesFromAttendance({
          staffId: prev.staff_id,
          staffName: prev.staff_name,
          fromDate: prevFrom,
          toDate: prevTo
        })
      }
    }

    // 3. Update institute_leave_requests
    await pool.query(`
      UPDATE institute_leave_requests
      SET leave_type = $1,
          leave_abbr = $2,
          from_date = $3,
          to_date = $4,
          duration = $5,
          paid_days = $6,
          unpaid_days = $7,
          daily_breakdown = $8,
          is_paid = $9,
          status = $10,
          reason = $11,
          action_notes = $12,
          action_date = CASE WHEN $10::text = 'Approved' THEN CURRENT_DATE ELSE action_date END,
          approved_by = CASE WHEN $10::text = 'Approved' THEN 'Admin' ELSE approved_by END,
          updated_at = NOW()
      WHERE id = $13
    `, [leaveType, leaveAbbr, fromDate, toDate, duration, finalPaidDays, finalUnpaidDays, JSON.stringify(dailyBreakdown), finalIsPaid, status, reason, actionNotes, requestId])

    // 4. Sync new attendance dates if Approved
    if (status === 'Approved') {
      if (prev.user_type === 'Student') {
        await syncStudentLeaveToAttendance({
          instId: prev.institution_id,
          studentId: prev.staff_id,
          studentName: prev.staff_name,
          rollNo: prev.roll_no || prev.employee_id,
          admissionNo: prev.admission_no,
          className: prev.class_name,
          sectionName: prev.section_name,
          fromDate,
          toDate,
          notes: `Student Leave: ${leaveType}`
        })
      } else {
        await syncLeaveDatesToAttendance({
          instId: prev.institution_id,
          staffId: prev.staff_id,
          staffName: prev.staff_name,
          userType: prev.user_type,
          role: prev.role,
          department: prev.department,
          employeeId: prev.employee_id,
          fromDate,
          toDate,
          isPaid: finalIsPaid,
          dailyBreakdown,
          notes: finalIsPaid ? `Leave: ${leaveType}` : `Leave Split (${finalPaidDays} Paid, ${finalUnpaidDays} Unpaid): ${leaveType}`
        })
        await syncLeaveToPayroll({ fromDate, toDate, prevFromDate: prevFrom, prevToDate: prevTo })
      }
    } else if (prev.user_type !== 'Student') {
      await syncLeaveToPayroll({ fromDate, toDate, prevFromDate: prevFrom, prevToDate: prevTo })
    }

    return { success: true }
  } catch (err: any) {
    console.error('updateLeaveRequest error:', err)
    return { success: false, error: err.message || 'Failed to update leave request' }
  }
}

// Toggle between Paid Leave and Unpaid Leave / Absent
export async function toggleLeavePayType(params: {
  requestId: string
  isPaid: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureLeaveRequestsTable()
    const { requestId, isPaid } = params

    const cur = await pool.query(`SELECT * FROM institute_leave_requests WHERE id = $1`, [requestId])
    if (cur.rows.length === 0) return { success: false, error: 'Leave request not found' }
    const req = cur.rows[0]

    if (req.user_type === 'Student') {
      return { success: false, error: 'Student leave has no paid/unpaid status. It marks Absent in attendance.' }
    }

    const dur = parseFloat(req.duration) || 1

    let bdown: DailyBreakdownItem[] = []
    if (req.daily_breakdown) {
      try {
        bdown = typeof req.daily_breakdown === 'string' ? JSON.parse(req.daily_breakdown) : req.daily_breakdown
      } catch (e) {
        bdown = []
      }
    }
    const updatedBreakdown = bdown.map(d => ({ ...d, isPaid }))
    const paidDays = isPaid ? dur : 0
    const unpaidDays = isPaid ? 0 : dur

    await pool.query(`
      UPDATE institute_leave_requests
      SET is_paid = $1,
          paid_days = $2,
          unpaid_days = $3,
          daily_breakdown = $4,
          updated_at = NOW()
      WHERE id = $5
    `, [isPaid, paidDays, unpaidDays, JSON.stringify(updatedBreakdown), requestId])

    // If currently Approved, update attendance status between 'Leave' and 'Absent'
    if (req.status === 'Approved') {
      const fromStr = req.from_date ? (req.from_date instanceof Date ? formatLocalDate(req.from_date) : String(req.from_date).split('T')[0]) : ''
      const toStr = req.to_date ? (req.to_date instanceof Date ? formatLocalDate(req.to_date) : String(req.to_date).split('T')[0]) : ''
      if (fromStr && toStr) {
        await syncLeaveDatesToAttendance({
          instId: req.institution_id,
          staffId: req.staff_id,
          staffName: req.staff_name,
          userType: req.user_type,
          role: req.role,
          department: req.department,
          employeeId: req.employee_id,
          fromDate: fromStr,
          toDate: toStr,
          isPaid,
          dailyBreakdown: updatedBreakdown,
          notes: isPaid ? `Paid Leave: ${req.leave_type}` : `Unpaid Leave / Absent: ${req.leave_type}`
        })
        await syncLeaveToPayroll({ fromDate: fromStr, toDate: toStr })
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('toggleLeavePayType error:', err)
    return { success: false, error: err.message || 'Failed to toggle pay type' }
  }
}

// Update Leave Request Status (Approved or Rejected)
export async function updateLeaveRequestStatus(params: {
  requestId: string
  status: 'Approved' | 'Rejected' | 'Pending'
  isPaid?: boolean
  actionNotes?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureLeaveRequestsTable()
    const { requestId, status, isPaid, actionNotes } = params

    // 1. Fetch current leave request
    const curRes = await pool.query(`SELECT * FROM institute_leave_requests WHERE id = $1`, [requestId])
    if (curRes.rows.length === 0) {
      return { success: false, error: 'Leave request not found' }
    }
    const req = curRes.rows[0]
    const payStatus = req.user_type === 'Student' ? false : (isPaid !== undefined ? isPaid : (req.is_paid !== false))

    // 2. Update status in DB
    await pool.query(`
      UPDATE institute_leave_requests
      SET status = $1,
          is_paid = $2,
          action_notes = COALESCE($3, action_notes),
          action_date = CURRENT_DATE,
          approved_by = CASE WHEN $1::text = 'Approved' THEN 'Admin' ELSE approved_by END,
          updated_at = NOW()
      WHERE id = $4
    `, [status, payStatus, actionNotes, requestId])

    // 3. Sync to attendance
    const fromStr = req.from_date ? (req.from_date instanceof Date ? formatLocalDate(req.from_date) : String(req.from_date).split('T')[0]) : ''
    const toStr = req.to_date ? (req.to_date instanceof Date ? formatLocalDate(req.to_date) : String(req.to_date).split('T')[0]) : ''

    let bdown: DailyBreakdownItem[] = []
    if (req.daily_breakdown) {
      try {
        bdown = typeof req.daily_breakdown === 'string' ? JSON.parse(req.daily_breakdown) : req.daily_breakdown
      } catch (e) {
        bdown = []
      }
    }

    if (status === 'Approved') {
      if (req.user_type === 'Student') {
        await syncStudentLeaveToAttendance({
          instId: req.institution_id,
          studentId: req.staff_id,
          studentName: req.staff_name,
          rollNo: req.roll_no || req.employee_id,
          admissionNo: req.admission_no,
          className: req.class_name,
          sectionName: req.section_name,
          fromDate: fromStr,
          toDate: toStr,
          notes: `Student Leave: ${req.leave_type}`
        })
      } else {
        await syncLeaveDatesToAttendance({
          instId: req.institution_id,
          staffId: req.staff_id,
          staffName: req.staff_name,
          userType: req.user_type,
          role: req.role,
          department: req.department,
          employeeId: req.employee_id,
          fromDate: fromStr,
          toDate: toStr,
          isPaid: payStatus,
          dailyBreakdown: bdown,
          notes: payStatus ? `Leave: ${req.leave_type}` : `Unpaid Leave / Absent: ${req.leave_type}`
        })
      }
    } else if (status === 'Rejected' || status === 'Pending') {
      // Clean attendance
      if (fromStr && toStr) {
        if (req.user_type === 'Student') {
          await cleanStudentLeaveFromAttendance({
            instId: req.institution_id,
            studentName: req.staff_name,
            rollNo: req.roll_no || req.employee_id,
            admissionNo: req.admission_no,
            className: req.class_name,
            fromDate: fromStr,
            toDate: toStr
          })
        } else {
          await cleanLeaveDatesFromAttendance({
            staffId: req.staff_id,
            staffName: req.staff_name,
            fromDate: fromStr,
            toDate: toStr
          })
        }
      }
    }

    if (fromStr && toStr && req.user_type !== 'Student') {
      await syncLeaveToPayroll({ fromDate: fromStr, toDate: toStr })
    }

    return { success: true }
  } catch (err: any) {
    console.error('updateLeaveRequestStatus error:', err)
    return { success: false, error: err.message || 'Failed to update leave status' }
  }
}

// Delete leave request
export async function deleteLeaveRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureLeaveRequestsTable()

    const cur = await pool.query(`SELECT * FROM institute_leave_requests WHERE id = $1`, [requestId])
    if (cur.rows.length > 0) {
      const req = cur.rows[0]
      const fromStr = req.from_date ? (req.from_date instanceof Date ? formatLocalDate(req.from_date) : String(req.from_date).split('T')[0]) : ''
      const toStr = req.to_date ? (req.to_date instanceof Date ? formatLocalDate(req.to_date) : String(req.to_date).split('T')[0]) : ''
      if (fromStr && toStr) {
        if (req.user_type === 'Student') {
          await cleanStudentLeaveFromAttendance({
            instId: req.institution_id,
            studentName: req.staff_name,
            rollNo: req.roll_no || req.employee_id,
            admissionNo: req.admission_no,
            className: req.class_name,
            fromDate: fromStr,
            toDate: toStr
          })
        } else {
          await cleanLeaveDatesFromAttendance({
            staffId: req.staff_id,
            staffName: req.staff_name,
            fromDate: fromStr,
            toDate: toStr
          })
          await syncLeaveToPayroll({ fromDate: fromStr, toDate: toStr })
        }
      }
    }

    await pool.query(`DELETE FROM institute_leave_requests WHERE id = $1`, [requestId])
    return { success: true }
  } catch (err: any) {
    console.error('deleteLeaveRequest error:', err)
    return { success: false, error: err.message || 'Failed to delete leave request' }
  }
}

// Helper: Automatically update institute_payroll for all affected months
async function syncLeaveToPayroll(params: {
  fromDate?: string
  toDate?: string
  prevFromDate?: string
  prevToDate?: string
}) {
  try {
    const months = new Set<string>()
    if (params.fromDate) months.add(params.fromDate.slice(0, 7))
    if (params.toDate) months.add(params.toDate.slice(0, 7))
    if (params.prevFromDate) months.add(params.prevFromDate.slice(0, 7))
    if (params.prevToDate) months.add(params.prevToDate.slice(0, 7))

    for (const ym of months) {
      if (/^\d{4}-\d{2}$/.test(ym)) {
        await generatePayrollForMonth(ym, 'monthly_fixed')
      }
    }
  } catch (err) {
    console.error('syncLeaveToPayroll error:', err)
  }
}

// Helper: Clean leave records from attendance table
async function cleanLeaveDatesFromAttendance(params: {
  staffId: string
  staffName: string
  fromDate: string
  toDate: string
}) {
  try {
    const { staffId, staffName, fromDate, toDate } = params
    if (!fromDate || !toDate) return
    await pool.query(`
      DELETE FROM institute_staff_attendance
      WHERE (staff_id = $1 OR LOWER(staff_name) = LOWER($2))
        AND attendance_date >= $3::date
        AND attendance_date <= $4::date
        AND source_mode = 'Leave Request'
    `, [staffId, staffName, fromDate, toDate])
  } catch (err) {
    console.error('cleanLeaveDatesFromAttendance error:', err)
  }
}

// Helper: Sync leave dates into institute_staff_attendance table
async function syncLeaveDatesToAttendance(params: {
  instId: string
  staffId: string
  staffName: string
  userType: string
  role: string
  department: string
  employeeId?: string
  fromDate: string
  toDate: string
  isPaid?: boolean
  dailyBreakdown?: DailyBreakdownItem[]
  notes?: string
}) {
  try {
    const { instId, staffId, staffName, role, department, employeeId = '', fromDate, toDate, isPaid = true, dailyBreakdown, notes } = params
    if (!fromDate || !toDate) return

    // If day-by-day breakdown is provided, sync each date with its exact paid/unpaid status
    if (Array.isArray(dailyBreakdown) && dailyBreakdown.length > 0) {
      for (const item of dailyBreakdown) {
        if (!item.date) continue
        const curStatus = item.isPaid ? 'Leave' : 'Absent'
        const curNote = item.isPaid ? `Paid Leave: ${notes || ''}` : `Unpaid Leave (Absent): ${notes || ''}`

        await pool.query(`
          DELETE FROM institute_staff_attendance
          WHERE attendance_date = $1::date AND (staff_id = $2 OR LOWER(staff_name) = LOWER($3))
        `, [item.date, staffId, staffName])

        await pool.query(`
          INSERT INTO institute_staff_attendance (
            institution_id, staff_id, staff_name, employee_id, role, department,
            attendance_date, status, source_mode, notes, marked_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 'Leave Request', $9, 'Leave Approval', NOW(), NOW()
          )
        `, [
          instId,
          staffId,
          staffName,
          employeeId,
          role,
          department,
          item.date,
          curStatus,
          curNote
        ])
      }
      return
    }

    // Fallback: Uniform range iteration
    const start = parseLocalDate(fromDate)
    const end = parseLocalDate(toDate)
    const attendanceStatus = isPaid ? 'Leave' : 'Absent'

    const cur = new Date(start)
    while (cur <= end) {
      // If range spans multiple days and today is Sunday, skip it (unless start is end)
      if (cur.getDay() === 0 && start.getTime() !== end.getTime()) {
        cur.setDate(cur.getDate() + 1)
        continue
      }

      const dStr = formatLocalDate(cur)

      // Delete any existing attendance record for this day and staff member
      await pool.query(`
        DELETE FROM institute_staff_attendance
        WHERE attendance_date = $1::date AND (staff_id = $2 OR LOWER(staff_name) = LOWER($3))
      `, [dStr, staffId, staffName])

      // Insert new Leave or Absent attendance record
      await pool.query(`
        INSERT INTO institute_staff_attendance (
          institution_id, staff_id, staff_name, employee_id, role, department,
          attendance_date, status, source_mode, notes, marked_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'Leave Request', $9, 'Leave Approval', NOW(), NOW()
        )
      `, [
        instId,
        staffId,
        staffName,
        employeeId,
        role,
        department,
        dStr,
        attendanceStatus,
        notes || (isPaid ? 'Approved Leave' : 'Unpaid Leave (Absent)')
      ])

      cur.setDate(cur.getDate() + 1)
    }
  } catch (err) {
    console.error('syncLeaveDatesToAttendance error:', err)
  }
}

// Helper: Clean student leave records from institute_attendance
async function cleanStudentLeaveFromAttendance(params: {
  instId: string
  studentName: string
  rollNo?: string
  admissionNo?: string
  className?: string
  fromDate: string
  toDate: string
}) {
  try {
    const { instId, studentName, rollNo = '', admissionNo = '', className = '', fromDate, toDate } = params
    if (!fromDate || !toDate) return

    await pool.query(`
      DELETE FROM institute_attendance
      WHERE (institution_id = $1 OR institution_id = 'default-inst' OR $1 = 'default-inst')
        AND attendance_date >= $2::date
        AND attendance_date <= $3::date
        AND (
          LOWER(TRIM(student_name)) = LOWER(TRIM($4))
          OR (NULLIF($5, '') IS NOT NULL AND roll_no = $5 AND LOWER(class_name) = LOWER($6))
          OR (NULLIF($7, '') IS NOT NULL AND admission_no = $7)
        )
        AND source_mode = 'Leave Request'
    `, [instId, fromDate, toDate, studentName, rollNo, className, admissionNo])
  } catch (err) {
    console.error('cleanStudentLeaveFromAttendance error:', err)
  }
}

// Helper: Sync student leave into institute_attendance table (marks Absent in attendance)
async function syncStudentLeaveToAttendance(params: {
  instId: string
  studentId?: string
  studentName: string
  rollNo?: string
  admissionNo?: string
  className?: string
  sectionName?: string
  fromDate: string
  toDate: string
  notes?: string
}) {
  try {
    const {
      instId,
      studentName,
      rollNo = '',
      admissionNo = '',
      className = '',
      sectionName = '',
      fromDate,
      toDate,
      notes
    } = params

    if (!fromDate || !toDate) return

    // Ensure student attendance table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id VARCHAR(255) NOT NULL,
        student_name VARCHAR(255),
        roll_no VARCHAR(100),
        admission_no VARCHAR(100),
        class_name VARCHAR(100),
        section_name VARCHAR(50),
        attendance_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        source_mode VARCHAR(50) DEFAULT 'Manual',
        marked_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // In student there is no paid leave: simple leave marks Absent in attendance
    const attendanceStatus = 'Absent'

    const start = parseLocalDate(fromDate)
    const end = parseLocalDate(toDate)

    const cur = new Date(start)
    while (cur <= end) {
      if (cur.getDay() === 0 && start.getTime() !== end.getTime()) {
        cur.setDate(cur.getDate() + 1)
        continue
      }
      const dStr = formatLocalDate(cur)

      await pool.query(`
        DELETE FROM institute_attendance
        WHERE (institution_id = $1 OR institution_id = 'default-inst' OR $1 = 'default-inst')
          AND attendance_date = $2::date
          AND (
            LOWER(TRIM(student_name)) = LOWER(TRIM($3))
            OR (NULLIF($4, '') IS NOT NULL AND roll_no = $4 AND LOWER(class_name) = LOWER($5))
            OR (NULLIF($6, '') IS NOT NULL AND admission_no = $6)
          )
      `, [instId, dStr, studentName, rollNo, className, admissionNo])

      await pool.query(`
        INSERT INTO institute_attendance (
          institution_id, student_name, roll_no, admission_no,
          class_name, section_name, attendance_date, status,
          source_mode, marked_by, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7::date, $8, 'Leave Request', 'Leave Approval', NOW()
        )
      `, [instId, studentName, rollNo, admissionNo, className, sectionName, dStr, attendanceStatus])

      cur.setDate(cur.getDate() + 1)
    }
  } catch (err) {
    console.error('syncStudentLeaveToAttendance error:', err)
  }
}
