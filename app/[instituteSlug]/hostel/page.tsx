import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import { ShieldCheck, Utensils, Wifi, BookOpen, Clock, HeartHandshake, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Hostel Facilities' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Hostel Facility & Accommodations | ${title}`,
    description: `Safe, disciplined, and home-like residential facilities for students at ${title}.`
  }
}

export default async function HostelPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses } = res.data

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="hostel"
    >
      <PageBanner
        slug={instituteSlug}
        title="Hostel & Residential Service"
        subtitle="Safe, secure, and disciplined residential facility with a focus on holistic student wellbeing."
        breadcrumbs={[{ label: 'Services', href: `/${instituteSlug}/courses` }, { label: 'Hostel' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white min-h-[500px]">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Centered Heading */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Our Hostel Amenities
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[150px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Our residential campus offers comfortable accommodation, nutritious dining, round-the-clock security, and a quiet study environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0d6efd] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">24x7 Security & CCTV</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-time wardens, biometric attendance, and 24x7 CCTV surveillance across all corridors and common zones.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Hygienic Pure Meals</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balanced diet with four fresh, nutritious meals a day prepared under strict cleanliness standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Supervised Evening Study</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated daily evening self-study hours with mentor guidance to guarantee academic momentum.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Clean RO Water & Wi-Fi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous filtered drinking water, 24x7 power backup, and high-speed Wi-Fi in study halls.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Medical & First Aid</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate on-campus first aid and tie-ups with leading hospitals for routine and emergency checkups.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Laundry & Housekeeping</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regular laundry facilities and daily cleaning routines to ensure impeccable hygiene.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#132742] to-[#0d6efd] text-white text-center space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Interested in Hostel Allotment?</h3>
            <p className="text-slate-200 text-sm max-w-xl mx-auto">
              Limited hostel seats are available for each batch. We recommend applying early to secure room booking.
            </p>
            <div className="pt-2">
              <Link
                href={`/${instituteSlug}/apply`}
                className="bg-[#ffc107] hover:bg-amber-400 text-slate-900 font-bold px-7 py-3 rounded-xl text-xs sm:text-sm inline-block shadow-lg transition-transform hover:scale-105"
              >
                Apply for Hostel Admission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
