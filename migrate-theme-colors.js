const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function migrate() {
  const cols = [
    ['topbar_bg_color', "'#0f172a'"],
    ['topbar_text_color', "'#cbd5e1'"],
    ['navbar_bg_color', "'#ffffff'"],
    ['navbar_text_color', "'#475569'"],
    ['footer_bg_color', "'#020617'"],
    ['footer_text_color', "'#94a3b8'"],
    ['heading_color', "'#0f172a'"],
    ['body_text_color', "'#475569'"],
    ['button_text_color', "'#ffffff'"],
    ['link_color', "'#4F46E5'"],
    ['section_alt_bg', "'#f8fafc'"],
    ['hero_overlay_color', "'#020617'"],
    ['hero_text_color', "'#ffffff'"],
    ['card_bg_color', "'#ffffff'"],
    ['card_border_color', "'#e2e8f0'"],
    ['font_family', "'Plus Jakarta Sans'"],
    ['heading_font_family', "'Plus Jakarta Sans'"],
    ['about_image_url', 'NULL'],
  ]

  for (const [col, def] of cols) {
    try {
      await pool.query(`ALTER TABLE institute_website_settings ADD COLUMN ${col} TEXT DEFAULT ${def}`)
      console.log('✅ Added:', col)
    } catch(e) {
      if (e.code === '42701') console.log('⏭️  Exists:', col)
      else console.error('❌', col, e.message)
    }
  }

  console.log('\n🎉 Theme columns migration complete!')
  await pool.end()
}

migrate()
