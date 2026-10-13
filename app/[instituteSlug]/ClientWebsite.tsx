'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Phone, Mail, MapPin, Globe, ChevronRight, ChevronLeft,
  Calendar, Clock, CheckCircle2, Star, ArrowRight,
  BookOpen, Users, Award, Shield, Sparkles, Send,
  Menu, X, ExternalLink, HelpCircle, AlertCircle, Eye
} from 'lucide-react'
import { submitAdmissionEnquiry } from '@/app/institute/website/actions'
import { toast } from 'sonner'

// Social SVG Icons
const FacebookIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const TwitterIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
)

interface WebsiteData {
  settings: {
    institution_id: string
    slug: string
    website_title?: string
    contact_email?: string
    contact_phone?: string
    contact_address?: string
    about_text?: string
    about_vision?: string
    about_mission?: string
    about_image_url?: string
    logo_url?: string
    favicon_url?: string
    hero_tagline?: string
    hero_sub_text?: string
    primary_color?: string
    secondary_color?: string
    topbar_bg_color?: string
    topbar_text_color?: string
    navbar_bg_color?: string
    navbar_text_color?: string
    footer_bg_color?: string
    footer_text_color?: string
    heading_color?: string
    body_text_color?: string
    button_text_color?: string
    link_color?: string
    section_alt_bg?: string
    hero_overlay_color?: string
    hero_text_color?: string
    card_bg_color?: string
    card_border_color?: string
    font_family?: string
    heading_font_family?: string
    social_facebook?: string
    social_instagram?: string
    social_twitter?: string
    social_youtube?: string
    social_linkedin?: string
    google_map_link?: string
    is_published?: boolean
  }
  sliders: Array<{
    id: number
    title?: string
    sub_title?: string
    image_url?: string
    cta_text?: string
    cta_link?: string
  }>
  stats: Array<{
    id: number
    label: string
    value: string
    icon?: string
  }>
  courses: Array<{
    id: number
    title: string
    description?: string
    duration?: string
    fees?: string
    image_url?: string
    category?: string
  }>
  faqs: Array<{
    id: number
    question: string
    answer: string
  }>
  testimonials: Array<{
    id: number
    student_name: string
    designation?: string
    message: string
    photo_url?: string
    rating: number
  }>
  blogs: Array<{
    id: number
    title: string
    slug?: string
    excerpt?: string
    content?: string
    cover_image_url?: string
    author?: string
    published_at?: string
    tags?: string[]
  }>
  gallery: Array<{
    id: number
    image_url: string
    caption?: string
    category?: string
  }>
}

