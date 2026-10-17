import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Our Teachers' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Expert Faculty & Teachers | ${title}`,
    description: `Meet the experienced and dedicated teaching staff at ${title}.`
  }
}

export default async function TeachersPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) notFound()

  const { settings, courses, teachers = [] } = res.data

  const displayTeachers = teachers && teachers.length > 0 ? teachers : [
    {
      id: 'demo-1',
      name: 'Mr. Ganesh Kumar',
      assigned_classes: ['Math Specialist'],
      details: { exp: '12 Yrs Exp', bio: 'Expert in mathematical reasoning and logical problem solving.' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'demo-2',
      name: 'Mr. Kumar Verma',
      assigned_classes: ['Biology Specialist'],
      details: { exp: '10 Yrs Exp', bio: 'Interactive botanical and human anatomy coaching specialist.' },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'demo-3',
      name: 'Dr. Imtiyaj Hasan',
      assigned_classes: ['Physics & Chemistry'],
      details: { exp: '14 Yrs Exp', bio: 'Simplifying conceptual mechanics and organic synthesis.' },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'demo-4',
      name: 'Mrs. S. Sharma',
      assigned_classes: ['English & Humanities'],
      details: { exp: '9 Yrs Exp', bio: 'Focus on communication, creative writing, and personality grooming.' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
    }
  ]

  return (
    <WebsiteLayout
      slug={instituteSlug}
      settings={settings}
      courses={courses}
      activePage="teachers"
    >
      <PageBanner
        slug={instituteSlug}
        title="Meet Our Expert Teachers"
        subtitle="Our team of passionate, qualified educators committed to mentoring each child."
        breadcrumbs={[{ label: 'Teachers' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa] min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Meet Our Expert Teacher's
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[240px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              Our faculty members possess deep subject knowledge and pedagogical mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTeachers.map((t: any, idx: number) => {
              const exp = t.details?.exp || `${10 + idx} Yrs Exp`
              const spec = Array.isArray(t.assigned_classes) && t.assigned_classes.length > 0
                ? t.assigned_classes[0]
                : 'Faculty Specialist'

              return (
                <div
                  key={t.id || idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 text-center flex flex-col justify-between"
                >
                  <div>
                    {/* Circular photo with experience badge */}
                    <div className="relative inline-block mx-auto mb-4">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-28 h-28 rounded-full object-cover shadow border-2 border-white"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-slate-100 text-slate-500 font-black text-2xl flex items-center justify-center shadow border-2 border-white">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 bg-[#0d6efd] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs whitespace-nowrap">
                        {exp}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{t.name}</h4>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                      {spec}
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {t.details?.bio || 'Dedicated to student conceptual growth and academic achievement.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
