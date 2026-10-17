import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../../components/WebsiteLayout'
import PageBanner from '../../components/PageBanner'
import { GraduationCap, Clock, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string; courseId: string }>
}): Promise<Metadata> {
  const { instituteSlug, courseId } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Course Details' }
  const course = res.data.courses.find((c: any) => String(c.id) === String(courseId))
  const courseTitle = course ? course.title : 'Program Details'
  const siteTitle = res.data.settings.website_title || 'Institute'
  return {
    title: `${courseTitle} | ${siteTitle}`,
    description: course?.description?.substring(0, 160) || `Learn about ${courseTitle}`
  }
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ instituteSlug: string; courseId: string }>
}) {
  const { instituteSlug, courseId } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses } = res.data
  const course = courses.find((c: any) => String(c.id) === String(courseId))
  if (!course) notFound()

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="courses"
    >
      <PageBanner
        slug={instituteSlug}
        title={course.title}
        subtitle={course.category || 'Academic Curriculum & Program Overview'}
        breadcrumbs={[
          { label: 'Courses', href: `/${instituteSlug}/courses` },
          { label: course.title }
        ]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Course Details */}
            <div className="lg:col-span-8 space-y-8">
              {course.image_url && (
                <div className="rounded-2xl overflow-hidden shadow-sm h-72 sm:h-96">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <span className="inline-block bg-blue-50 text-[#0d6efd] font-bold text-xs px-3 py-1 rounded-full border border-blue-200">
                  {course.category || 'Academic Program'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {course.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {course.description ||
                    'This course is thoughtfully designed to provide students with strong fundamental comprehension, analytical problem-solving abilities, and continuous evaluation.'}
                </p>
              </div>

              {/* Program Key Features */}
              <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 space-y-4">
                <h3 className="font-bold text-lg text-slate-900">What You Will Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>In-depth conceptual mastery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Regular chapter tests & feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Personalized doubt clearing sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Comprehensive study notes & worksheets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Summary Card & Apply Button */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-6">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 mx-auto mb-3 bg-rose-50 text-emerald-600 rounded-full flex items-center justify-center border border-rose-100">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">{course.title}</h4>
                  {course.fees && (
                    <div className="text-2xl font-black text-[#0d6efd] mt-2">
                      {course.fees}
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  {course.duration && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-500">Duration:</span>
                      <span className="font-bold text-slate-900">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Mode:</span>
                    <span className="font-bold text-slate-900">Classroom / Offline</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">Eligibility:</span>
                    <span className="font-bold text-slate-900">Open for 2025–26</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/${instituteSlug}/apply`}
                    className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center block text-xs shadow-md transition-all"
                  >
                    Enroll / Apply Now
                  </Link>
                  <Link
                    href={`/${instituteSlug}/courses`}
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-center block text-xs transition-colors"
                  >
                    View All Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
