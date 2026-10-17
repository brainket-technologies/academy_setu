import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import WebsiteLayout from '../components/WebsiteLayout'
import PageBanner from '../components/PageBanner'
import ContactForm from './ContactForm'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) return { title: 'Contact Us' }
  const title = res.data.settings.website_title || 'Institute'
  return {
    title: `Contact Us | ${title}`,
    description: `Get in touch with the admissions and administrative office of ${title}.`
  }
}

export default async function ContactPage({
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
      activePage="contact"
    >
      <PageBanner
        slug={instituteSlug}
        title="Contact Us"
        subtitle={`Reach out to ${websiteTitle} for admissions, campus tours, or general enquiries.`}
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa] min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Get In Touch With Us
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[140px] rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
              We are here to answer any questions you may have about academics, fee structure, and life on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Address, Contact Info, Map */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Dual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address Card */}
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                  <MapPin className="w-8 h-8 text-[#0d6efd] mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">School Address</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-0">
                    {settings.contact_address || 'Civil Lines, Near City Center, Lucknow'}
                  </p>
                </div>

                {/* Contact Card */}
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                  <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Contact Info</h4>
                  {settings.contact_phone && (
                    <div className="text-xs text-slate-600 mb-1">
                      📞 <a href={`tel:${settings.contact_phone}`} className="hover:underline font-medium">{settings.contact_phone}</a>
                    </div>
                  )}
                  {settings.contact_email && (
                    <div className="text-xs text-slate-600 truncate">
                      ✉️ <a href={`mailto:${settings.contact_email}`} className="hover:underline">{settings.contact_email}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Office Hours Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d6efd] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Campus Visiting Hours</h5>
                  <p className="text-xs text-slate-500 mb-0">Monday – Saturday: 08:30 AM to 03:30 PM (Sunday Closed)</p>
                </div>
              </div>

              {/* Google Maps Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-72">
                <iframe
                  title="Campus Map"
                  src={
                    settings.google_map_link && settings.google_map_link.includes('embed')
                      ? settings.google_map_link
                      : 'https://maps.google.com/maps?q=Lucknow,Uttar%20Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed'
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Send Us a Message Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-[#0d6efd] mb-1">
                  Send Us a Message
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Fill out the form below and an admissions counselor will reach out to you directly.
                </p>

                <ContactForm institutionId={settings.institution_id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  )
}
