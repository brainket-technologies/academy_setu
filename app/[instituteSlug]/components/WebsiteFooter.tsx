'use client'

import React from 'react'
import Link from 'next/link'
import { Info, FileText, BookOpen, Mail, MapPin, Phone } from 'lucide-react'

// Social SVG Icons
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

interface WebsiteFooterProps {
  slug: string
  settings: any
  onOpenEnquiry?: () => void
}

export default function WebsiteFooter({ slug, settings, onOpenEnquiry }: WebsiteFooterProps) {
  const footerBg = settings.footer_bg_color || '#0f172a'
  const footerText = settings.footer_text_color || '#cbd5e1'
  const websiteTitle = settings.website_title || 'Cosmopolitan Inter College'

  return (
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
            <Link href={`/${slug}`} className="text-[#ffc107] font-bold hover:underline">
              {websiteTitle}
            </Link>
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
  )
}