export default function ClientWebsite({ data, slug }: { data: WebsiteData; slug: string }) {
  const { settings, sliders, stats, courses, faqs, testimonials, blogs, gallery } = data

  const primaryColor = settings.primary_color || '#1e40af'
  const secondaryColor = settings.secondary_color || '#059669'
  const topbarBg = settings.topbar_bg_color || '#0f172a'
  const topbarText = settings.topbar_text_color || '#cbd5e1'
  const navbarBg = settings.navbar_bg_color || '#ffffff'
  const navbarText = settings.navbar_text_color || '#334155'
  const footerBg = settings.footer_bg_color || '#020617'
  const footerText = settings.footer_text_color || '#94a3b8'
  const headingColor = settings.heading_color || '#0f172a'
  const bodyTextColor = settings.body_text_color || '#475569'
  const buttonTextColor = settings.button_text_color || '#ffffff'
  const linkColor = settings.link_color || primaryColor
  const sectionAltBg = settings.section_alt_bg || '#f8fafc'
  const cardBg = settings.card_bg_color || '#ffffff'
  const cardBorder = settings.card_border_color || '#e2e8f0'
  const fontFamily = settings.font_family || 'Plus Jakarta Sans'
  const headingFont = settings.heading_font_family || 'Plus Jakarta Sans'
  const websiteTitle = settings.website_title || 'Academy Institute'

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0)
  const hasSliders = sliders && sliders.length > 0

  useEffect(() => {
    if (!hasSliders || sliders.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [hasSliders, sliders?.length])

  // Course Category Filter
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>('All')
  const courseCategories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean) as string[]))]
  const filteredCourses = selectedCourseCategory === 'All'
    ? courses
    : courses.filter(c => c.category === selectedCourseCategory)

  // Gallery Filter & Lightbox
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('All')
  const galleryCategories = ['All', ...Array.from(new Set(gallery.map(g => g.category).filter(Boolean) as string[]))]
  const filteredGallery = selectedGalleryCategory === 'All'
    ? gallery
    : gallery.filter(g => g.category === selectedGalleryCategory)
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null)

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(faqs[0]?.id || null)

  // Enquiry Modal & Form
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [enquiryCourse, setEnquiryCourse] = useState<string>('')
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    course_name: '',
    message: ''
  })
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false)
  const [enquirySubmitted, setEnquirySubmitted] = useState(false)

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryForm.name || !enquiryForm.phone) {
      toast.error('Please enter your Name and Phone Number')
      return
    }
    setSubmittingEnquiry(true)
    const res = await submitAdmissionEnquiry({
      institution_id: settings.institution_id,
      name: enquiryForm.name,
      email: enquiryForm.email,
      phone: enquiryForm.phone,
      course_name: enquiryCourse || enquiryForm.course_name,
      message: enquiryForm.message
    })
    setSubmittingEnquiry(false)
    if (res.success) {
      toast.success('Your enquiry has been received! Our admission counselor will contact you shortly.')
      setEnquirySubmitted(true)
      setEnquiryForm({ name: '', email: '', phone: '', course_name: '', message: '' })
      setTimeout(() => {
        setEnquirySubmitted(false)
        setEnquiryModalOpen(false)
      }, 2500)
    } else {
      toast.error(res.error || 'Failed to submit enquiry')
    }
  }

  const openCourseEnquiry = (courseTitle: string) => {
    setEnquiryCourse(courseTitle)
    setEnquiryForm(prev => ({ ...prev, course_name: courseTitle }))
    setEnquiryModalOpen(true)
  }

  return (
    <div
      className="min-h-screen antialiased selection:bg-indigo-500 selection:text-white transition-colors"
      style={{
        backgroundColor: '#ffffff',
        color: bodyTextColor,
        fontFamily: `"${fontFamily}", system-ui, -apple-system, sans-serif`,
        ['--font-heading' as any]: `"${headingFont}", sans-serif`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily).replace(/%20/g, '+')}:wght@300;400;500;600;700;800&family=${encodeURIComponent(headingFont).replace(/%20/g, '+')}:wght@400;600;700;800;900&display=swap');
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading) !important;
          color: ${headingColor};
        }
        #home h1, #home h2, #home h3, #home h4, #home p, #home span, .hero-title, .hero-text {
          color: #ffffff !important;
        }
      `}} />

      {/* Unpublished Draft Warning Notice for Admin Preview */}
      {!settings.is_published && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>This website is currently in <strong>DRAFT MODE</strong>. Go to <strong>Website Management</strong> in your Institute Admin panel to publish it.</span>
        </div>
      )}

      {/* ─── TOP BAR ────────────────────────────────────────── */}
      <div
        className="text-xs py-2 px-4 sm:px-8 border-b border-black/10 transition-colors"
        style={{ backgroundColor: topbarBg, color: topbarText }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            {settings.contact_phone && (
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{settings.contact_phone}</span>
              </a>
            )}
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{settings.contact_email}</span>
              </a>
            )}
            {settings.contact_address && (
              <span className="hidden md:flex items-center gap-1.5 opacity-80">
                <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span className="truncate max-w-xs">{settings.contact_address}</span>
              </span>
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 ml-auto">
            {settings.social_facebook && (
              <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.social_twitter && (
              <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.social_youtube && (
              <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {settings.social_linkedin && (
              <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            )}
            <Link
              href="/institute/login"
              className="ml-2 px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: topbarText,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              Institute Login
            </Link>
          </div>
        </div>
      </div>

      {/* ─── MAIN STICKY NAVIGATION ─────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-black/5 shadow-xs transition-all"
        style={{ backgroundColor: navbarBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <Link href={`/${slug}`} className="flex items-center gap-3 group">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={websiteTitle}
                className="w-11 h-11 object-contain rounded-xl shadow-xs border border-slate-100"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                {websiteTitle.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1
                className="font-extrabold text-lg sm:text-xl transition-colors leading-tight"
                style={{ color: headingColor }}
              >
                {websiteTitle}
              </h1>
              {settings.hero_tagline && (
                <p className="text-[11px] font-medium truncate max-w-xs sm:max-w-sm hidden sm:block opacity-70" style={{ color: navbarText }}>
                  {settings.hero_tagline}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold" style={{ color: navbarText }}>
            <a href="#home" className="hover:opacity-80 transition-opacity">Home</a>
            {settings.about_text && <a href="#about" className="hover:opacity-80 transition-opacity">About Us</a>}
            {courses.length > 0 && <a href="#courses" className="hover:opacity-80 transition-opacity">Courses</a>}
            {gallery.length > 0 && <a href="#gallery" className="hover:opacity-80 transition-opacity">Gallery</a>}
            {testimonials.length > 0 && <a href="#testimonials" className="hover:opacity-80 transition-opacity">Reviews</a>}
            {faqs.length > 0 && <a href="#faqs" className="hover:opacity-80 transition-opacity">FAQs</a>}
            {blogs.length > 0 && <a href="#blogs" className="hover:opacity-80 transition-opacity">News</a>}
            <a href="#contact" className="hover:opacity-80 transition-opacity">Contact</a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: buttonTextColor }}
            >
              Admissions Open
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              style={{ color: navbarText }}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-b border-black/10 px-6 py-4 space-y-3 font-semibold text-sm animate-in slide-in-from-top-2"
            style={{ backgroundColor: navbarBg, color: navbarText }}
          >
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">Home</a>
            {settings.about_text && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">About Us</a>}
            {courses.length > 0 && <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">Courses</a>}
            {gallery.length > 0 && <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">Gallery</a>}
            {testimonials.length > 0 && <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">Reviews</a>}
            {faqs.length > 0 && <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">FAQs</a>}
            {blogs.length > 0 && <a href="#blogs" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">News</a>}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:opacity-80">Contact</a>
          </div>
        )}
      </header>

      {/* ─── HERO SECTION (SLIDERS OR FALLBACK BANNER) ────── */}
      <section id="home" className="relative overflow-hidden bg-slate-950 text-white">
        {hasSliders ? (
          <div className="relative min-h-[640px] sm:min-h-[720px] md:min-h-[760px] pb-32 sm:pb-40 md:pb-48 flex items-center">
            {sliders.map((slider, index) => {
              const isActive = index === currentSlide
              return (
                <div
                  key={slider.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 pointer-events-none invisible'}`}
                >
                  {/* Background Image / Overlay */}
                  {slider.image_url ? (
                    <div className="absolute inset-0">
                      <img
                        src={slider.image_url}
                        alt={slider.title || 'Hero Banner'}
                        className="w-full h-full object-cover scale-105 transition-transform duration-10000"
                      />
                      {/* Dual Layer Contrast Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/45" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        background: `radial-gradient(circle at 25% 35%, ${primaryColor}cc 0%, ${secondaryColor}88 45%, #020617 100%)`
                      }}
                    />
                  )}

                  {/* Content Container */}
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-36 sm:pb-44 md:pb-52 h-full flex flex-col justify-center">
                    <div className="max-w-3xl space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-amber-300 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Admissions Open 2025–2026</span>
                      </div>
                      <h2
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                        style={{ color: '#ffffff' }}
                      >
                        {slider.title || websiteTitle}
                      </h2>
                      {slider.sub_title && (
                        <p
                          className="text-sm sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl drop-shadow-md opacity-90"
                          style={{ color: '#e2e8f0' }}
                        >
                          {slider.sub_title}
                        </p>
                      )}
                      <div className="pt-3 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
                          className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                        >
                          <span>{slider.cta_text && slider.cta_text.toLowerCase().trim() !== 'explore courses' ? slider.cta_text : 'Admission Enquiry'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href="#courses"
                          className="px-7 py-3.5 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <span>Explore Courses</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Slider Controls */}
            {sliders.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide(prev => (prev - 1 + sliders.length) % sliders.length)}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % sliders.length)}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-32 sm:bottom-40 md:bottom-44 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-9 bg-white shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback Hero Banner */
          <div className="relative py-24 sm:py-36 pb-36 sm:pb-48 px-4 sm:px-8">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: `radial-gradient(circle at 30% 40%, ${primaryColor}cc 0%, ${secondaryColor}77 50%, #020617 100%)`
              }}
            />
            <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-amber-300 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Welcome to our official campus portal</span>
                </div>
                <h2
                  className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                  style={{ color: '#ffffff' }}
                >
                  {settings.hero_tagline || `Empowering Future Leaders at ${websiteTitle}`}
                </h2>
                <p
                  className="text-sm sm:text-lg md:text-xl font-normal leading-relaxed opacity-90 max-w-xl"
                  style={{ color: '#e2e8f0' }}
                >
                  {settings.hero_sub_text || 'Providing exceptional academic excellence, modern infrastructure, and holistic development to nurture tomorrow’s achievers.'}
                </p>
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
                    className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <span>Apply for Admission</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#about"
                    className="px-7 py-3.5 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    Learn More
                  </a>
                </div>
              </div>

              {/* Decorative Card */}
              <div className="w-full md:w-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl text-left space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Accredited Excellence</h4>
                    <p className="text-xs text-slate-300">Recognized Institution</p>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  We blend high standards of academic learning with moral values, cutting-edge technology, and co-curricular programs.
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>Admissions Open for 2025</span>
                  <a href="#contact" className="hover:text-white flex items-center gap-1">Contact Us →</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── KEY STATS / ACHIEVEMENTS ───────────────────────── */}
      {stats.length > 0 && (
        <section className="relative z-30 -mt-20 sm:-mt-24 md:-mt-28 max-w-7xl mx-auto px-4 sm:px-8">
          <div
            className="rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all backdrop-blur-xl"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className={`grid gap-4 sm:gap-6 ${
              stats.length <= 4 
                ? 'grid-cols-2 sm:grid-cols-4' 
                : stats.length === 5 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            }`}>
              {stats.map((st) => (
                <div
                  key={st.id}
                  className="text-center p-4 rounded-2xl transition-all hover:scale-[1.02] hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                >
                  <div
                    className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white mb-3 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ color: headingColor }}
                  >
                    {st.value}
                  </div>
                  <div
                    className="text-xs sm:text-sm font-semibold mt-1"
                    style={{ color: bodyTextColor }}
                  >
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── ABOUT US SECTION ───────────────────────────────── */}
      {(settings.about_text || settings.about_vision || settings.about_mission) && (
        <section id="about" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span
              className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200"
              style={{ color: primaryColor }}
            >
              Who We Are
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About Our Institution
            </h3>
            <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full" style={{ backgroundColor: primaryColor }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              {settings.about_text && (
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                  {settings.about_text}
                </p>
              )}

              {/* Vision and Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {settings.about_vision && (
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Our Vision</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {settings.about_vision}
                    </p>
                  </div>
                )}
                {settings.about_mission && (
                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Our Mission</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {settings.about_mission}
                    </p>
                  </div>
                )}
              </div>

              {/* Highlights Checklist */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>State of the art Laboratories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Experienced & Dedicated Faculty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprehensive Sports & Arts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Safe & Connected Transport</span>
                </div>
              </div>
            </div>

            {/* Visual side card */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border min-h-[380px] flex flex-col justify-end p-8 sm:p-10 text-white space-y-4"
                style={{ borderColor: cardBorder }}
              >
                {settings.about_image_url ? (
                  <div className="absolute inset-0">
                    <img
                      src={settings.about_image_url}
                      alt="Campus Life"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent" />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}cc, #020617)` }}
                  />
                )}
                <div className="relative z-10 space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white">
                    Campus Life
                  </div>
                  <h4 className="text-2xl font-bold leading-snug text-white">
                    Nurturing talent, inspiring innovation, shaping leadership.
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Our curriculum is designed to stimulate critical thinking and creativity, preparing learners for a rapidly evolving global landscape.
                  </p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-amber-400">100%</div>
                      <div className="text-xs text-slate-300">Committed Guidance</div>
                    </div>
                    <button
                      onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-md"
                    >
                      Enquire Today
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── COURSES / PROGRAMS SECTION ─────────────────────── */}
      {courses.length > 0 && (
        <section
          id="courses"
          className="py-20 px-4 sm:px-8 border-y transition-colors"
          style={{ backgroundColor: sectionAltBg, borderColor: cardBorder }}
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                Academics
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: headingColor }}>
                Featured Programs & Courses
              </h3>
              <p className="text-sm font-medium" style={{ color: bodyTextColor }}>
                Choose from our comprehensively structured academic curriculums and courses.
              </p>
            </div>

            {/* Filter pills */}
            {courseCategories.length > 2 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {courseCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCourseCategory(cat)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: selectedCourseCategory === cat ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : cardBg,
                      color: selectedCourseCategory === cat ? buttonTextColor : bodyTextColor,
                      border: `1px solid ${selectedCourseCategory === cat ? 'transparent' : cardBorder}`,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((crs) => (
                <div
                  key={crs.id}
                  className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col group"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  {crs.image_url ? (
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={crs.image_url}
                        alt={crs.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {crs.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                          {crs.category}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className="h-32 flex items-center justify-center p-6 text-white relative"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <BookOpen className="w-10 h-10 opacity-30 absolute right-4 bottom-4" />
                      {crs.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
                          {crs.category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {crs.title}
                      </h4>
                      {crs.description && (
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                          {crs.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      {crs.duration && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{crs.duration}</span>
                        </div>
                      )}
                      {crs.fees && (
                        <div className="font-extrabold text-slate-900 text-sm">
                          {crs.fees}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openCourseEnquiry(crs.title)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <span>Enquire for Course</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── GALLERY SECTION ────────────────────────────────── */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span
              className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200"
              style={{ color: primaryColor }}
            >
              Life on Campus
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Photo & Campus Gallery
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Glimpses of activities, celebrations, laboratories, and memories made at our institution.
            </p>
          </div>

          {/* Gallery Category Filter */}
          {galleryCategories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedGalleryCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedGalleryCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid of Images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveLightboxImg(item.image_url)}
                className="group relative h-48 sm:h-60 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all border border-slate-200"
              >
                <img
                  src={item.image_url}
                  alt={item.caption || 'Campus photo'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-xs font-bold">{item.caption || item.category || 'View Photo'}</span>
                  <span className="text-[10px] text-indigo-300 font-medium">Click to expand</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal */}
          {activeLightboxImg && (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
              onClick={() => setActiveLightboxImg(null)}
            >
              <button
                className="absolute top-6 right-6 text-white hover:text-slate-300 p-2"
                onClick={() => setActiveLightboxImg(null)}
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={activeLightboxImg}
                alt="Enlarged view"
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </section>
      )}

      {/* ─── TESTIMONIALS SECTION ───────────────────────────── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-20 px-4 sm:px-8 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Success Stories
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                What Students & Parents Say
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Hear authentic feedback and inspiring stories from our student community and families.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                      "{t.message}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-700 flex items-center gap-3">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.student_name}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-400"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                        {t.student_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-white">{t.student_name}</div>
                      {t.designation && <div className="text-[11px] text-slate-400">{t.designation}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQS SECTION ───────────────────────────────────── */}
      {faqs.length > 0 && (
        <section id="faqs" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span
              className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200"
              style={{ color: primaryColor }}
            >
              Have Questions?
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Quick answers to common questions about admissions, fees, and campus life.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => {
              const isOpen = openFaq === f.id
              return (
                <div
                  key={f.id}
                  className="rounded-2xl border overflow-hidden shadow-xs transition-all"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : f.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm hover:opacity-80 transition-opacity"
                    style={{ color: headingColor }}
                  >
                    <span>{f.question}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t border-black/5" style={{ color: bodyTextColor }}>
                      {f.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ─── LATEST NEWS & BLOGS ────────────────────────────── */}
      {blogs.length > 0 && (
        <section
          id="blogs"
          className="py-20 px-4 sm:px-8 border-t transition-colors"
          style={{ backgroundColor: sectionAltBg, borderColor: cardBorder }}
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                }}
              >
                Updates & News
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: headingColor }}>
                Latest Announcements & Articles
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border flex flex-col"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  {b.cover_image_url && (
                    <img src={b.cover_image_url} alt={b.title} className="h-44 w-full object-cover" />
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      {b.published_at && (
                        <div className="text-[11px] font-semibold flex items-center gap-1" style={{ color: primaryColor }}>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(b.published_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      <h4 className="font-bold text-base line-clamp-2" style={{ color: headingColor }}>
                        {b.title}
                      </h4>
                      {b.excerpt && (
                        <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: bodyTextColor }}>
                          {b.excerpt}
                        </p>
                      )}
                    </div>
                    {b.author && (
                      <div className="pt-3 border-t border-black/5 text-[11px] font-medium opacity-60" style={{ color: bodyTextColor }}>
                        By {b.author}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CONTACT & ADMISSION ENQUIRY SECTION ───────────── */}
      <section id="contact" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span
            className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              borderColor: `${primaryColor}30`,
            }}
          >
            Get In Touch
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: headingColor }}>
            Contact & Admission Enquiry
          </h3>
          <p className="text-sm font-medium" style={{ color: bodyTextColor }}>
            Have any questions or looking to enroll? Connect with our team or fill the enquiry form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <h4 className="font-extrabold text-xl" style={{ color: headingColor }}>Campus Information</h4>

            <div className="space-y-4 text-sm text-slate-600">
              {settings.contact_address && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Campus Address</div>
                    <div className="text-xs sm:text-sm mt-0.5 leading-relaxed">{settings.contact_address}</div>
                  </div>
                </div>
              )}

              {settings.contact_phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Call Us</div>
                    <a href={`tel:${settings.contact_phone}`} className="text-xs sm:text-sm text-indigo-600 hover:underline mt-0.5 block">
                      {settings.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {settings.contact_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Email Address</div>
                    <a href={`mailto:${settings.contact_email}`} className="text-xs sm:text-sm text-indigo-600 hover:underline mt-0.5 block">
                      {settings.contact_email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Google Map Link / Embed */}
            {settings.google_map_link && (
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={settings.google_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </div>
            )}
          </div>

          {/* Admission Enquiry Form */}
          <div
            className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div>
              <h4 className="font-extrabold text-xl" style={{ color: headingColor }}>Admission & General Enquiry</h4>
              <p className="text-xs mt-1" style={{ color: bodyTextColor }}>Leave your details and our admission counselor will call you.</p>
            </div>

            {enquirySubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h5 className="font-extrabold text-emerald-900 text-base">Enquiry Submitted Successfully!</h5>
                <p className="text-xs text-emerald-700">Thank you! We have received your request and will reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Student / Parent Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. parent@example.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course / Grade Interested</label>
                    {courses.length > 0 ? (
                      <select
                        value={enquiryForm.course_name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, course_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white"
                      >
                        <option value="">Select a Course / Class</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Class 10th or Science Stream"
                        value={enquiryForm.course_name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, course_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Message / Any Questions</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about previous school, queries on fee structure, transport, etc."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingEnquiry ? 'Submitting Enquiry...' : 'Submit Admission Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── ENQUIRY MODAL (TRIGGERED BY BUTTONS) ───────────── */}
      {enquiryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEnquiryModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEnquiryModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h4 className="font-extrabold text-xl text-slate-900">
                {enquiryCourse ? `Enquire for: ${enquiryCourse}` : 'Admission Enquiry'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Please fill in your contact information and our counselor will assist you.
              </p>
            </div>

            {enquirySubmitted ? (
              <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h5 className="font-extrabold text-emerald-900 text-sm">Enquiry Received!</h5>
                <p className="text-xs text-emerald-700">We will get in touch with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Message</label>
                  <textarea
                    rows={2}
                    placeholder="Queries or notes..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 resize-y"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  {submittingEnquiry ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer
        className="border-t text-xs transition-colors"
        style={{ backgroundColor: footerBg, color: footerText, borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={websiteTitle} className="w-9 h-9 object-contain rounded-lg" />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  {websiteTitle.charAt(0)}
                </div>
              )}
              <div className="font-extrabold text-base" style={{ color: '#ffffff' }}>{websiteTitle}</div>
            </div>
            <p className="opacity-80 text-xs leading-relaxed">
              {settings.hero_tagline || 'Committed to academic excellence, leadership development, and fostering an environment where every student excels.'}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm" style={{ color: '#ffffff' }}>Quick Links</h5>
            <ul className="space-y-2 text-xs opacity-80">
              <li><a href="#home" className="hover:opacity-100 transition-opacity">Home</a></li>
              {settings.about_text && <li><a href="#about" className="hover:opacity-100 transition-opacity">About Us</a></li>}
              {courses.length > 0 && <li><a href="#courses" className="hover:opacity-100 transition-opacity">Courses & Programs</a></li>}
              {gallery.length > 0 && <li><a href="#gallery" className="hover:opacity-100 transition-opacity">Campus Gallery</a></li>}
              {faqs.length > 0 && <li><a href="#faqs" className="hover:opacity-100 transition-opacity">FAQs</a></li>}
              <li><a href="#contact" className="hover:opacity-100 transition-opacity">Contact Us</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm" style={{ color: '#ffffff' }}>Campus Contacts</h5>
            <ul className="space-y-2 text-xs opacity-80">
              {settings.contact_phone && <li>Phone: {settings.contact_phone}</li>}
              {settings.contact_email && <li>Email: {settings.contact_email}</li>}
              {settings.contact_address && <li>Address: {settings.contact_address}</li>}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm" style={{ color: '#ffffff' }}>Portals</h5>
            <p className="opacity-80 text-xs">
              Official faculty and administrative portal:
            </p>
            <Link
              href="/institute/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-colors"
            >
              <span>Institute Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 px-4 sm:px-8 text-center opacity-70 text-[11px] flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-3">
          <div>
            © {new Date().getFullYear()} {websiteTitle}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1 font-medium">
            <span>Powered by</span>
            <span className="font-bold text-indigo-400">Academy Setu</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
