'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface WebsiteNavbarProps {
  slug: string
  settings: any
  onOpenEnquiry: (course?: string) => void
  activePage?: string
}

export default function WebsiteNavbar({
  slug,
  settings,
  onOpenEnquiry,
  activePage = 'home'
}: WebsiteNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)

  const topbarBg = settings.topbar_bg_color || '#0dcaf0'
  const topbarText = settings.topbar_text_color || '#0f172a'
  const navbarBg = settings.navbar_bg_color || '#132742'
  const navbarText = settings.navbar_text_color || '#ffffff'
  const websiteTitle = settings.website_title || 'Cosmopolitan Inter College'

  return (
    <header className="sticky top-0 z-40 shadow-sm w-full">
      {/* ─── TOP HEADER (CYAN / SKY BLUE BAR) ─── */}
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

          {/* Login & Apply Buttons */}
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

      {/* ─── MAIN NAVBAR (DEEP NAVY BLUE BAR) ─── */}
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

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-100">
            <Link
              href={`/${slug}`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'home' ? 'text-blue-400' : ''}`}
            >
              Home
            </Link>
            <Link
              href={`/${slug}/about`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'about' ? 'text-blue-400' : ''}`}
            >
              About
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative group py-1"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1 hover:text-blue-300 transition-colors cursor-pointer ${
                  activePage === 'courses' || activePage === 'hostel' || activePage === 'transport'
                    ? 'text-blue-400'
                    : ''
                }`}
              >
                <span>Services</span>
                <span className="text-xs">▼</span>
              </button>

              <div
                className={`absolute top-full left-0 mt-1 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-2 transition-all duration-200 z-50 ${
                  servicesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
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
                  Van Route
                </Link>
              </div>
            </div>

            <Link
              href={`/${slug}/teachers`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'teachers' ? 'text-blue-400' : ''}`}
            >
              Teachers
            </Link>
            <Link
              href={`/${slug}/gallery`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'gallery' ? 'text-blue-400' : ''}`}
            >
              Gallery
            </Link>
            <Link
              href={`/${slug}/contact`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'contact' ? 'text-blue-400' : ''}`}
            >
              Contact
            </Link>
            <Link
              href={`/${slug}/news`}
              className={`hover:text-blue-300 transition-colors ${activePage === 'news' ? 'text-blue-400' : ''}`}
            >
              Notice / News
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-2 text-sm font-semibold text-slate-100">
            <Link href={`/${slug}`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Home
            </Link>
            <Link href={`/${slug}/about`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              About
            </Link>
            <Link href={`/${slug}/courses`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Courses / Classes
            </Link>
            <Link href={`/${slug}/hostel`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Hostel Service
            </Link>
            <Link href={`/${slug}/transport`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Van Route
            </Link>
            <Link href={`/${slug}/teachers`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Teachers
            </Link>
            <Link href={`/${slug}/gallery`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Gallery
            </Link>
            <Link href={`/${slug}/contact`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Contact
            </Link>
            <Link href={`/${slug}/news`} onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-blue-300">
              Notice / News
            </Link>
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
  )
}
