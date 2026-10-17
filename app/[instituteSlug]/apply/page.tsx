import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import ClientApplyForm from './ClientApplyForm'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Online Admission Form' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Online Admission Application | ${title}`,
    description: `Fill out the online admission form for academic session 2025-2026 at ${title}.`
  }
}

export default async function ApplyPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses } = res.data
  const websiteTitle = settings.website_title || 'Cosmopolitan Inter College'

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="apply"
    >
      <PageBanner
        slug={instituteSlug}
        title="Online Admission Application"
        subtitle={`Session 2025–2026 Admissions are now active. Submit your application online for ${websiteTitle}.`}
        breadcrumbs={[{ label: 'Online Application' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa] min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Admission Application Form
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Seats are allotted based on merit, availability, and an initial counselor interaction.
            </p>
          </div>

          <ClientApplyForm
            institutionId={settings.institution_id}
            courses={courses}
          />
        </div>
      </section>
    </WebsiteLayout>
  )
}
