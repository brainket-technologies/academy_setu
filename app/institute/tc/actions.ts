'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export interface TCTemplateData {
  id?: string | number
  title: string
  subtitle?: string
  prefix: string
  startNo: string
  classes: string[]
  designId: number
  themeColor?: string
  schoolName?: string
  schoolAddress?: string
  schoolEmail?: string
  schoolPhone?: string
  schoolCode?: string
  affiliationBoard?: string
  affiliationNo?: string
  udiseCode?: string
  schoolLogo?: string
  principalName?: string
  principalSignLabel?: string
  teacherSignLabel?: string
  preparedBySignLabel?: string
  checkedBySignLabel?: string
  showWatermark?: boolean
  showQrCode?: boolean
  isDefault?: boolean

  // Typography & Sizing Studio Fields
  logoSize?: number | string
  schoolNameFontSize?: number | string
  titleFontSize?: number | string
  subtitleFontSize?: number | string
  bodyFontSize?: number | string
  stampSize?: number | string
  photoSize?: number | string
  qrSize?: number | string
  showLogo?: boolean
  showPhoto?: boolean
  showStamp?: boolean
}

let tcTableEnsured = false
async function ensureTCTemplateTable() {
  if (tcTableEnsured) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_tc_templates (
        id SERIAL PRIMARY KEY,
        institution_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        prefix VARCHAR(50),
        start_no VARCHAR(50),
        classes TEXT[],
        design_id INT DEFAULT 1,
        theme_color VARCHAR(50),
        school_name VARCHAR(255),
        school_address VARCHAR(255),
        school_email VARCHAR(255),
        school_phone VARCHAR(50),
        school_code VARCHAR(50),
        affiliation_board VARCHAR(255),
        affiliation_no VARCHAR(50),
        udise_code VARCHAR(50),
        principal_name VARCHAR(255),
        principal_sign_label VARCHAR(255),
        teacher_sign_label VARCHAR(255),
        prepared_by_sign_label VARCHAR(255),
        checked_by_sign_label VARCHAR(255),
        show_watermark BOOLEAN DEFAULT TRUE,
        show_qr_code BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS affiliation_board VARCHAR(255);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS school_code VARCHAR(50);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS affiliation_no VARCHAR(50);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS udise_code VARCHAR(50);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS school_logo TEXT;
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS logo_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS school_name_font_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS title_font_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS subtitle_font_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS body_font_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS stamp_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS photo_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS qr_size VARCHAR(20);
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT TRUE;
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS show_photo BOOLEAN DEFAULT TRUE;
      ALTER TABLE institute_tc_templates ADD COLUMN IF NOT EXISTS show_stamp BOOLEAN DEFAULT TRUE;
    `)
    tcTableEnsured = true
  } catch (e) {
    console.error('Failed to ensure institute_tc_templates table', e)
  }
}

// -------------------------------------------------------------
// FETCH ALL TC TEMPLATES
// -------------------------------------------------------------
export async function fetchTCTemplates() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureTCTemplateTable()

  try {
    const res = await pool.query(`
      SELECT 
        id, 
        title, 
        subtitle, 
        prefix, 
        start_no as "startNo", 
        classes, 
        design_id as "designId", 
        theme_color as "themeColor",
        school_name as "schoolName",
        school_address as "schoolAddress",
        school_email as "schoolEmail",
        school_phone as "schoolPhone",
        school_code as "schoolCode",
        affiliation_board as "affiliationBoard",
        affiliation_no as "affiliationNo",
        udise_code as "udiseCode",
        school_logo as "schoolLogo",
        principal_name as "principalName",
        principal_sign_label as "principalSignLabel",
        teacher_sign_label as "teacherSignLabel",
        prepared_by_sign_label as "preparedBySignLabel",
        checked_by_sign_label as "checkedBySignLabel",
        show_watermark as "showWatermark",
        show_qr_code as "showQrCode",
        is_default as "isDefault",
        logo_size as "logoSize",
        school_name_font_size as "schoolNameFontSize",
        title_font_size as "titleFontSize",
        subtitle_font_size as "subtitleFontSize",
        body_font_size as "bodyFontSize",
        stamp_size as "stampSize",
        photo_size as "photoSize",
        qr_size as "qrSize",
        show_logo as "showLogo",
        show_photo as "showPhoto",
        show_stamp as "showStamp",
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_tc_templates
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY is_default DESC, created_at DESC
    `, [institutionId])

    return { success: true, data: res.rows }
  } catch (e: any) {
    console.error('Error fetching TC templates:', e)
    return { success: false, error: e.message, data: [] }
  }
}

// -------------------------------------------------------------
// SAVE TC TEMPLATE (CREATE OR UPDATE)
// -------------------------------------------------------------
export async function saveTCTemplate(data: TCTemplateData) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureTCTemplateTable()

  try {
    if (data.isDefault) {
      await pool.query(`
        UPDATE institute_tc_templates SET is_default = FALSE WHERE institution_id = $1
      `, [institutionId])
    }

    if (data.id && !isNaN(Number(data.id))) {
      // Update
      const res = await pool.query(`
        UPDATE institute_tc_templates
        SET 
          title = $1,
          subtitle = $2,
          prefix = $3,
          start_no = $4,
          classes = $5,
          design_id = $6,
          theme_color = $7,
          school_name = $8,
          school_address = $9,
          school_email = $10,
          school_phone = $11,
          school_code = $12,
          affiliation_board = $13,
          affiliation_no = $14,
          udise_code = $15,
          principal_name = $16,
          principal_sign_label = $17,
          teacher_sign_label = $18,
          prepared_by_sign_label = $19,
          checked_by_sign_label = $20,
          show_watermark = $21,
          show_qr_code = $22,
          is_default = $23,
          school_logo = $24,
          logo_size = $25,
          school_name_font_size = $26,
          title_font_size = $27,
          subtitle_font_size = $28,
          body_font_size = $29,
          stamp_size = $30,
          photo_size = $31,
          qr_size = $32,
          show_logo = $33,
          show_photo = $34,
          show_stamp = $35
        WHERE id = $36 AND (institution_id = $37 OR institution_id = 'default_institution')
        RETURNING *
      `, [
        data.title,
        data.subtitle || 'Official Institutional Transfer Document',
        data.prefix || 'TC/2026/',
        data.startNo || '1001',
        data.classes || [],
        data.designId || 1,
        data.themeColor || '#1E3A8A',
        data.schoolName || '',
        data.schoolAddress || '',
        data.schoolEmail || '',
        data.schoolPhone || '',
        data.schoolCode || '0012',
        data.affiliationBoard || 'Central Board of Secondary Education',
        data.affiliationNo || '2130048',
        data.udiseCode || '09123456789',
        data.principalName || '',
        data.principalSignLabel || 'Principal',
        data.teacherSignLabel || 'Class Teacher',
        data.preparedBySignLabel || 'Prepared By',
        data.checkedBySignLabel || 'Checked By',
        data.showWatermark !== false,
        data.showQrCode !== false,
        data.isDefault || false,
        data.schoolLogo || '',
        String(data.logoSize || '64'),
        String(data.schoolNameFontSize || '24'),
        String(data.titleFontSize || '20'),
        String(data.subtitleFontSize || '10.5'),
        String(data.bodyFontSize || '10.5'),
        String(data.stampSize || '76'),
        String(data.photoSize || '80'),
        String(data.qrSize || '44'),
        data.showLogo !== false,
        data.showPhoto !== false,
        data.showStamp !== false,
        data.id,
        institutionId
      ])
      return { success: true, data: res.rows[0] }
    } else {
      // Insert
      const res = await pool.query(`
        INSERT INTO institute_tc_templates (
          institution_id,
          title,
          subtitle,
          prefix,
          start_no,
          classes,
          design_id,
          theme_color,
          school_name,
          school_address,
          school_email,
          school_phone,
          school_code,
          affiliation_board,
          affiliation_no,
          udise_code,
          principal_name,
          principal_sign_label,
          teacher_sign_label,
          prepared_by_sign_label,
          checked_by_sign_label,
          show_watermark,
          show_qr_code,
          is_default,
          school_logo,
          logo_size,
          school_name_font_size,
          title_font_size,
          subtitle_font_size,
          body_font_size,
          stamp_size,
          photo_size,
          qr_size,
          show_logo,
          show_photo,
          show_stamp
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
        ) RETURNING *
      `, [
        institutionId,
        data.title,
        data.subtitle || 'Official Institutional Transfer Document',
        data.prefix || 'TC/2026/',
        data.startNo || '1001',
        data.classes || [],
        data.designId || 1,
        data.themeColor || '#1E3A8A',
        data.schoolName || '',
        data.schoolAddress || '',
        data.schoolEmail || '',
        data.schoolPhone || '',
        data.schoolCode || '0012',
        data.affiliationBoard || 'Central Board of Secondary Education',
        data.affiliationNo || '2130048',
        data.udiseCode || '09123456789',
        data.principalName || '',
        data.principalSignLabel || 'Principal',
        data.teacherSignLabel || 'Class Teacher',
        data.preparedBySignLabel || 'Prepared By',
        data.checkedBySignLabel || 'Checked By',
        data.showWatermark !== false,
        data.showQrCode !== false,
        data.isDefault || false,
        data.schoolLogo || '',
        String(data.logoSize || '64'),
        String(data.schoolNameFontSize || '24'),
        String(data.titleFontSize || '20'),
        String(data.subtitleFontSize || '10.5'),
        String(data.bodyFontSize || '10.5'),
        String(data.stampSize || '76'),
        String(data.photoSize || '80'),
        String(data.qrSize || '44'),
        data.showLogo !== false,
        data.showPhoto !== false,
        data.showStamp !== false
      ])
      return { success: true, data: res.rows[0] }
    }
  } catch (e: any) {
    console.error('Error saving TC template:', e)
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// DELETE TC TEMPLATE
// -------------------------------------------------------------
export async function deleteTCTemplate(id: string | number) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureTCTemplateTable()

  try {
    await pool.query(`
      DELETE FROM institute_tc_templates
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])
    return { success: true }
  } catch (e: any) {
    console.error('Error deleting TC template:', e)
    return { success: false, error: e.message }
  }
}

// -------------------------------------------------------------
// SET DEFAULT TEMPLATE
// -------------------------------------------------------------
export async function setDefaultTCTemplate(id: string | number) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureTCTemplateTable()

  try {
    await pool.query(`
      UPDATE institute_tc_templates SET is_default = FALSE WHERE institution_id = $1
    `, [institutionId])

    await pool.query(`
      UPDATE institute_tc_templates SET is_default = TRUE WHERE id = $1 AND institution_id = $2
    `, [id, institutionId])

    return { success: true }
  } catch (e: any) {
    console.error('Error setting default TC template:', e)
    return { success: false, error: e.message }
  }
}
