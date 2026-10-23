'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

// Ensure DB tables exist for institute-wise homework tasks and student submissions
async function ensureHomeworkTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_homework_tasks (
      id TEXT PRIMARY KEY,
      institution_id VARCHAR(255) NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      subject VARCHAR(255) NOT NULL,
      classes VARCHAR(255) NOT NULL,
      section VARCHAR(50) NOT NULL,
      assigned_by VARCHAR(255),
      assign_date VARCHAR(50),
      submission_date VARCHAR(50),
      has_attachment BOOLEAN DEFAULT FALSE,
      attachment_name TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_inst_hw_tasks_inst ON institute_homework_tasks(institution_id);
    CREATE INDEX IF NOT EXISTS idx_inst_hw_tasks_cls ON institute_homework_tasks(institution_id, classes, section, subject);

    CREATE TABLE IF NOT EXISTS institute_homework_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      task_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT,
      admission_no TEXT,
      roll_no TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      remark TEXT,
      submitted_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_inst_task_student UNIQUE (institution_id, task_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_inst_hw_sub_task ON institute_homework_submissions(institution_id, task_id);
  `)
}

// 1. Fetch homework tasks for the authenticated institution
export async function fetchHomeworkTasks(classes?: string, section?: string, subject?: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureHomeworkTables()
    let query = `
      SELECT id, title, description, subject, classes, section, assigned_by as "assignedBy",
             assign_date as "assignDate", submission_date as "submissionDate",
             has_attachment as "hasAttachment", attachment_name as "attachmentName",
             status, created_at as "createdAt"
      FROM institute_homework_tasks
      WHERE institution_id = $1
    `
    const params: any[] = [session.userId]

    if (classes && section && subject) {
      query += ` AND LOWER(classes) = LOWER($2) AND LOWER(section) = LOWER($3) AND LOWER(subject) = LOWER($4)`
      params.push(classes, section, subject)
    }

    query += ` ORDER BY created_at DESC`

    const res = await pool.query(query, params)
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 2. Create or save homework task in DB
export async function createHomeworkTask(task: {
  id: string
  title: string
  description?: string
  subject: string
  classes: string
  section: string
  assignedBy?: string
  assignDate?: string
  submissionDate?: string
  hasAttachment?: boolean
  attachmentName?: string
}) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureHomeworkTables()
    const taskId = task.id || `task-${Date.now()}`
    const res = await pool.query(`
      INSERT INTO institute_homework_tasks (
        id, institution_id, title, description, subject, classes, section,
        assigned_by, assign_date, submission_date, has_attachment, attachment_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Active')
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        assign_date = EXCLUDED.assign_date,
        submission_date = EXCLUDED.submission_date,
        has_attachment = EXCLUDED.has_attachment,
        attachment_name = EXCLUDED.attachment_name,
        updated_at = NOW()
      RETURNING id, title, description, subject, classes, section, assigned_by as "assignedBy",
                assign_date as "assignDate", submission_date as "submissionDate",
                has_attachment as "hasAttachment", attachment_name as "attachmentName", status
    `, [
      taskId,
      session.userId,
      task.title,
      task.description || '',
      task.subject,
      task.classes,
      task.section,
      task.assignedBy || 'Faculty',
      task.assignDate || '',
      task.submissionDate || '',
      !!task.hasAttachment,
      task.attachmentName || null
    ])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 3. Fetch all student submissions for a specific task
export async function fetchTaskSubmissions(taskId: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureHomeworkTables()
    const res = await pool.query(`
      SELECT student_id as "studentId", student_name as "studentName", admission_no as "admissionNo",
             roll_no as "rollNo", status, remark,
             TO_CHAR(submitted_at, 'DD/MM/YYYY HH12:MI AM') as "submittedAt"
      FROM institute_homework_submissions
      WHERE institution_id = $1 AND task_id = $2
    `, [session.userId, taskId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 4. Update one student task status
export async function updateStudentTaskSubmission(
  taskId: string,
  studentId: string,
  status: 'Submitted' | 'Pending',
  meta?: { studentName?: string; admissionNo?: string; rollNo?: string; remark?: string }
) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureHomeworkTables()
    const submittedAt = status === 'Submitted' ? new Date() : null

    await pool.query(`
      INSERT INTO institute_homework_submissions (
        institution_id, task_id, student_id, student_name, admission_no, roll_no, status, remark, submitted_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (institution_id, task_id, student_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        student_name = COALESCE(EXCLUDED.student_name, institute_homework_submissions.student_name),
        admission_no = COALESCE(EXCLUDED.admission_no, institute_homework_submissions.admission_no),
        roll_no = COALESCE(EXCLUDED.roll_no, institute_homework_submissions.roll_no),
        remark = CASE WHEN EXCLUDED.remark IS NOT NULL THEN EXCLUDED.remark ELSE institute_homework_submissions.remark END,
        submitted_at = CASE WHEN EXCLUDED.status = 'Submitted' THEN COALESCE(institute_homework_submissions.submitted_at, NOW()) ELSE NULL END,
        updated_at = NOW()
    `, [
      session.userId,
      taskId,
      studentId,
      meta?.studentName || null,
      meta?.admissionNo || null,
      meta?.rollNo || null,
      status,
      meta?.remark !== undefined ? meta.remark : null,
      submittedAt
    ])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 5. Update student remark specifically
export async function updateStudentRemark(
  taskId: string,
  studentId: string,
  remark: string,
  status?: 'Submitted' | 'Pending',
  meta?: { studentName?: string; admissionNo?: string; rollNo?: string }
) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureHomeworkTables()
    const stStatus = status || 'Submitted'
    const submittedAt = stStatus === 'Submitted' ? new Date() : null

    await pool.query(`
      INSERT INTO institute_homework_submissions (
        institution_id, task_id, student_id, student_name, admission_no, roll_no, status, remark, submitted_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (institution_id, task_id, student_id)
      DO UPDATE SET
        remark = EXCLUDED.remark,
        status = COALESCE(EXCLUDED.status, institute_homework_submissions.status),
        student_name = COALESCE(EXCLUDED.student_name, institute_homework_submissions.student_name),
        admission_no = COALESCE(EXCLUDED.admission_no, institute_homework_submissions.admission_no),
        roll_no = COALESCE(EXCLUDED.roll_no, institute_homework_submissions.roll_no),
        updated_at = NOW()
    `, [
      session.userId,
      taskId,
      studentId,
      meta?.studentName || null,
      meta?.admissionNo || null,
      meta?.rollNo || null,
      stStatus,
      remark,
      submittedAt
    ])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 6. Bulk update multiple students task status and/or remark at once
export async function bulkUpdateStudentTaskSubmissions(
  taskId: string,
  students: { studentId: string; studentName?: string; admissionNo?: string; rollNo?: string; remark?: string }[],
  status: 'Submitted' | 'Pending',
  defaultRemark?: string
) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  if (!students || students.length === 0) return { success: true }

  try {
    await ensureHomeworkTables()
    const submittedAt = status === 'Submitted' ? new Date() : null

    for (const st of students) {
      const studentRemark = st.remark !== undefined ? st.remark : (defaultRemark !== undefined ? defaultRemark : null)
      await pool.query(`
        INSERT INTO institute_homework_submissions (
          institution_id, task_id, student_id, student_name, admission_no, roll_no, status, remark, submitted_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (institution_id, task_id, student_id)
        DO UPDATE SET
          status = EXCLUDED.status,
          remark = CASE WHEN EXCLUDED.remark IS NOT NULL THEN EXCLUDED.remark ELSE institute_homework_submissions.remark END,
          student_name = COALESCE(EXCLUDED.student_name, institute_homework_submissions.student_name),
          admission_no = COALESCE(EXCLUDED.admission_no, institute_homework_submissions.admission_no),
          roll_no = COALESCE(EXCLUDED.roll_no, institute_homework_submissions.roll_no),
          submitted_at = CASE WHEN EXCLUDED.status = 'Submitted' THEN COALESCE(institute_homework_submissions.submitted_at, NOW()) ELSE NULL END,
          updated_at = NOW()
      `, [
        session.userId,
        taskId,
        st.studentId,
        st.studentName || null,
        st.admissionNo || null,
        st.rollNo || null,
        status,
        studentRemark,
        submittedAt
      ])
    }

    return { success: true, count: students.length }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
