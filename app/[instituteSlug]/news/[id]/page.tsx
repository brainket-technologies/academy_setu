import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../../components/WebsiteLayout'
import PageBanner from '../../components/PageBanner'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string; id: string }>
}): Promise<Metadata> {
  const { instituteSlug, id } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Notice' }
  const notice = res.data.blogs.find((b: any) => String(b.id) === String(id))
  const siteTitle = res.data.settings.website_title || 'Institute'
  return {
    title: `${notice ? notice.title : 'Notice Details'} | ${siteTitle}`,
    description: notice?.excerpt?.substring(0, 160) || 'Notice details'
  }
}

export default async function NoticeDetailPage({
  params
}: {
  params: Promise<{ instituteSlug: string; id: string }>
}) {
  const { instituteSlug, id } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses, blogs = [] } = res.data
  const notice = blogs.find((b: any) => String(b.id) === String(id))
  if (!notice) notFound()

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="news"
    >
      <PageBanner
        slug={instituteSlug}
        title={notice.title}
        subtitle="Official Notice & Announcement"
        breadcrumbs={[
          { label: 'Notice & News', href: `/${instituteSlug}/news` },
          { label: 'Notice Details' }
        ]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white min-h-[500px]">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            href={`/${instituteSlug}/news`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0d6efd] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Notices</span>
          </Link>

          {notice.cover_image_url && (
            <div className="rounded-2xl overflow-hidden shadow-sm max-h-[420px]">
              <img
                src={notice.cover_image_url}
                alt={notice.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              {notice.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0d6efd]" />
                  <span>{new Date(notice.published_at).toLocaleDateString()}</span>
                </span>
              )}
              {notice.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#0d6efd]" />
                  <span>By {notice.author}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {notice.title}
            </h2>

            {notice.excerpt && (
              <p className="text-base font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                {notice.excerpt}
              </p>
            )}

            <div className="text-slate-600 leading-relaxed text-sm sm:text-base space-y-4 pt-4 border-t border-slate-100">
              <p>{notice.content || notice.excerpt}</p>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
