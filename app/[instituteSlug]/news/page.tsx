import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Notices & News' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Notice Board & Announcements | ${title}`,
    description: `Stay updated with examination schedules, circulars, and events from ${title}.`
  }
}

export default async function NewsPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses, blogs = [] } = res.data

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="news"
    >
      <PageBanner
        slug={instituteSlug}
        title="Latest Notices & News"
        subtitle="Official school announcements, academic schedules, events, and examination circulars."
        breadcrumbs={[{ label: 'Notice & News' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa] min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Latest Notices & News
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Please check this page regularly for verified institution circulars and event schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs && blogs.length > 0 ? (
              blogs.map((b: any, idx: number) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 pt-7 relative flex flex-col justify-between"
                >
                  {/* Floating badge */}
                  <span className="absolute -top-3 left-6 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-xs">
                    ● {idx % 2 === 0 ? 'Exam Notice' : 'Campus Event'}
                  </span>

                  <div>
                    <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.published_at ? new Date(b.published_at).toLocaleDateString() : 'Current'}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">
                      {b.title}
                    </h4>

                    {b.excerpt && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                        {b.excerpt}
                      </p>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/${instituteSlug}/news/${b.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400">
                <p>No active notices published at this moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
