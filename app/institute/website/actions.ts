'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function getInstitutionId() {
  const session = await getSession('institute_session')
  if (session?.userId && session.userId !== 'default_institution') {
    return session.userId
  }
  try {
    const res = await pool.query('SELECT id FROM institutions LIMIT 1')
    if (res.rows[0]?.id) return res.rows[0].id
  } catch (e) {}
  return 'default_institution'
}

// ─────────────────────────────────────────────
// SLUG HELPERS
// ─────────────────────────────────────────────
export async function generateSlug(name: string): Promise<string> {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
}

// ─────────────────────────────────────────────
// GENERAL SETTINGS
// ─────────────────────────────────────────────
export async function fetchWebsiteSettings() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(
      `SELECT * FROM institute_website_settings WHERE institution_id = $1`,
      [institutionId]
    )
    return { success: true, data: res.rows[0] || null }
  } catch (err: any) {
    return { success: false, error: err.message, data: null }
  }
}

export async function saveWebsiteSettings(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    // Auto-generate slug from website_title if not provided
    let slug = data.slug
    if (!slug && data.website_title) {
      slug = await generateSlug(data.website_title)
    }

    const res = await pool.query(
      `INSERT INTO institute_website_settings (
        institution_id, slug, website_title, contact_email, contact_phone,
        contact_address, about_text, about_vision, about_mission, about_image_url,
        logo_url, favicon_url, hero_tagline, hero_sub_text,
        primary_color, secondary_color,
        topbar_bg_color, topbar_text_color,
        navbar_bg_color, navbar_text_color,
        footer_bg_color, footer_text_color,
        heading_color, body_text_color, button_text_color, link_color,
        section_alt_bg, hero_overlay_color, hero_text_color,
        card_bg_color, card_border_color,
        font_family, heading_font_family,
        social_facebook, social_instagram, social_twitter, social_youtube, social_linkedin,
        google_map_link, is_published, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,
        $17,$18,
        $19,$20,
        $21,$22,
        $23,$24,$25,$26,
        $27,$28,$29,
        $30,$31,
        $32,$33,
        $34,$35,$36,$37,$38,
        $39,$40,now()
      )
      ON CONFLICT (institution_id) DO UPDATE SET
        slug = EXCLUDED.slug,
        website_title = EXCLUDED.website_title,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        contact_address = EXCLUDED.contact_address,
        about_text = EXCLUDED.about_text,
        about_vision = EXCLUDED.about_vision,
        about_mission = EXCLUDED.about_mission,
        about_image_url = EXCLUDED.about_image_url,
        logo_url = EXCLUDED.logo_url,
        favicon_url = EXCLUDED.favicon_url,
        hero_tagline = EXCLUDED.hero_tagline,
        hero_sub_text = EXCLUDED.hero_sub_text,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        topbar_bg_color = EXCLUDED.topbar_bg_color,
        topbar_text_color = EXCLUDED.topbar_text_color,
        navbar_bg_color = EXCLUDED.navbar_bg_color,
        navbar_text_color = EXCLUDED.navbar_text_color,
        footer_bg_color = EXCLUDED.footer_bg_color,
        footer_text_color = EXCLUDED.footer_text_color,
        heading_color = EXCLUDED.heading_color,
        body_text_color = EXCLUDED.body_text_color,
        button_text_color = EXCLUDED.button_text_color,
        link_color = EXCLUDED.link_color,
        section_alt_bg = EXCLUDED.section_alt_bg,
        hero_overlay_color = EXCLUDED.hero_overlay_color,
        hero_text_color = EXCLUDED.hero_text_color,
        card_bg_color = EXCLUDED.card_bg_color,
        card_border_color = EXCLUDED.card_border_color,
        font_family = EXCLUDED.font_family,
        heading_font_family = EXCLUDED.heading_font_family,
        social_facebook = EXCLUDED.social_facebook,
        social_instagram = EXCLUDED.social_instagram,
        social_twitter = EXCLUDED.social_twitter,
        social_youtube = EXCLUDED.social_youtube,
        social_linkedin = EXCLUDED.social_linkedin,
        google_map_link = EXCLUDED.google_map_link,
        is_published = EXCLUDED.is_published,
        updated_at = now()
      RETURNING *`,
      [
        institutionId, slug, data.website_title, data.contact_email, data.contact_phone,
        data.contact_address, data.about_text, data.about_vision, data.about_mission, data.about_image_url || null,
        data.logo_url, data.favicon_url, data.hero_tagline, data.hero_sub_text,
        data.primary_color || '#4F46E5', data.secondary_color || '#7C3AED',
        data.topbar_bg_color || '#0f172a', data.topbar_text_color || '#cbd5e1',
        data.navbar_bg_color || '#ffffff', data.navbar_text_color || '#475569',
        data.footer_bg_color || '#020617', data.footer_text_color || '#94a3b8',
        data.heading_color || '#0f172a', data.body_text_color || '#475569', data.button_text_color || '#ffffff', data.link_color || '#4F46E5',
        data.section_alt_bg || '#f8fafc', data.hero_overlay_color || '#020617', data.hero_text_color || '#ffffff',
        data.card_bg_color || '#ffffff', data.card_border_color || '#e2e8f0',
        data.font_family || 'Plus Jakarta Sans', data.heading_font_family || 'Plus Jakarta Sans',
        data.social_facebook, data.social_instagram, data.social_twitter,
        data.social_youtube, data.social_linkedin,
        data.google_map_link, data.is_published ?? false
      ]
    )
    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// SLIDERS
// ─────────────────────────────────────────────
export async function fetchSliders() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(
      `SELECT * FROM institute_website_sliders WHERE institution_id = $1 ORDER BY sort_order ASC, id ASC`,
      [institutionId]
    )
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveSlider(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(
        `UPDATE institute_website_sliders SET title=$1,sub_title=$2,image_url=$3,cta_text=$4,cta_link=$5,sort_order=$6,is_active=$7 WHERE id=$8 AND institution_id=$9 RETURNING *`,
        [data.title, data.sub_title, data.image_url, data.cta_text, data.cta_link, data.sort_order ?? 0, data.is_active ?? true, data.id, institutionId]
      )
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(
        `INSERT INTO institute_website_sliders (institution_id,title,sub_title,image_url,cta_text,cta_link,sort_order,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [institutionId, data.title, data.sub_title, data.image_url, data.cta_text, data.cta_link, data.sort_order ?? 0, data.is_active ?? true]
      )
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteSlider(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_sliders WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────
export async function fetchStats() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_stats WHERE institution_id=$1 ORDER BY sort_order ASC, id ASC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveStat(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_stats SET label=$1,value=$2,icon=$3,sort_order=$4 WHERE id=$5 AND institution_id=$6 RETURNING *`, [data.label, data.value, data.icon || 'users', data.sort_order ?? 0, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_stats (institution_id,label,value,icon,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [institutionId, data.label, data.value, data.icon || 'users', data.sort_order ?? 0])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteStat(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_stats WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────
export async function fetchCourses() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_courses WHERE institution_id=$1 ORDER BY sort_order ASC, id ASC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveCourse(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_courses SET title=$1,description=$2,duration=$3,fees=$4,image_url=$5,category=$6,is_active=$7,sort_order=$8 WHERE id=$9 AND institution_id=$10 RETURNING *`, [data.title, data.description, data.duration, data.fees, data.image_url, data.category, data.is_active ?? true, data.sort_order ?? 0, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_courses (institution_id,title,description,duration,fees,image_url,category,is_active,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [institutionId, data.title, data.description, data.duration, data.fees, data.image_url, data.category, data.is_active ?? true, data.sort_order ?? 0])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteCourse(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_courses WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────
export async function fetchFaqs() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_faqs WHERE institution_id=$1 ORDER BY sort_order ASC, id ASC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveFaq(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_faqs SET question=$1,answer=$2,sort_order=$3 WHERE id=$4 AND institution_id=$5 RETURNING *`, [data.question, data.answer, data.sort_order ?? 0, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_faqs (institution_id,question,answer,sort_order) VALUES ($1,$2,$3,$4) RETURNING *`, [institutionId, data.question, data.answer, data.sort_order ?? 0])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteFaq(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_faqs WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────
export async function fetchTestimonials() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_testimonials WHERE institution_id=$1 ORDER BY sort_order ASC, id ASC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveTestimonial(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_testimonials SET student_name=$1,designation=$2,message=$3,photo_url=$4,rating=$5,is_active=$6,sort_order=$7 WHERE id=$8 AND institution_id=$9 RETURNING *`, [data.student_name, data.designation, data.message, data.photo_url, data.rating ?? 5, data.is_active ?? true, data.sort_order ?? 0, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_testimonials (institution_id,student_name,designation,message,photo_url,rating,is_active,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [institutionId, data.student_name, data.designation, data.message, data.photo_url, data.rating ?? 5, data.is_active ?? true, data.sort_order ?? 0])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteTestimonial(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_testimonials WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// BLOGS
// ─────────────────────────────────────────────
export async function fetchBlogs() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_blogs WHERE institution_id=$1 ORDER BY created_at DESC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveBlog(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  const slug = data.slug || (await generateSlug(data.title || ''))
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_blogs SET title=$1,slug=$2,content=$3,excerpt=$4,cover_image_url=$5,author=$6,is_published=$7,published_at=$8,updated_at=now() WHERE id=$9 AND institution_id=$10 RETURNING *`, [data.title, slug, data.content, data.excerpt, data.cover_image_url, data.author, data.is_published ?? false, data.is_published ? new Date() : null, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_blogs (institution_id,title,slug,content,excerpt,cover_image_url,author,is_published,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [institutionId, data.title, slug, data.content, data.excerpt, data.cover_image_url, data.author, data.is_published ?? false, data.is_published ? new Date() : null])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteBlog(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_blogs WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────
export async function fetchGallery() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(`SELECT * FROM institute_website_gallery WHERE institution_id=$1 ORDER BY sort_order ASC, id ASC`, [institutionId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveGalleryItem(data: Record<string, any>) {
  const institutionId = await getInstitutionId()
  try {
    if (data.id) {
      const res = await pool.query(`UPDATE institute_website_gallery SET image_url=$1,caption=$2,category=$3,sort_order=$4 WHERE id=$5 AND institution_id=$6 RETURNING *`, [data.image_url, data.caption, data.category || 'General', data.sort_order ?? 0, data.id, institutionId])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`INSERT INTO institute_website_gallery (institution_id,image_url,caption,category,sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [institutionId, data.image_url, data.caption, data.category || 'General', data.sort_order ?? 0])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteGalleryItem(id: number) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(`DELETE FROM institute_website_gallery WHERE id=$1 AND institution_id=$2`, [id, institutionId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// ENQUIRIES (Public submission + Admin management)
// ─────────────────────────────────────────────
export async function submitAdmissionEnquiry(data: {
  institution_id: string
  name: string
  email?: string
  phone: string
  course_name?: string
  message?: string
}) {
  try {
    const res = await pool.query(
      `INSERT INTO institute_website_enquiries (institution_id, name, email, phone, course_name, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.institution_id, data.name, data.email || null, data.phone, data.course_name || null, data.message || null]
    )
    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchEnquiries() {
  const institutionId = await getInstitutionId()
  try {
    const res = await pool.query(
      `SELECT * FROM institute_website_enquiries WHERE institution_id = $1 ORDER BY created_at DESC`,
      [institutionId]
    )
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function updateEnquiryStatus(id: number, status: string) {
  const institutionId = await getInstitutionId()
  try {
    await pool.query(
      `UPDATE institute_website_enquiries SET status = $1 WHERE id = $2 AND institution_id = $3`,
      [status, id, institutionId]
    )
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────
// PUBLIC FETCH — by slug (no auth)
// ─────────────────────────────────────────────
export async function fetchPublicWebsiteBySlug(slug: string) {
  try {
    const settingsRes = await pool.query(
      `SELECT * FROM institute_website_settings WHERE slug=$1`,
      [slug]
    )
    if (!settingsRes.rows[0]) return { success: false, error: 'Not found' }
    const iid = settingsRes.rows[0].institution_id

    const [sliders, stats, courses, faqs, testimonials, blogs, gallery] = await Promise.all([
      pool.query(`SELECT * FROM institute_website_sliders WHERE institution_id=$1 AND is_active=true ORDER BY sort_order ASC`, [iid]),
      pool.query(`SELECT * FROM institute_website_stats WHERE institution_id=$1 ORDER BY sort_order ASC`, [iid]),
      pool.query(`SELECT * FROM institute_website_courses WHERE institution_id=$1 AND is_active=true ORDER BY sort_order ASC`, [iid]),
      pool.query(`SELECT * FROM institute_website_faqs WHERE institution_id=$1 ORDER BY sort_order ASC`, [iid]),
      pool.query(`SELECT * FROM institute_website_testimonials WHERE institution_id=$1 AND is_active=true ORDER BY sort_order ASC`, [iid]),
      pool.query(`SELECT * FROM institute_website_blogs WHERE institution_id=$1 AND is_published=true ORDER BY published_at DESC LIMIT 6`, [iid]),
      pool.query(`SELECT * FROM institute_website_gallery WHERE institution_id=$1 ORDER BY sort_order ASC`, [iid]),
    ])

    return {
      success: true,
      data: {
        settings: settingsRes.rows[0],
        sliders: sliders.rows,
        stats: stats.rows,
        courses: courses.rows,
        faqs: faqs.rows,
        testimonials: testimonials.rows,
        blogs: blogs.rows,
        gallery: gallery.rows,
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

