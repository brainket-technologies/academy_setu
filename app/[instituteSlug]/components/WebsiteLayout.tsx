'use client'

import React, { useState } from 'react'
import WebsiteNavbar from './WebsiteNavbar'
import WebsiteFooter from './WebsiteFooter'
import EnquiryModal from './EnquiryModal'

interface WebsiteLayoutProps {
  slug: string
  settings: any
  courses?: Array<{ id: number; title: string }>
  activePage?: string
  children: React.ReactNode
}

export default function WebsiteLayout({
  slug,
  settings,
  courses = [],
  activePage = 'home',
  children
}: WebsiteLayoutProps) {
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const handleOpenEnquiry = (courseTitle?: string) => {
    setSelectedCourse(courseTitle || '')
    setEnquiryModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 antialiased font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <WebsiteNavbar
          slug={slug}
          settings={settings}
          onOpenEnquiry={handleOpenEnquiry}
          activePage={activePage}
        />
        <main>{children}</main>
      </div>

      <WebsiteFooter
        slug={slug}
        settings={settings}
        onOpenEnquiry={() => handleOpenEnquiry()}
      />

      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        institutionId={settings.institution_id}
        initialCourse={selectedCourse}
        courses={courses}
      />
    </div>
  )
}
