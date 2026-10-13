const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Find institutions
    const instRes = await client.query('SELECT id, name, email_id, mobile_no, address FROM institutions')
    const institutions = instRes.rows
    console.log('Found institutions:', institutions)

    // Only seed for real institution IDs
    const targetIds = institutions.map(i => i.id)
    if (targetIds.length === 0) {
      targetIds.push('a8c44644-f4d7-4b52-97d7-09f1ed8a63a0')
    }

    for (const iid of targetIds) {
      console.log(`\nSeeding website data for institution: ${iid}`)

      // 1. General Settings
      await client.query(`
        INSERT INTO institute_website_settings (
          institution_id, slug, website_title, contact_email, contact_phone,
          contact_address, about_text, about_vision, about_mission,
          logo_url, favicon_url, hero_tagline, hero_sub_text,
          primary_color, secondary_color,
          social_facebook, social_instagram, social_twitter, social_youtube, social_linkedin,
          google_map_link, is_published, updated_at
        ) VALUES (
          $1, 'cosmopolitan-inter', 'Cosmopolitan Inter College', 'cosmopolitan@gmail.com', '+91 8858552322',
          'Civil Lines, Near City Center, Main Road, Lucknow, Uttar Pradesh 226001',
          'We are a premier educational institute committed to providing the highest quality coaching. Our experienced faculty and state-of-the-art facilities ensure that every student reaches their full potential through customized learning pathways and expert mentorship.',
          'To be recognized as a world-class center of academic excellence and holistic character formation.',
          'To empower students through rigorous academic coaching, practical skills, moral integrity, and personalized mentorship.',
          '', '', 'Empowering Future Leaders',
          'Join our expert-led programs and achieve your dream ranks.',
          '#1e40af', '#059669',
          'https://facebook.com', 'https://instagram.com', 'https://twitter.com', 'https://youtube.com', 'https://linkedin.com',
          'https://maps.google.com', true, now()
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
          hero_tagline = EXCLUDED.hero_tagline,
          hero_sub_text = EXCLUDED.hero_sub_text,
          primary_color = EXCLUDED.primary_color,
          secondary_color = EXCLUDED.secondary_color,
          is_published = true,
          updated_at = now();
      `, [iid])

      // 2. Sliders
      await client.query(`DELETE FROM institute_website_sliders WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_sliders (institution_id, title, sub_title, image_url, cta_text, cta_link, sort_order, is_active)
        VALUES 
        ($1, 'Empowering Future Leaders', 'Join our expert-led programs and achieve your dream ranks.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop', 'Explore Courses', '#courses', 1, true),
        ($1, 'State-of-the-Art Learning & Mentorship', 'Personalized guidance designed for board and competitive exam excellence.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop', 'Admission Enquiry', '#contact', 2, true)
      `, [iid])

      // 3. Stats
      await client.query(`DELETE FROM institute_website_stats WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_stats (institution_id, label, value, icon, sort_order)
        VALUES
        ($1, 'Happy Students', '1200+', 'users', 1),
        ($1, 'Expert Teachers', '45+', 'award', 2),
        ($1, 'Success Rate', '98.6%', 'trending-up', 3),
        ($1, 'Premium Courses', '15+', 'book-open', 4),
        ($1, 'Visitors', '46', 'eye', 5)
      `, [iid])

      // 4. Featured Courses
      await client.query(`DELETE FROM institute_website_courses WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_courses (institution_id, title, description, duration, fees, image_url, category, sort_order, is_active)
        VALUES
        ($1, 'NEET Physics Crash Course', 'Targeted theory explanations, formulas, and shortcut problem-solving methods for NEET Physics.', '3 Months', '₹9000.00', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', 'Medical Entrance', 1, true),
        ($1, 'Foundation Course (Class 9th & 10th)', 'Strengthen core Science & Math concepts to build an early lead for competitive exams.', '2 Years', '₹30000.00', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop', 'Foundation', 2, true),
        ($1, 'Advanced Inorganic Chemistry', 'A systematic approach to chemical bonding, coordination compounds, and metallurgy.', '6 Months', '₹6500.00', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop', 'Chemistry', 3, true),
        ($1, 'IIT-JEE Mathematics Masterclass', 'Comprehensive calculus, algebra, and coordinate geometry mastery with weekly mocks.', '1 Year', '₹24000.00', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop', 'Engineering Entrance', 4, true)
      `, [iid])

      // 5. Testimonials
      await client.query(`DELETE FROM institute_website_testimonials WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_testimonials (institution_id, student_name, designation, message, photo_url, rating, sort_order, is_active)
        VALUES
        ($1, 'Rahul Sharma', 'NEET Qualified (Score 675)', 'The concept clarity and rigorous mock test series helped me secure my dream medical seat. The faculty is immensely supportive.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop', 5, 1, true),
        ($1, 'Ananya Verma', 'Class 10th Topper (98.2%)', 'Joining the Foundation Course was the best decision. Conceptual doubts were solved on the same day with personal attention.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop', 5, 2, true),
        ($1, 'Suresh Patel', 'Parent of Class 12 Student', 'The discipline, structured curriculum, and regular progress reports given by the institute are truly commendable.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', 5, 3, true)
      `, [iid])

      // 6. FAQs
      await client.query(`DELETE FROM institute_website_faqs WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_faqs (institution_id, question, answer, sort_order)
        VALUES
        ($1, 'What is the admission procedure for courses?', 'Admissions can be initiated by submitting the online enquiry form or visiting our campus. Our academic counselors will schedule a brief diagnostic assessment and walk you through course selection.', 1),
        ($1, 'Are scholarship programs available for meritorious students?', 'Yes, we conduct scholarship entrance tests and offer fee concessions up to 75% for high-scoring students.', 2),
        ($1, 'Do you provide study material and mock test series?', 'Comprehensive printed modules, digital question banks, and weekly national-standard test series are fully included in all courses.', 3),
        ($1, 'Are batch timings flexible for school-going students?', 'Yes, we conduct specialized morning and evening batches to seamlessly align with school and college schedules.', 4)
      `, [iid])

      // 7. Gallery
      await client.query(`DELETE FROM institute_website_gallery WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_gallery (institution_id, image_url, caption, category, sort_order)
        VALUES
        ($1, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop', 'Smart Interactive Classroom', 'Campus', 1),
        ($1, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', 'Advanced Chemistry Laboratory', 'Labs', 2),
        ($1, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', 'Collaborative Study Hall & Library', 'Library', 3),
        ($1, 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop', 'Annual Student Felicitation Ceremony', 'Events', 4)
      `, [iid])

      // 8. Blogs
      await client.query(`DELETE FROM institute_website_blogs WHERE institution_id = $1`, [iid])
      await client.query(`
        INSERT INTO institute_website_blogs (institution_id, title, slug, content, excerpt, cover_image_url, author, is_published, published_at)
        VALUES
        ($1, 'How to Crack Competitive Exams with Smart Revision', 'smart-revision-tips', 'Revision is the key to mastering high-yield concepts...', 'Discover proven strategies from toppers on how to maximize your score in minimum time.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop', 'Academic Director', true, now()),
        ($1, 'Admissions Open for Academic Session 2025-2026', 'admissions-open-2025', 'We are pleased to announce admissions for new batches...', 'Registrations are now live for Foundation, Pre-Medical, and Pre-Engineering batches.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop', 'Admission Desk', true, now())
      `, [iid])
    }

    await client.query('COMMIT')
    console.log('\n🎉 Successfully seeded complete website data for the institute!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Seeding failed:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
