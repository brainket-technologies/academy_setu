import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import { Bus, MapPin, ShieldCheck, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Transport Service' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Safe Bus & Van Route Transport | ${title}`,
    description: `Safe and GPS-tracked school bus and van transportation network at ${title}.`
  }
}

export default async function TransportPage({
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
      activePage="transport"
    >
      <PageBanner
        slug={instituteSlug}
        title="Van & Bus Route Service"
        subtitle="Convenient, secure, and monitored door-to-school transport across city corridors."
        breadcrumbs={[{ label: 'Services', href: `/${instituteSlug}/courses` }, { label: 'Van Route' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white min-h-[500px]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Safe & Tracked Transportation
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Our fleet of school buses and vans cover major pickup and drop locations with verified drivers and female attendants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0d6efd] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">GPS & Speed Governors</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every bus and van is fitted with active satellite GPS tracking and speed governors for safe commuting.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Punctual Schedules</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fixed pickup and drop timings communicated to parents with minimal waiting times at stops.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bus className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Trained Crew & First Aid</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Licensed drivers with clean records, support assistants, and onboard first-aid kits and fire extinguishers.
              </p>
            </div>
          </div>

          {/* Transport Help Box */}
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Need your neighborhood route mapped?</h4>
              <p className="text-xs text-slate-500 mb-0">Contact our transport coordinator to check availability for your area.</p>
            </div>
            <Link
              href={`/${instituteSlug}/contact`}
              className="bg-[#0d6efd] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shrink-0 shadow-sm"
            >
              Contact Transport Coordinator
            </Link>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
