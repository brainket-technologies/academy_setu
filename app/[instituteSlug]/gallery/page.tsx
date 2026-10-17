import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import ClientGallery from './ClientGallery'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'School Gallery' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Campus & Photo Gallery | ${title}`,
    description: `Browse photographs and memories of campus celebrations, sports, and facilities at ${title}.`
  }
}

export default async function GalleryPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses, gallery } = res.data

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="gallery"
    >
      <PageBanner
        slug={instituteSlug}
        title="Our School Gallery"
        subtitle="Memories, cultural celebrations, academic life, and moments on campus."
        breadcrumbs={[{ label: 'Gallery' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Our School Gallery
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[150px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Glimpses into student life, laboratories, sports meets, and classroom achievements.
            </p>
          </div>

          <ClientGallery items={gallery || []} />
        </div>
      </section>
    </WebsiteLayout>
  )
}
