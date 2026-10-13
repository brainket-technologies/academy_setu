// Run: node migrate-website.js
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Main settings per institute
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_settings (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL UNIQUE,
        slug            TEXT UNIQUE,
        website_title   TEXT,
        contact_email   TEXT,
        contact_phone   TEXT,
        contact_address TEXT,
        about_text      TEXT,
        about_vision    TEXT,
        about_mission   TEXT,
        logo_url        TEXT,
        favicon_url     TEXT,
        hero_tagline    TEXT,
        hero_sub_text   TEXT,
        primary_color   TEXT DEFAULT '#4F46E5',
        secondary_color TEXT DEFAULT '#7C3AED',
        social_facebook TEXT,
        social_instagram TEXT,
        social_twitter  TEXT,
        social_youtube  TEXT,
        social_linkedin TEXT,
        google_map_link TEXT,
        is_published    BOOLEAN DEFAULT false,
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_settings')

    // 2. Sliders / Hero Banners
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_sliders (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        title           TEXT,
        sub_title       TEXT,
        image_url       TEXT,
        cta_text        TEXT,
        cta_link        TEXT,
        sort_order      INT DEFAULT 0,
        is_active       BOOLEAN DEFAULT true,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_sliders')

    // 3. Statistics / Achievements
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_stats (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        label           TEXT NOT NULL,
        value           TEXT NOT NULL,
        icon            TEXT DEFAULT 'users',
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_stats')

    // 4. Courses
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_courses (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        title           TEXT NOT NULL,
        description     TEXT,
        duration        TEXT,
        fees            TEXT,
        image_url       TEXT,
        category        TEXT,
        is_active       BOOLEAN DEFAULT true,
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_courses')

    // 5. FAQs
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_faqs (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        question        TEXT NOT NULL,
        answer          TEXT NOT NULL,
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_faqs')

    // 6. Testimonials
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_testimonials (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        student_name    TEXT NOT NULL,
        designation     TEXT,
        message         TEXT NOT NULL,
        photo_url       TEXT,
        rating          INT DEFAULT 5,
        is_active       BOOLEAN DEFAULT true,
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_testimonials')

    // 7. Blogs / News
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_blogs (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        title           TEXT NOT NULL,
        slug            TEXT,
        content         TEXT,
        excerpt         TEXT,
        cover_image_url TEXT,
        author          TEXT,
        tags            TEXT[],
        is_published    BOOLEAN DEFAULT false,
        published_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_blogs')

    // 8. Gallery
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_gallery (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        image_url       TEXT NOT NULL,
        caption         TEXT,
        category        TEXT DEFAULT 'General',
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_gallery')

    // 9. Admission Enquiries
    await client.query(`
      CREATE TABLE IF NOT EXISTS institute_website_enquiries (
        id              SERIAL PRIMARY KEY,
        institution_id  TEXT NOT NULL,
        name            TEXT NOT NULL,
        email           TEXT,
        phone           TEXT NOT NULL,
        course_name     TEXT,
        message         TEXT,
        status          TEXT DEFAULT 'pending',
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `)
    console.log('✅ institute_website_enquiries')

    await client.query('COMMIT')
    console.log('\n🎉 All website tables created successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
