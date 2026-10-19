import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import { CheckCircle2, GraduationCap, Users, Award, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'About Us' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `About Our School | ${title}`,
    description: res.data.settings.about_text?.substring(0, 160) || `Learn more about ${title}`
  }
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, stats, courses } = res.data
  const websiteTitle = settings.website_title || 'Cosmopolitan Inter College'

  const visibility = (settings as any)?.page_sections_visibility || {}
  const pageContent = (settings as any)?.page_content || {}

  const showAboutMain = visibility.about_main !== false
  const showAboutVision = visibility.about_vision !== false
  const showAboutMission = visibility.about_mission !== false
  const showAboutPrincipal = visibility.about_principal !== false
  const showAboutStats = visibility.about_stats !== false

  const principalName = pageContent.principal_name || 'Academic Director & Principal'
  const principalTitle = pageContent.principal_title || 'Principal Message'
  const principalQuote = pageContent.principal_quote || '"Education Beyond the Classroom"'
  const principalMessage = pageContent.principal_message ||
    `Welcome to ${websiteTitle}, where every child is valued, encouraged, and inspired to achieve their fullest potential. Our mission is to provide a nurturing environment that promotes academic excellence, strong moral values, creativity, and lifelong learning. We believe that education is not only about gaining knowledge but also about developing character, confidence, and compassion.`
  const principalPhoto = pageContent.principal_photo_url ||
    'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop'
  const badgeText = pageContent.about_badge_text || '10+ Years of Excellence'

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="about"
    >
      <PageBanner
        slug={instituteSlug}
        title="About Our School"
        subtitle={`Discover the heritage, values, and academic excellence that define ${websiteTitle}.`}
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Main About Section */}
      {showAboutMain && (
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              About Our School
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Image Column */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                <img
                  src={
                    settings.about_image_url ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop'
                  }
                  alt="About Campus"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
                
                {/* Years of Excellence Badge */}
                <div className="absolute bottom-5 right-5 bg-white text-center rounded-2xl shadow-xl p-4 border border-slate-100 min-w-[130px]">
                  <h5 className="text-2xl sm:text-3xl font-black text-[#0d6efd]">10+</h5>
                  <small className="text-xs font-bold text-slate-700 block leading-tight">
                    {badgeText.includes('\n') ? badgeText : badgeText.replace(' Years of ', ' Years of\n')}
                  </small>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-5 lg:ps-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {settings.hero_tagline || 'Shaping Bright Futures'}
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {settings.about_text ||
                  `At ${websiteTitle}, we are committed to providing a safe, inspiring, and student-centered learning environment where every child is encouraged to discover their unique talents and reach their highest potential. Our dedicated educators combine academic excellence with strong moral values, creativity, and life skills to prepare students for the challenges of tomorrow.`}
              </p>

              {showAboutVision && settings.about_vision && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-slate-700">
                  <strong className="text-[#0d6efd] block mb-1">Our Vision:</strong>
                  {settings.about_vision}
                </div>
              )}

              {showAboutMission && settings.about_mission && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-700">
                  <strong className="text-amber-800 block mb-1">Our Mission:</strong>
                  {settings.about_mission}
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={`/${instituteSlug}/contact`}
                  className="inline-block border-2 border-[#0d6efd] text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white font-bold text-sm px-7 py-2.5 rounded-lg transition-all shadow-xs"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Principal's Message Section (Exact lcabithan style) */}
      {showAboutPrincipal && (
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              {principalTitle}
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[150px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 text-center">
              <img
                src={principalPhoto}
                alt="Principal"
                className="w-72 sm:w-80 h-96 object-cover rounded-2xl shadow-md mx-auto border-4 border-white"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 italic">
                {principalQuote}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {principalMessage}
              </p>
              <div className="pt-2">
                <h5 className="font-bold text-base text-slate-900">{principalName}</h5>
                <p className="text-[#0d6efd] text-xs font-bold">{websiteTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Stats Counter Band */}
      {showAboutStats && (
      <section className="py-14 text-white bg-[#0d6efd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats && stats.length > 0 ? (
              stats.slice(0, 4).map((st) => (
                <div
                  key={st.id}
                  className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs"
                >
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">{st.value}</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider mb-0">{st.label}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">1000+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Students</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Users className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">25+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Teachers</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Award className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">100%</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Result</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">20+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Class Rooms</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      )}
    </WebsiteLayout>
  )
}
