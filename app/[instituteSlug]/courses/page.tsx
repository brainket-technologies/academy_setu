import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import { GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Courses & Programs' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Academic Programs & Courses | ${title}`,
    description: `Explore academic curriculums, classes, and programs offered at ${title}.`
  }
}

export default async function CoursesPage({
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
      activePage="courses"
    >
      <PageBanner
        slug={instituteSlug}
        title="Our Academic Programs"
        subtitle="Explore our comprehensive curriculum and student-centric coaching programs."
        breadcrumbs={[{ label: 'Courses & Classes' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Our Academic Programs
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[140px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Carefully designed courses delivered by expert faculty with state-of-the-art methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses && courses.length > 0 ? (
              courses.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 text-center flex flex-col justify-between"
                >
                  <div>
                    {/* Pastel icon container */}
                    <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 text-emerald-600 rounded-full flex items-center justify-center border border-rose-100 shadow-xs">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">{crs.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {crs.description || 'Structured academic preparation with personalized guidance and problem solving.'}
                    </p>
                  </div>

                  <div>
                    <hr className="my-3 border-slate-100" />
                    <div className="flex items-center justify-between text-xs mb-3 text-slate-600">
                      {crs.duration && <span className="font-medium">⏱ {crs.duration}</span>}
                      {crs.fees && <span className="font-bold text-slate-900">{crs.fees}</span>}
                    </div>
                    <Link
                      href={`/${instituteSlug}/courses/${crs.id}`}
                      className="block w-full border border-[#0d6efd] text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white rounded-full py-1.5 text-xs font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400">
                <p>No courses currently listed. Please contact the admission desk for details.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
