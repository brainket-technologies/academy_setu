'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Phone, Mail, MapPin, ChevronRight, ChevronLeft,
  Calendar, Clock, CheckCircle2, Star, ArrowRight,
  BookOpen, Users, Award, Shield, Sparkles, Send,
  Menu, X, ExternalLink, Eye, GraduationCap, UserCheck,
  FileText, Info, Building2
} from 'lucide-react'
import { submitAdmissionEnquiry } from '@/app/institute/website/actions'
import { toast } from 'sonner'

// Social SVG Icons with authentic brand colors matching lcabithan
const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
  teachers?: Array<{
    id: string | number
    name: string
    username?: string
    contact?: string
    email?: string
    assigned_classes?: string[]
    avatar?: string
    details?: any
  }>
}

export default function ClientWebsite({ data, slug }: { data: WebsiteData; slug: string }) {
  const { settings, sliders, stats, courses, faqs, testimonials, blogs, gallery, teachers = [] } = data

  // lcabithan style defaults
  const primaryColor = settings.primary_color || '#0d6efd'
  const secondaryColor = settings.secondary_color || '#ffc107'
  const topbarBg = settings.topbar_bg_color || '#0dcaf0'
  const topbarText = settings.topbar_text_color || '#0f172a'
  const navbarBg = settings.navbar_bg_color || '#132742'
  const navbarText = settings.navbar_text_color || '#ffffff'
  const footerBg = settings.footer_bg_color || '#0f172a'
  const footerText = settings.footer_text_color || '#cbd5e1'
  const websiteTitle = settings.website_title || 'Cosmopolitan Inter College'

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0)
  const hasSliders = sliders && sliders.length > 0

  useEffect(() => {
    if (!hasSliders || sliders.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [hasSliders, sliders?.length])

  // Gallery Lightbox
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null)

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
      toast.error('Please enter your Name and Mobile Number')
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
      toast.success('Your message has been sent successfully!')
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

  // Fallback demo teachers if not enough registered
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
    <div className="min-h-screen bg-white text-slate-700 antialiased font-sans selection:bg-blue-600 selection:text-white">

      {/* Unpublished Draft Warning Notice for Admin Preview */}
      {!settings.is_published && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>This website is currently in <strong>DRAFT MODE</strong>. Go to <strong>Website Management</strong> to publish it.</span>
        </div>
      )}

      {/* ─── TOP HEADER (CYAN / SKY BLUE BAR LIKE LCABITHAN) ─── */}
      <header className="sticky top-0 z-40 shadow-sm">
        <div
          className="py-2 px-4 sm:px-8 text-xs font-medium border-b border-black/5"
          style={{ backgroundColor: topbarBg, color: topbarText }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            {/* Contact details */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-center md:text-left">
              {settings.contact_address && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate max-w-xs sm:max-w-md">{settings.contact_address}</span>
                </span>
              )}

              {settings.contact_phone && (
                <>
                  <span className="hidden sm:inline opacity-40">|</span>
                  <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-1 hover:underline">
                    <span>📞</span>
                    <span>{settings.contact_phone}</span>
                  </a>
                </>
              )}

              {settings.contact_email && (
                <>
                  <span className="hidden sm:inline opacity-40">|</span>
                  <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-1 hover:underline">
                    <span>✉️</span>
                    <span>{settings.contact_email}</span>
                  </a>
                </>
              )}
            </div>

            {/* Login & Apply Buttons (exact lcabithan style: blue Login, yellow Apply) */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/institute/login"
                className="bg-[#0d6efd] hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1 rounded transition-colors shadow-xs"
              >
                Login
              </Link>
              <Link
                href={`/${slug}/apply`}
                className="bg-[#ffc107] hover:bg-amber-400 text-slate-900 font-semibold text-xs px-3.5 py-1 rounded transition-colors shadow-xs"
              >
                Apply
              </Link>
            </div>
          </div>
        </div>

        {/* ─── MAIN NAVBAR (DEEP NAVY BLUE LIKE LCABITHAN) ─── */}
        <nav
          className="px-4 sm:px-8 py-3 transition-colors"
          style={{ backgroundColor: navbarBg, color: navbarText }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Brand / Logo */}
            <Link href={`/${slug}`} className="flex items-center gap-3 shrink-0 group">
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={websiteTitle}
                  className="w-11 h-11 object-contain rounded-full bg-white p-0.5 border-2 border-red-500 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white border-2 border-red-600 flex items-center justify-center shadow-md shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-extrabold text-sm">
                    {websiteTitle.charAt(0)}
                  </div>
                </div>
              )}
              <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                {websiteTitle}
              </span>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-100">
              <Link href={`/${slug}`} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Home</Link>
              <Link href={`/${slug}/about`} className="hover:text-blue-300 transition-colors">About</Link>
              
              {/* Services / Courses Dropdown */}
              <div
                className="relative group py-1"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>Services</span>
                  <span className="text-xs">▼</span>
                </button>
                <div
                  className={`absolute top-full left-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-2 transition-all duration-200 z-50 ${servicesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                >
                  <Link
                    href={`/${slug}/courses`}
                    onClick={() => setServicesDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600"
                  >
                    Courses / Classes
                  </Link>
                  <Link
                    href={`/${slug}/hostel`}
                    onClick={() => setServicesDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600"
                  >
                    Hostel Service
                  </Link>
                  <Link
                    href={`/${slug}/transport`}
                    onClick={() => setServicesDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600"
                  >
                    Van / Transport Route
                  </Link>
                </div>
              </div>

              <Link href={`/${slug}/teachers`} className="hover:text-blue-300 transition-colors">Teachers</Link>
              <Link href={`/${slug}/gallery`} className="hover:text-blue-300 transition-colors">Gallery</Link>
              <Link href={`/${slug}/contact`} className="hover:text-blue-300 transition-colors">Contact</Link>
              <Link href={`/${slug}/news`} className="hover:text-blue-300 transition-colors">Notice / News</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-white hover:text-blue-300 rounded-lg"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-2 text-sm font-semibold text-slate-100">
              <Link href={`/${slug}`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Home</Link>
              <Link href={`/${slug}/about`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">About</Link>
              <Link href={`/${slug}/courses`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Courses / Classes</Link>
              <Link href={`/${slug}/hostel`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Hostel Service</Link>
              <Link href={`/${slug}/transport`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Van Route</Link>
              <Link href={`/${slug}/teachers`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Teachers</Link>
              <Link href={`/${slug}/gallery`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Gallery</Link>
              <Link href={`/${slug}/contact`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Contact</Link>
              <Link href={`/${slug}/news`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">Notice / News</Link>
              <div className="pt-2 flex gap-2">
                <Link
                  href="/institute/login"
                  className="flex-1 text-center bg-[#0d6efd] text-white py-1.5 rounded font-semibold text-xs"
                >
                  Login
                </Link>
                <Link
                  href={`/${slug}/apply`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-[#ffc107] text-slate-900 py-1.5 rounded font-semibold text-xs"
                >
                  Apply
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ─── HERO CAROUSEL / SLIDER (FULL WIDTH BANNER LIKE LCABITHAN) ─── */}
      <section id="home" className="relative overflow-hidden bg-slate-900">
        {hasSliders ? (
          <div className="relative w-full h-[320px] sm:h-[450px] md:h-[520px] lg:h-[600px] overflow-hidden">
            {sliders.map((slider, index) => {
              const isActive = index === currentSlide
              return (
                <div
                  key={slider.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 pointer-events-none invisible'
                  }`}
                >
                  {slider.image_url ? (
                    <img
                      src={slider.image_url}
                      alt={slider.title || 'Banner'}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #132742 100%)' }}
                    >
                      <div className="text-center p-6 max-w-2xl">
                        <h2 className="text-3xl sm:text-5xl font-black mb-3">{websiteTitle}</h2>
                        <p className="text-sm sm:text-lg opacity-90">{settings.hero_tagline}</p>
                      </div>
                    </div>
                  )}

                  {/* Clean banner caption if slide has specific custom title */}
                  {slider.title && slider.title.trim() !== '' && (
                    <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-lg bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl text-white shadow-xl border border-white/10 hidden sm:block">
                      <h3 className="font-extrabold text-lg sm:text-2xl mb-1">{slider.title}</h3>
                      {slider.sub_title && <p className="text-xs sm:text-sm text-slate-200 mb-3">{slider.sub_title}</p>}
                      <button
                        onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
                        className="bg-[#0d6efd] hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                      >
                        <span>{slider.cta_text || 'Admission Enquiry'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Slider Navigation Arrows */}
            {sliders.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide(prev => (prev - 1 + sliders.length) % sliders.length)}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-md"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % sliders.length)}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-md"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Carousel Indicators / Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === currentSlide ? 'w-8 bg-[#0d6efd]' : 'w-2.5 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Default Banner */
          <div className="relative py-20 px-4 sm:px-8 text-white bg-gradient-to-r from-[#132742] to-[#0d6efd] text-center">
            <div className="max-w-4xl mx-auto space-y-4">
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                Admissions Open 2025–2026
              </span>
              <h2 className="text-3xl sm:text-5xl font-black">{websiteTitle}</h2>
              <p className="text-sm sm:text-lg text-slate-100 max-w-2xl mx-auto">
                {settings.hero_sub_text || 'Providing exceptional academic excellence, modern infrastructure, and holistic mentorship.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { setEnquiryCourse(''); setEnquiryModalOpen(true) }}
                  className="bg-[#ffc107] hover:bg-amber-400 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  Apply For Admission
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── ABOUT OUR SCHOOL (EXACT LCABITHAN SECTION WITH BLUE UNDERLINE BAR) ─── */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading with Blue Underline */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              About Our School
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Image Column with 10+ Years Floating Badge */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                <img
                  src={
                    settings.about_image_url ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop'
                  }
                  alt="About Campus"
                  className="w-full h-[320px] sm:h-[400px] object-cover"
                />
                
                {/* 10+ Years of Excellence floating badge */}
                <div className="absolute bottom-5 right-5 bg-white text-center rounded-2xl shadow-xl p-4 border border-slate-100 min-w-[130px]">
                  <h5 className="text-2xl sm:text-3xl font-black text-[#0d6efd]">10+</h5>
                  <small className="text-xs font-bold text-slate-700 block leading-tight">
                    Years of<br />Excellence
                  </small>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-5 lg:ps-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {settings.hero_tagline || 'Shaping Bright Futures'}
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {settings.about_text ||
                  `At ${websiteTitle}, we are committed to providing a safe, inspiring, and student-centered learning environment where every child is encouraged to discover their unique talents and reach their highest potential. Our dedicated educators combine academic excellence with strong moral values, creativity, and life skills to prepare students for the challenges of tomorrow.`}
              </p>

              {settings.about_vision && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-slate-700">
                  <strong className="text-[#0d6efd] block mb-1">Our Vision:</strong>
                  {settings.about_vision}
                </div>
              )}

              {/* Highlights List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Experienced Teaching Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Modern Smart Classrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Safe Transport with GPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Holistic Sports & Activity</span>
                </div>
              </div>

              {/* Contact Us Outline Button */}
              <div className="pt-4">
                <Link
                  href={`/${slug}/contact`}
                  className="inline-block border-2 border-[#0d6efd] text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white font-bold text-sm px-7 py-2.5 rounded-lg transition-all shadow-xs"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COUNTER / STATS SECTION (SOLID BLUE BG LIKE LCABITHAN) ─── */}
      <section className="py-14 text-white bg-[#0d6efd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats && stats.length > 0 ? (
              stats.slice(0, 4).map((st) => (
                <div
                  key={st.id}
                  className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs transition-transform hover:-translate-y-1"
                >
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1">{st.value}</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider mb-0">{st.label}</p>
                </div>
              ))
            ) : (
              <>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">1000+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Students</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Users className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">25+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Teachers</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Award className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">100%</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Result</p>
                </div>
                <div className="p-5 sm:p-6 border border-white/20 rounded-2xl shadow-sm bg-white/10 backdrop-blur-xs">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-[#ffc107]" />
                  <h3 className="text-2xl sm:text-4xl font-extrabold mb-1">20+</h3>
                  <p className="text-xs uppercase font-bold text-blue-100 tracking-wider">Class Rooms</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── OUR ACADEMIC PROGRAMS / COURSES (CARD GRID WITH CIRCLE ICONS) ─── */}
      <section id="courses" className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Our Academic Programs
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[140px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((crs) => (
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
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {crs.description || 'Structured academic preparation with personalized guidance.'}
                  </p>
                </div>

                <div>
                  <hr className="my-3 border-slate-100" />
                  <div className="flex items-center justify-between text-xs mb-3">
                    {crs.duration && <span className="text-slate-500 font-medium">⏱ {crs.duration}</span>}
                    {crs.fees && <span className="font-bold text-slate-900">{crs.fees}</span>}
                  </div>
                  <Link
                    href={`/${slug}/courses/${crs.id}`}
                    className="block w-full border border-[#0d6efd] text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white rounded-full py-1.5 text-xs font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEET OUR EXPERT TEACHERS (EXACT LCABITHAN STYLE) ─── */}
      <section id="teachers" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Meet Our Expert Teacher's
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[240px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTeachers.map((t, idx) => {
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

      {/* ─── OUR SCHOOL GALLERY (WITH EYE HOVER LIKE LCABITHAN) ─── */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Centered Heading */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                Our School Gallery
              </h2>
              <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[150px] rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map((item) => (
                <div key={item.id} className="group">
                  <div
                    onClick={() => setActiveLightboxImg(item.image_url)}
                    className="relative h-56 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-slate-100 transition-all"
                  >
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Campus photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover eye overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white text-[#0d6efd] flex items-center justify-center shadow-lg">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  {item.caption && (
                    <p className="text-center text-slate-600 text-xs font-semibold mt-2.5 line-clamp-1">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            {activeLightboxImg && (
              <div
                className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
                onClick={() => setActiveLightboxImg(null)}
              >
                <button
                  onClick={() => setActiveLightboxImg(null)}
                  className="absolute top-5 right-5 text-white hover:text-slate-300 p-2"
                >
                  <X className="w-8 h-8" />
                </button>
                <img
                  src={activeLightboxImg}
                  alt="Expanded"
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── LATEST NOTICES & NEWS (WITH TOP FLOATING BADGE) ─── */}
      {blogs.length > 0 && (
        <section id="blogs" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto">
            {/* Centered Heading */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                Latest Notices & News
              </h2>
              <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((b, idx) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 pt-7 relative flex flex-col justify-between"
                >
                  {/* Floating badge at top-left */}
                  <span className="absolute -top-3 left-6 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-xs">
                    ● {idx % 2 === 0 ? 'Exam' : 'Event'}
                  </span>

                  <div>
                    <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{b.published_at ? new Date(b.published_at).toLocaleDateString() : 'Active'}</span>
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
                      href={`/${slug}/news/${b.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHAT OUR PARENT & STUDENT SAY (TESTIMONIALS) ─── */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                What Our Parent & Student Say
              </h2>
              <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[180px] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-slate-50/60 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                      "{t.message}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 mt-4 flex items-center gap-3">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.student_name}
                        className="w-10 h-10 rounded-full object-cover border border-blue-400"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0d6efd] text-white flex items-center justify-center font-bold text-sm">
                        {t.student_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t.student_name}</div>
                      {t.designation && <div className="text-xs text-slate-500">{t.designation}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CONTACT US SECTION (EXACT LCABITHAN 2-COLUMN LAYOUT) ─── */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Contact Us
            </h2>
            <div className="mx-auto bg-[#0d6efd] mt-2.5 mb-2 h-[3.5px] w-[100px] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: School Address, Contact Info, Map */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Dual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* School Address Card */}
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                  <MapPin className="w-8 h-8 text-[#0d6efd] mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">School Address</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-0">
                    {settings.contact_address || 'Main Campus Road, Samastipur, Bihar'}
                  </p>
                </div>

                {/* Contact Info Card */}
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

              {/* Google Maps Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-64">
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
                <h3 className="text-xl font-bold text-[#0d6efd] mb-4">
                  Send Us a Message
                </h3>

                {enquirySubmitted ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h5 className="font-bold text-emerald-900 text-base">Message Sent Successfully!</h5>
                    <p className="text-xs text-emerald-700">Thank you! Our admission team will get in touch with you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={enquiryForm.name}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXXXXXXX"
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Write your query or question here..."
                        value={enquiryForm.message}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white resize-y"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={submittingEnquiry}
                        className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <span>{submittingEnquiry ? 'Sending...' : 'Send Message'}</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODAL ENQUIRY DIALOG ─── */}
      {enquiryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setEnquiryModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEnquiryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 mb-1">
              {enquiryCourse ? `Apply for: ${enquiryCourse}` : 'Admission Application'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter your contact details and our office will get in touch with you.
            </p>

            <form onSubmit={handleEnquirySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 XXXXXXXXXX"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Class interested, previous marks, etc."
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEnquiry}
                className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all"
              >
                {submittingEnquiry ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── FOOTER (EXACT LCABITHAN DARK FOOTER WITH YELLOW HEADINGS) ─── */}
      <footer
        className="text-white pt-14 pb-8 transition-colors border-t border-black/10"
        style={{ backgroundColor: footerBg, color: footerText }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            
            {/* Col 1: Logo & About */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#ffc107] text-slate-950 font-black flex items-center justify-center text-sm shadow">
                    {websiteTitle.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-lg text-[#ffc107]">
                  {websiteTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Humara maqsad har bache ko behtareen taleem aur achi tarbiyat dena hai taaki wo ek kamyab mustaqbil bana sakein.
              </p>
            </div>

            {/* Col 2: Quick Links with icons */}
            <div className="space-y-3">
              <h4 className="uppercase font-bold text-sm text-[#ffc107]">Quick Links</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href={`/${slug}/about`} className="hover:text-white flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#ffc107]" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${slug}/apply`} className="hover:text-white flex items-center gap-2 text-left">
                    <FileText className="w-3.5 h-3.5 text-[#ffc107]" />
                    <span>Admissions</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${slug}/courses`} className="hover:text-white flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#ffc107]" />
                    <span>Courses</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${slug}/contact`} className="hover:text-white flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#ffc107]" />
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div className="space-y-3">
              <h4 className="uppercase font-bold text-sm text-[#ffc107]">Contact</h4>
              <div className="space-y-2.5 text-xs text-slate-300">
                {settings.contact_address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#ffc107] shrink-0 mt-0.5" />
                    <span>{settings.contact_address}</span>
                  </div>
                )}
                {settings.contact_email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#ffc107] shrink-0" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-white">
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#ffc107] shrink-0" />
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-white">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Col 4: Follow Us */}
            <div className="space-y-3">
              <h4 className="uppercase font-bold text-sm text-[#ffc107]">Follow Us</h4>
              <div className="flex flex-col gap-2.5 text-xs">
                {settings.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span className="text-[#1877f2]"><FacebookIcon /></span>
                    <span>Facebook</span>
                  </a>
                )}
                {settings.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span className="text-[#e4405f]"><InstagramIcon /></span>
                    <span>Instagram</span>
                  </a>
                )}
                {settings.social_youtube && (
                  <a
                    href={settings.social_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <span className="text-[#ff0000]"><YoutubeIcon /></span>
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <hr className="border-white/10 my-6" />

          {/* Bottom Copyright and Made by Academy Setu */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              Copyright © {new Date().getFullYear()} All rights reserved by:{' '}
              <a href={`/${slug}`} className="text-[#ffc107] font-bold hover:underline">
                {websiteTitle}
              </a>
            </div>
            <div>
              <a
                href="https://drishticomputer.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-300 transition-colors font-medium"
              >
                Made by Academy Setu
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
