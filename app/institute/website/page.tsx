'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Globe, Settings, Image, BarChart2, BookOpen, HelpCircle, MessageSquare, FileText,
  Camera, Save, Plus, Trash2, ExternalLink, Eye, EyeOff, Edit2, X, CheckCircle, RefreshCw,
  ChevronDown, ChevronUp, Star, LayoutDashboard, Link2, Inbox, Phone, Mail,
  Palette, Type, Sparkles, Check, Copy, Home, Info, Users, GraduationCap, MapPin,
  Award, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
  fetchWebsiteSettings, saveWebsiteSettings,
  updateSectionVisibility, updatePageContent, fetchTeachersList,
  fetchSliders, saveSlider, deleteSlider,
  fetchStats, saveStat, deleteStat,
  fetchCourses, saveCourse, deleteCourse,
  fetchFaqs, saveFaq, deleteFaq,
  fetchTestimonials, saveTestimonial, deleteTestimonial,
  fetchBlogs, saveBlog, deleteBlog,
  fetchGallery, saveGalleryItem, deleteGalleryItem,
  fetchEnquiries, updateEnquiryStatus,
} from './actions'

// ─── SIDEBAR TABS (PAGE-WISE) ────────────────────────────────────
const TABS = [
  { key: 'general', label: 'General Settings', icon: Settings, badge: 'Global Branding' },
  { key: 'home', label: 'Home Page', icon: Home, badge: 'Main Landing /' },
  { key: 'about', label: 'About Page', icon: Info, badge: '/about' },
  { key: 'courses', label: 'Courses & Classes', icon: BookOpen, badge: '/courses' },
  { key: 'teachers', label: 'Teachers / Faculty', icon: Users, badge: '/teachers' },
  { key: 'gallery', label: 'Campus Gallery', icon: Camera, badge: '/gallery' },
  { key: 'news', label: 'Notice & News', icon: FileText, badge: '/news' },
  { key: 'contact', label: 'Contact Us', icon: Phone, badge: '/contact' },
  { key: 'enquiries', label: 'Admission Enquiries', icon: Inbox, badge: '/apply' },
]

// ─── REUSABLE INPUT ───────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
    {children}
  </div>
)
const inp = "w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-violet-500 font-semibold text-slate-700 dark:text-slate-200"
const txa = inp + " min-h-[80px] resize-y"

// ─── TOGGLE ───────────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${value ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${value ? 'left-5.5' : 'left-0.5'}`} />
  </button>
)

// ─── CARD WRAPPER ─────────────────────────────────────────────────
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
)

// ─── COLOR PICKER FIELD COMPONENT ─────────────────────────────────
function ColorPickerField({
  label,
  value,
  onChange,
  hint,
  defaultValue = '#000000',
}: {
  label: string
  value?: string
  onChange: (val: string) => void
  hint?: string
  defaultValue?: string
}) {
  const colorVal = value || defaultValue
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition-colors">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0 shadow-xs cursor-pointer">
          <input
            type="color"
            value={colorVal}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer border-none bg-transparent"
          />
        </div>
        <input
          type="text"
          value={colorVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultValue}
          className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none uppercase tracking-wide"
        />
        <div
          className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-xs"
          style={{ backgroundColor: colorVal }}
        />
      </div>
    </div>
  )
}

// ─── PRESET PALETTES ───────────────────────────────────────────────
const PRESET_THEMES = [
  {
    name: 'Academy Cyan & Deep Navy (Modern School)',
    primary: '#0d6efd',
    secondary: '#ffc107',
    topbarBg: '#0dcaf0',
    topbarText: '#0f172a',
    navbarBg: '#132742',
    navbarText: '#ffffff',
    footerBg: '#0f172a',
    footerText: '#cbd5e1',
    headingColor: '#0f172a',
    bodyTextColor: '#475569',
    buttonTextColor: '#ffffff',
    linkColor: '#0d6efd',
    sectionAltBg: '#f8f9fa',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
  },
  {
    name: 'Royal Blue & Emerald',
    primary: '#1e40af',
    secondary: '#059669',
    topbarBg: '#0f172a',
    topbarText: '#cbd5e1',
    navbarBg: '#ffffff',
    navbarText: '#334155',
    footerBg: '#020617',
    footerText: '#94a3b8',
    headingColor: '#0f172a',
    bodyTextColor: '#475569',
    buttonTextColor: '#ffffff',
    linkColor: '#1e40af',
    sectionAltBg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
  },
  {
    name: 'Modern Indigo & Purple',
    primary: '#4F46E5',
    secondary: '#7C3AED',
    topbarBg: '#0f172a',
    topbarText: '#cbd5e1',
    navbarBg: '#ffffff',
    navbarText: '#334155',
    footerBg: '#090d16',
    footerText: '#94a3b8',
    headingColor: '#0f172a',
    bodyTextColor: '#475569',
    buttonTextColor: '#ffffff',
    linkColor: '#4F46E5',
    sectionAltBg: '#faf5ff',
    cardBg: '#ffffff',
    cardBorder: '#f3e8ff',
  },
  {
    name: 'Emerald & Forest Green',
    primary: '#059669',
    secondary: '#0d9488',
    topbarBg: '#064e3b',
    topbarText: '#a7f3d0',
    navbarBg: '#ffffff',
    navbarText: '#334155',
    footerBg: '#022c22',
    footerText: '#6ee7b7',
    headingColor: '#064e3b',
    bodyTextColor: '#374151',
    buttonTextColor: '#ffffff',
    linkColor: '#059669',
    sectionAltBg: '#f0fdf4',
    cardBg: '#ffffff',
    cardBorder: '#bbf7d0',
  },
  {
    name: 'Crimson & Burgundy',
    primary: '#be123c',
    secondary: '#881337',
    topbarBg: '#4c0519',
    topbarText: '#fecdd3',
    navbarBg: '#ffffff',
    navbarText: '#334155',
    footerBg: '#1f020a',
    footerText: '#fda4af',
    headingColor: '#1c1917',
    bodyTextColor: '#44403c',
    buttonTextColor: '#ffffff',
    linkColor: '#be123c',
    sectionAltBg: '#fff1f2',
    cardBg: '#ffffff',
    cardBorder: '#fecdd3',
  },
  {
    name: 'Midnight Dark & Violet',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    topbarBg: '#09090b',
    topbarText: '#a1a1aa',
    navbarBg: '#18181b',
    navbarText: '#f4f4f5',
    footerBg: '#09090b',
    footerText: '#71717a',
    headingColor: '#0f172a',
    bodyTextColor: '#334155',
    buttonTextColor: '#ffffff',
    linkColor: '#6366f1',
    sectionAltBg: '#f4f4f5',
    cardBg: '#ffffff',
    cardBorder: '#e4e4e7',
  },
  {
    name: 'Sunset Amber & Bronze',
    primary: '#d97706',
    secondary: '#ea580c',
    topbarBg: '#1c1917',
    topbarText: '#fde68a',
    navbarBg: '#ffffff',
    navbarText: '#334155',
    footerBg: '#0c0a09',
    footerText: '#a8a29e',
    headingColor: '#1c1917',
    bodyTextColor: '#44403c',
    buttonTextColor: '#ffffff',
    linkColor: '#d97706',
    sectionAltBg: '#fffbeb',
    cardBg: '#ffffff',
    cardBorder: '#fde68a',
  },
]

// ─── FONT OPTIONS ──────────────────────────────────────────────────
const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Inter',
  'Outfit',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Playfair Display',
  'Merriweather',
  'Lexend',
]

// ═══════════════════════════════════════════════════════════════════
// GENERAL SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════
function GeneralTab() {
  const [form, setForm] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    fetchWebsiteSettings().then(r => {
      if (r.data) setForm(r.data)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await saveWebsiteSettings(form)
    setSaving(false)
    if (res.success) {
      toast.success('Website general & theme settings saved successfully!')
      setForm(res.data)
    } else {
      toast.error(res.error || 'Failed to save settings')
    }
  }

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setForm(p => ({
      ...p,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      topbar_bg_color: preset.topbarBg,
      topbar_text_color: preset.topbarText,
      navbar_bg_color: preset.navbarBg,
      navbar_text_color: preset.navbarText,
      footer_bg_color: preset.footerBg,
      footer_text_color: preset.footerText,
      heading_color: preset.headingColor,
      body_text_color: preset.bodyTextColor,
      button_text_color: preset.buttonTextColor,
      link_color: preset.linkColor,
      section_alt_bg: preset.sectionAltBg,
      card_bg_color: preset.cardBg,
      card_border_color: preset.cardBorder,
    }))
    toast.success(`Applied "${preset.name}" palette!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-violet-600" />
        <span>Loading website settings...</span>
      </div>
    )
  }

  const slug = form.slug || ''
  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : ''

  const copyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Website link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Active theme values for live preview
  const primary = form.primary_color || '#1e40af'
  const secondary = form.secondary_color || '#059669'
  const topbarBg = form.topbar_bg_color || '#0f172a'
  const topbarText = form.topbar_text_color || '#cbd5e1'
  const navbarBg = form.navbar_bg_color || '#ffffff'
  const navbarText = form.navbar_text_color || '#334155'
  const headingColor = form.heading_color || '#0f172a'
  const bodyTextColor = form.body_text_color || '#475569'
  const buttonTextColor = form.button_text_color || '#ffffff'
  const linkColor = form.link_color || primary
  const sectionAltBg = form.section_alt_bg || '#f8fafc'
  const cardBg = form.card_bg_color || '#ffffff'
  const cardBorder = form.card_border_color || '#e2e8f0'
  const footerBg = form.footer_bg_color || '#020617'
  const footerText = form.footer_text_color || '#94a3b8'
  const fontFamily = form.font_family || 'Plus Jakarta Sans'
  const headingFont = form.heading_font_family || 'Plus Jakarta Sans'

  return (
    <div className="space-y-6">
      {/* Live URL banner */}
      {publicUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 rounded-2xl border border-violet-200 dark:border-violet-800 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 dark:text-slate-100">Live Website URL:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {form.is_published ? '● Live' : '○ Draft'}
                </span>
              </div>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-violet-600 dark:text-violet-400 hover:underline break-all">
                {publicUrl}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Website</span>
            </a>
          </div>
        </div>
      )}

      {/* ─── DEDICATED SUBPAGES QUICK ACCESS ───────────────────── */}
      {form.slug && (
        <Card className="border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900/50 dark:to-slate-800 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0d6efd]" />
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Website Separate Subpages (Direct Links)
              </h4>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Click any page below to preview it live in your browser:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: '🏠 Home', path: `/${form.slug}` },
              { label: 'ℹ️ About Us', path: `/${form.slug}/about` },
              { label: '🎓 Courses & Classes', path: `/${form.slug}/courses` },
              { label: '👨‍🏫 Teachers', path: `/${form.slug}/teachers` },
              { label: '🖼️ Campus Gallery', path: `/${form.slug}/gallery` },
              { label: '📞 Contact Us', path: `/${form.slug}/contact` },
              { label: '📢 Notice & News', path: `/${form.slug}/news` },
              { label: '📝 Online Application', path: `/${form.slug}/apply` },
              { label: '🛏️ Hostel Facilities', path: `/${form.slug}/hostel` },
              { label: '🚌 Transport Route', path: `/${form.slug}/transport` },
            ].map((p, idx) => (
              <a
                key={idx}
                href={p.path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#0d6efd] hover:text-[#0d6efd] shadow-2xs transition-all hover:scale-[1.02]"
              >
                <span>{p.label}</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* ─── LIVE THEME PREVIEW CARD ──────────────────────────── */}
      <Card className="border-2 border-violet-100 dark:border-violet-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-600" />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Live Theme Interactive Preview
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Previewing: Body Font: <strong className="text-slate-700 dark:text-slate-200">{fontFamily}</strong> • Heading Font: <strong className="text-slate-700 dark:text-slate-200">{headingFont}</strong>
          </span>
        </div>

        {/* Miniature Mockup */}
        <div
          className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
          style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        >
          {/* Mini Topbar */}
          <div
            className="px-4 py-1.5 text-[10px] flex items-center justify-between font-medium transition-colors"
            style={{ backgroundColor: topbarBg, color: topbarText }}
          >
            <span>📍 {form.contact_address || 'Campus Road'} • 📞 {form.contact_phone || '+91 99999 99999'}</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#0d6efd] text-white px-2 py-0.5 rounded text-[9px] font-bold">Login</span>
              <span className="bg-[#ffc107] text-slate-900 px-2 py-0.5 rounded text-[9px] font-bold">Apply</span>
            </div>
          </div>

          {/* Mini Navbar */}
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b border-black/5 transition-colors"
            style={{ backgroundColor: navbarBg }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full bg-white border border-red-500 flex items-center justify-center text-slate-900 text-[10px] font-black"
              >
                {(form.website_title || 'A').charAt(0)}
              </div>
              <span
                className="text-xs font-extrabold text-white truncate max-w-[160px]"
                style={{ fontFamily: `"${headingFont}", sans-serif` }}
              >
                {form.website_title || 'Cosmopolitan Inter College'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-100">
              <span className="cursor-pointer text-blue-400">Home</span>
              <span className="cursor-pointer hover:opacity-80">About</span>
              <span className="cursor-pointer hover:opacity-80">Services ▼</span>
              <span className="cursor-pointer hover:opacity-80">Teachers</span>
              <span className="cursor-pointer hover:opacity-80">Gallery</span>
              <span className="cursor-pointer hover:opacity-80">Contact</span>
            </div>
          </div>

          {/* Mini Hero Banner */}
          <div
            className="p-6 transition-colors text-white"
            style={{ background: 'linear-gradient(135deg, #132742 0%, #0d6efd 100%)' }}
          >
            <div className="max-w-md space-y-2">
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Admissions Open 2025–26
              </span>
              <h4
                className="text-base sm:text-lg font-black leading-tight text-white"
                style={{ fontFamily: `"${headingFont}", sans-serif` }}
              >
                {form.hero_tagline || 'Excellence in Academics & Innovation'}
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-200">
                {form.hero_sub_text || 'Providing exceptional academic standards and holistic student development.'}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs bg-[#ffc107] text-slate-900"
                >
                  Apply For Admission
                </button>
                <span className="text-[10px] font-bold underline text-white">
                  Learn More
                </span>
              </div>
            </div>
          </div>

          {/* Mini Blue Stats Band */}
          <div className="p-3 bg-[#0d6efd] text-white flex items-center justify-around text-center">
            <div>
              <div className="text-xs font-black text-[#ffc107]">1000+</div>
              <div className="text-[9px] uppercase font-bold text-blue-100">Students</div>
            </div>
            <div>
              <div className="text-xs font-black text-[#ffc107]">25+</div>
              <div className="text-[9px] uppercase font-bold text-blue-100">Teachers</div>
            </div>
            <div>
              <div className="text-xs font-black text-[#ffc107]">100%</div>
              <div className="text-[9px] uppercase font-bold text-blue-100">Result</div>
            </div>
            <div>
              <div className="text-xs font-black text-[#ffc107]">20+</div>
              <div className="text-[9px] uppercase font-bold text-blue-100">Classrooms</div>
            </div>
          </div>

          {/* Mini Footer */}
          <div
            className="px-4 py-2.5 text-[10px] flex items-center justify-between transition-colors border-t border-black/10"
            style={{ backgroundColor: footerBg, color: footerText }}
          >
            <span>© 2026 {form.website_title || 'Academy'}. All Rights Reserved.</span>
            <span style={{ color: primary }}>Powered by Academy Setu</span>
          </div>
        </div>
      </Card>

      {/* ─── 1-CLICK THEME PRESETS ────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            1-Click Theme Palettes
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Quickly apply professionally matched color palettes across all sections:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_THEMES.map((preset) => {
            const isMatch = form.primary_color === preset.primary && form.secondary_color === preset.secondary
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isMatch
                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30 ring-2 ring-violet-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{preset.name}</span>
                    {isMatch && <Check className="w-3.5 h-3.5 text-violet-600" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.primary }} />
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.secondary }} />
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.topbarBg }} />
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.footerBg }} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-2 py-1 rounded-md">
                  Apply
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* ─── BRAND & NAVIGATION COLORS ───────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-violet-600" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Brand & Header Colors
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorPickerField
            label="Primary Brand Color"
            hint="Buttons, badges, gradients"
            value={form.primary_color}
            onChange={(v) => set('primary_color', v)}
            defaultValue="#1e40af"
          />
          <ColorPickerField
            label="Secondary Brand Color"
            hint="Gradient endings"
            value={form.secondary_color}
            onChange={(v) => set('secondary_color', v)}
            defaultValue="#059669"
          />
          <ColorPickerField
            label="Link & Accent Color"
            hint="Hyperlinks, icons"
            value={form.link_color}
            onChange={(v) => set('link_color', v)}
            defaultValue="#1e40af"
          />
          <ColorPickerField
            label="Button Text Color"
            hint="Admissions button text"
            value={form.button_text_color}
            onChange={(v) => set('button_text_color', v)}
            defaultValue="#ffffff"
          />
          <ColorPickerField
            label="Top Bar Background"
            hint="Contact banner background"
            value={form.topbar_bg_color}
            onChange={(v) => set('topbar_bg_color', v)}
            defaultValue="#0f172a"
          />
          <ColorPickerField
            label="Top Bar Text Color"
            hint="Phone, email banner text"
            value={form.topbar_text_color}
            onChange={(v) => set('topbar_text_color', v)}
            defaultValue="#cbd5e1"
          />
          <ColorPickerField
            label="Main Navbar Background"
            hint="Sticky navigation bar"
            value={form.navbar_bg_color}
            onChange={(v) => set('navbar_bg_color', v)}
            defaultValue="#ffffff"
          />
          <ColorPickerField
            label="Main Navbar Text Color"
            hint="Menu navigation links"
            value={form.navbar_text_color}
            onChange={(v) => set('navbar_text_color', v)}
            defaultValue="#334155"
          />
        </div>
      </Card>

      {/* ─── TYPOGRAPHY & FONT CUSTOMIZATION ──────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Type className="w-4 h-4 text-violet-600" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Typography & Font Styling
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Body Font Family">
            <select
              className={inp}
              value={form.font_family || 'Plus Jakarta Sans'}
              onChange={(e) => set('font_family', e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Heading Font Family">
            <select
              className={inp}
              value={form.heading_font_family || 'Plus Jakarta Sans'}
              onChange={(e) => set('heading_font_family', e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <ColorPickerField
            label="Heading Text Color"
            hint="H1, H2, titles"
            value={form.heading_color}
            onChange={(v) => set('heading_color', v)}
            defaultValue="#0f172a"
          />
          <ColorPickerField
            label="Body Text Color"
            hint="Paragraphs, descriptions"
            value={form.body_text_color}
            onChange={(v) => set('body_text_color', v)}
            defaultValue="#475569"
          />
        </div>
      </Card>

      {/* ─── CARDS, BACKGROUNDS & FOOTER ───────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <LayoutDashboard className="w-4 h-4 text-violet-600" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Sections, Cards & Footer Colors
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ColorPickerField
            label="Section Alt Background"
            hint="Stats, FAQs, reviews bg"
            value={form.section_alt_bg}
            onChange={(v) => set('section_alt_bg', v)}
            defaultValue="#f8fafc"
          />
          <ColorPickerField
            label="Card Background Color"
            hint="Course & review cards"
            value={form.card_bg_color}
            onChange={(v) => set('card_bg_color', v)}
            defaultValue="#ffffff"
          />
          <ColorPickerField
            label="Card Border Color"
            hint="Outlines of cards"
            value={form.card_border_color}
            onChange={(v) => set('card_border_color', v)}
            defaultValue="#e2e8f0"
          />
          <ColorPickerField
            label="Footer Background"
            hint="Bottom footer section"
            value={form.footer_bg_color}
            onChange={(v) => set('footer_bg_color', v)}
            defaultValue="#020617"
          />
          <ColorPickerField
            label="Footer Text Color"
            hint="Footer links & copy"
            value={form.footer_text_color}
            onChange={(v) => set('footer_text_color', v)}
            defaultValue="#94a3b8"
          />
        </div>
      </Card>

      {/* ─── GENERAL INFO ─────────────────────────────────────── */}
      <Card>
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
          General Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Website Title / Browser Tab Title">
            <input
              className={inp}
              placeholder="e.g. ABC School — Excellence in Education"
              value={form.website_title || ''}
              onChange={e => set('website_title', e.target.value)}
            />
          </Field>
          <Field label="Website Slug (URL)">
            <div className="relative">
              <input
                className={inp + ' pr-24'}
                placeholder="abc-school"
                value={form.slug || ''}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
              {slug && (
                <a
                  href={`/${slug}`}
                  target="_blank"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" /> Preview
                </a>
              )}
            </div>
          </Field>
          <Field label="Contact Email">
            <input
              type="email"
              className={inp}
              placeholder="info@school.com"
              value={form.contact_email || ''}
              onChange={e => set('contact_email', e.target.value)}
            />
          </Field>
          <Field label="Contact Phone">
            <input
              className={inp}
              placeholder="+91 99999 99999"
              value={form.contact_phone || ''}
              onChange={e => set('contact_phone', e.target.value)}
            />
          </Field>
          <Field label="Contact Address">
            <textarea
              className={txa}
              placeholder="Full address..."
              value={form.contact_address || ''}
              onChange={e => set('contact_address', e.target.value)}
            />
          </Field>
          <Field label="Google Maps Embed Link">
            <input
              className={inp}
              placeholder="https://maps.google.com/..."
              value={form.google_map_link || ''}
              onChange={e => set('google_map_link', e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* ─── HERO SECTION ─────────────────────────────────────── */}
      <Card>
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
          Hero Section (Taglines)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Hero Tagline">
            <input
              className={inp}
              placeholder="Shaping Future Leaders"
              value={form.hero_tagline || ''}
              onChange={e => set('hero_tagline', e.target.value)}
            />
          </Field>
          <Field label="Hero Sub Text">
            <input
              className={inp}
              placeholder="A premier institution..."
              value={form.hero_sub_text || ''}
              onChange={e => set('hero_sub_text', e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* ─── ABOUT SECTION ────────────────────────────────────── */}
      <Card>
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
          About Us Section
        </h3>
        <div className="space-y-4">
          <Field label="About Us Text">
            <textarea
              className={txa}
              placeholder="Describe your institution..."
              value={form.about_text || ''}
              onChange={e => set('about_text', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Our Vision">
              <textarea
                className={txa}
                placeholder="Our vision..."
                value={form.about_vision || ''}
                onChange={e => set('about_vision', e.target.value)}
              />
            </Field>
            <Field label="Our Mission">
              <textarea
                className={txa}
                placeholder="Our mission..."
                value={form.about_mission || ''}
                onChange={e => set('about_mission', e.target.value)}
              />
            </Field>
          </div>
          <Field label="About Section Image URL (Optional campus/building photo)">
            <div className="flex items-center gap-3">
              <input
                className={inp + ' flex-1'}
                placeholder="https://images.unsplash.com/..."
                value={form.about_image_url || ''}
                onChange={e => set('about_image_url', e.target.value)}
              />
              {form.about_image_url && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={form.about_image_url} alt="About preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </Field>
        </div>
      </Card>

      {/* ─── BRANDING LOGO & FAVICON ──────────────────────────── */}
      <Card>
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
          Logo & Branding Assets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Logo Image URL">
            <div className="flex items-center gap-3">
              <input
                className={inp + ' flex-1'}
                placeholder="https://..."
                value={form.logo_url || ''}
                onChange={e => set('logo_url', e.target.value)}
              />
              {form.logo_url && (
                <div className="w-11 h-11 rounded-xl p-1 bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </Field>
          <Field label="Favicon Image URL">
            <div className="flex items-center gap-3">
              <input
                className={inp + ' flex-1'}
                placeholder="https://..."
                value={form.favicon_url || ''}
                onChange={e => set('favicon_url', e.target.value)}
              />
              {form.favicon_url && (
                <div className="w-8 h-8 rounded-lg p-1 bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center">
                  <img src={form.favicon_url} alt="Favicon" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </Field>
        </div>
      </Card>

      {/* ─── SOCIAL LINKS ─────────────────────────────────────── */}
      <Card>
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-5">
          Social Media Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            ['Facebook', 'social_facebook'],
            ['Instagram', 'social_instagram'],
            ['Twitter / X', 'social_twitter'],
            ['YouTube', 'social_youtube'],
            ['LinkedIn', 'social_linkedin'],
          ].map(([label, key]) => (
            <Field key={key} label={label}>
              <input
                className={inp}
                placeholder="https://..."
                value={form[key] || ''}
                onChange={e => set(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* ─── PUBLISH TOGGLE ───────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">Publish Website</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${form.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'}`}>
                {form.is_published ? 'Live' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Make your website publicly accessible at the slug URL without any login requirements
            </p>
          </div>
          <Toggle value={!!form.is_published} onChange={v => set('is_published', v)} />
        </div>
      </Card>

      {/* ─── SAVE BUTTON ──────────────────────────────────────── */}
      <div className="flex justify-end sticky bottom-4 z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-violet-500/25 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SLIDERS TAB
// ═══════════════════════════════════════════════════════════════════
function SlidersTab({ slug, hideHeader = false }: { slug?: string; hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => {
    const r = await fetchSliders(); setItems(r.data || []); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const res = await saveSlider(form)
    if (res.success) { toast.success('Slider saved!'); setForm({}); setEditing(null); load() }
    else toast.error(res.error)
  }
  const handleDelete = async (id: number) => {
    if (!confirm('Delete slider?')) return
    await deleteSlider(id); toast.success('Deleted'); load()
  }
  const handleEdit = (item: any) => { setForm(item); setEditing(item.id) }
  const handleNew = () => { setForm({}); setEditing(0) }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Hero Sliders ({items.length})</h3>
            <p className="text-xs text-slate-400">Hero banners shown on the top of the homepage</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview on Website
              </a>
            )}
            <button onClick={handleNew} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Slider
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Carousel Slides List ({items.length})</span>
          <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Slide
          </button>
        </div>
      )}

      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 dark:text-violet-400 uppercase">{editing === 0 ? 'New Slider' : 'Edit Slider'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title"><input className={inp} placeholder="Welcome to..." value={form.title || ''} onChange={e => set('title', e.target.value)} /></Field>
            <Field label="Sub Title"><input className={inp} placeholder="Subtitle..." value={form.sub_title || ''} onChange={e => set('sub_title', e.target.value)} /></Field>
            <Field label="Image URL"><input className={inp} placeholder="https://..." value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} /></Field>
            <Field label="CTA Button Text"><input className={inp} placeholder="Apply Now" value={form.cta_text || ''} onChange={e => set('cta_text', e.target.value)} /></Field>
            <Field label="CTA Link"><input className={inp} placeholder="https://..." value={form.cta_link || ''} onChange={e => set('cta_link', e.target.value)} /></Field>
            <Field label="Sort Order"><input type="number" className={inp} value={form.sort_order ?? 0} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Toggle value={!!form.is_active} onChange={v => set('is_active', v)} /> Active
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      {loading ? <div className="p-8 text-center text-slate-400 text-xs"><RefreshCw className="w-4 h-4 animate-spin mx-auto" /></div> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.id} className="relative">
              {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded-xl mb-3" />}
              <p className="text-xs font-black text-slate-800 dark:text-slate-100">{item.title || '—'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.sub_title}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════════════════
function StatsTab({ slug, hideHeader = false }: { slug?: string; hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const ICONS = ['users', 'award', 'book-open', 'star', 'trending-up', 'check-circle', 'globe', 'heart']

  const load = useCallback(async () => { const r = await fetchStats(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const res = await saveStat(form)
    if (res.success) { toast.success('Stat saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error)
  }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteStat(id); load() }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Statistics / Achievements</h3>
            <p className="text-xs text-slate-400">Milestones displayed in the counters section</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview on Website
              </a>
            )}
            <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Stat</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Milestones & Numbers List ({items.length})</span>
          <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Stat
          </button>
        </div>
      )}

      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New Stat' : 'Edit Stat'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Label"><input className={inp} placeholder="Students Enrolled" value={form.label || ''} onChange={e => set('label', e.target.value)} /></Field>
            <Field label="Value"><input className={inp} placeholder="5000+" value={form.value || ''} onChange={e => set('value', e.target.value)} /></Field>
            <Field label="Icon">
              <select className={inp} value={form.icon || 'users'} onChange={e => set('icon', e.target.value)}>
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.id} className="text-center">
            <p className="text-2xl font-black text-violet-600">{item.value}</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">{item.label}</p>
            <div className="flex justify-center gap-2 mt-3">
              <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COURSES TAB
// ═══════════════════════════════════════════════════════════════════
function CoursesTab({ slug, hideHeader = false }: { slug?: string; hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchCourses(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const res = await saveCourse(form)
    if (res.success) { toast.success('Course saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error)
  }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteCourse(id); load() }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Courses Offered ({items.length})</h3>
            <p className="text-xs text-slate-400">Academic courses and classes with curriculum details and fees</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}/courses`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Courses Page
              </a>
            )}
            <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Course</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Courses & Programs List ({items.length})</span>
          <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Course
          </button>
        </div>
      )}

      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New Course' : 'Edit Course'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Course Title"><input className={inp} placeholder="B.Sc Computer Science" value={form.title || ''} onChange={e => set('title', e.target.value)} /></Field>
            <Field label="Category"><input className={inp} placeholder="Science / Commerce / Arts" value={form.category || ''} onChange={e => set('category', e.target.value)} /></Field>
            <Field label="Duration"><input className={inp} placeholder="3 Years" value={form.duration || ''} onChange={e => set('duration', e.target.value)} /></Field>
            <Field label="Fees"><input className={inp} placeholder="₹50,000 / Year" value={form.fees || ''} onChange={e => set('fees', e.target.value)} /></Field>
            <div className="md:col-span-2"><Field label="Description"><textarea className={txa} placeholder="Course description..." value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field></div>
            <div className="md:col-span-2"><Field label="Image URL"><input className={inp} placeholder="https://..." value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} /></Field></div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Toggle value={!!form.is_active} onChange={v => set('is_active', v)} /> Active</div>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id}>
            {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-28 object-cover rounded-xl mb-3" />}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2 py-0.5">{item.category || 'General'}</span>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1.5">{item.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.duration} • {item.fees}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {slug && (
                  <a
                    href={`/${slug}/courses/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Course Page"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/40"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FAQS TAB
// ═══════════════════════════════════════════════════════════════════
function FaqsTab() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchFaqs(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])
  const handleSave = async () => { const res = await saveFaq(form); if (res.success) { toast.success('FAQ saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error) }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteFaq(id); load() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">FAQs</h3>
        <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add FAQ</button>
      </div>
      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New FAQ' : 'Edit FAQ'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="space-y-3">
            <Field label="Question"><input className={inp} placeholder="What are the admission criteria?" value={form.question || ''} onChange={e => set('question', e.target.value)} /></Field>
            <Field label="Answer"><textarea className={txa} placeholder="The answer..." value={form.answer || ''} onChange={e => set('answer', e.target.value)} /></Field>
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button></div>
        </Card>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={item.id}>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{item.question}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TESTIMONIALS TAB
// ═══════════════════════════════════════════════════════════════════
function TestimonialsTab({ hideHeader = false }: { hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchTestimonials(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])
  const handleSave = async () => { const res = await saveTestimonial(form); if (res.success) { toast.success('Testimonial saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error) }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteTestimonial(id); load() }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Testimonials</h3>
          <button onClick={() => { setForm({ rating: 5 }); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add</button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Parent & Student Reviews ({items.length})</span>
          <button onClick={() => { setForm({ rating: 5 }); setEditing(0) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </button>
        </div>
      )}
      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New Testimonial' : 'Edit'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Student Name"><input className={inp} placeholder="Rahul Sharma" value={form.student_name || ''} onChange={e => set('student_name', e.target.value)} /></Field>
            <Field label="Designation / Class"><input className={inp} placeholder="Class 10 Alumnus" value={form.designation || ''} onChange={e => set('designation', e.target.value)} /></Field>
            <Field label="Rating (1-5)"><input type="number" min={1} max={5} className={inp} value={form.rating ?? 5} onChange={e => set('rating', Number(e.target.value))} /></Field>
            <Field label="Photo URL"><input className={inp} placeholder="https://..." value={form.photo_url || ''} onChange={e => set('photo_url', e.target.value)} /></Field>
            <div className="md:col-span-2"><Field label="Message"><textarea className={txa} placeholder="This school transformed my life..." value={form.message || ''} onChange={e => set('message', e.target.value)} /></Field></div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Toggle value={!!form.is_active} onChange={v => set('is_active', v)} /> Active</div>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id}>
            <div className="flex items-center gap-3 mb-3">
              {item.photo_url ? <img src={item.photo_url} className="w-10 h-10 rounded-full object-cover border-2 border-violet-200" alt={item.student_name} /> : <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-sm">{item.student_name?.[0]}</div>}
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{item.student_name}</p>
                <p className="text-[10px] text-slate-400">{item.designation}</p>
                <div className="flex gap-0.5 mt-0.5">{Array.from({ length: item.rating || 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic leading-relaxed">"{item.message}"</p>
            <div className="flex justify-end gap-1 mt-3">
              <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BLOGS TAB
// ═══════════════════════════════════════════════════════════════════
function BlogsTab({ slug, hideHeader = false }: { slug?: string; hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchBlogs(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])
  const handleSave = async () => { const res = await saveBlog(form); if (res.success) { toast.success('Post saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error) }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteBlog(id); load() }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Notice Board & News ({items.length})</h3>
            <p className="text-xs text-slate-400">School circulars, notices, and exam announcements</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}/news`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Notice Page
              </a>
            )}
            <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Post</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Notices & News Circulars ({items.length})</span>
          <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Notice
          </button>
        </div>
      )}
      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New Post' : 'Edit Post'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Field label="Title"><input className={inp} placeholder="Post title..." value={form.title || ''} onChange={e => set('title', e.target.value)} /></Field></div>
            <Field label="Author"><input className={inp} placeholder="Admin" value={form.author || ''} onChange={e => set('author', e.target.value)} /></Field>
            <Field label="Cover Image URL"><input className={inp} placeholder="https://..." value={form.cover_image_url || ''} onChange={e => set('cover_image_url', e.target.value)} /></Field>
            <div className="md:col-span-2"><Field label="Excerpt (Short Description)"><textarea className={txa} placeholder="Brief summary..." value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} /></Field></div>
            <div className="md:col-span-2"><Field label="Content (Full Article)"><textarea className={txa + ' !min-h-[120px]'} placeholder="Full content..." value={form.content || ''} onChange={e => set('content', e.target.value)} /></Field></div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Toggle value={!!form.is_published} onChange={v => set('is_published', v)} /> Published</div>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <Card key={item.id} className="flex gap-3">
            {item.cover_image_url && <img src={item.cover_image_url} className="w-24 h-24 object-cover rounded-xl shrink-0" alt={item.title} />}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{item.is_published ? 'Published' : 'Draft'}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1.5">{item.title}</p>
                  <p className="text-[10px] text-slate-400">By {item.author}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {slug && (
                    <a
                      href={`/${slug}/news/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Notice Page"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-600"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// GALLERY TAB
// ═══════════════════════════════════════════════════════════════════
function GalleryTab({ slug, hideHeader = false }: { slug?: string; hideHeader?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchGallery(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])
  const handleSave = async () => { const res = await saveGalleryItem(form); if (res.success) { toast.success('Image added!'); setForm({}); setEditing(null); load() } else toast.error(res.error) }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteGalleryItem(id); load() }

  return (
    <div className="space-y-4">
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Gallery ({items.length} images)</h3>
            <p className="text-xs text-slate-400">Photos of school events, sports, and campus activities</p>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}/gallery`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Gallery Page
              </a>
            )}
            <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Image</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500">Campus Photos ({items.length})</span>
          <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Photo
          </button>
        </div>
      )}
      {editing !== null && (
        <Card className="border-violet-300 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-violet-700 uppercase">{editing === 0 ? 'New Image' : 'Edit Image'}</h4>
            <button onClick={() => { setEditing(null); setForm({}) }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><Field label="Image URL"><input className={inp} placeholder="https://..." value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} /></Field></div>
            <Field label="Category"><input className={inp} placeholder="Events, Sports, Labs..." value={form.category || ''} onChange={e => set('category', e.target.value)} /></Field>
            <div className="md:col-span-2"><Field label="Caption"><input className={inp} placeholder="Image caption..." value={form.caption || ''} onChange={e => set('caption', e.target.value)} /></Field></div>
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"><Save className="w-4 h-4" /> Save</button></div>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square">
            <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <p className="text-white text-[10px] font-bold text-center px-2">{item.caption}</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm(item); setEditing(item.id) }} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center bg-red-500/80 hover:bg-red-600 rounded-full text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ENQUIRIES TAB
// ═══════════════════════════════════════════════════════════════════
function EnquiriesTab({ slug }: { slug?: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    fetchEnquiries().then(r => { setItems(r.data || []); setLoading(false) })
  }, [])

  useEffect(() => { reload() }, [reload])

  const handleStatusChange = async (id: number, status: string) => {
    const res = await updateEnquiryStatus(id, status)
    if (res.success) {
      toast.success('Status updated!')
      setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item))
    } else {
      toast.error(res.error || 'Failed to update')
    }
  }

  if (loading) return <div className="flex items-center gap-2 p-8 text-slate-400 text-xs"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Admission & Contact Enquiries</h2>
          <p className="text-xs text-slate-400">Leads and enquiries submitted from your public website</p>
        </div>
        <div className="flex items-center gap-2">
          {slug && (
            <>
              <a
                href={`/${slug}/contact`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Contact Form
              </a>
              <a
                href={`/${slug}/apply`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#0d6efd] rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Application Form
              </a>
            </>
          )}
          <button onClick={reload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-xs">
          No enquiries received yet. When visitors submit the enquiry form on your website, they will appear here.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
                  {item.course_name && (
                    <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[11px] font-bold">
                      {item.course_name}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'admitted' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-violet-600 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-violet-500" /> {item.phone}
                  </a>
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-violet-600">
                      <Mail className="w-3.5 h-3.5 text-violet-500" /> {item.email}
                    </a>
                  )}
                  <span>Submitted: {new Date(item.created_at).toLocaleString()}</span>
                </div>
                {item.message && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl mt-2">
                    "{item.message}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.status || 'pending'}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION VISIBILITY HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════
function SectionVisibilityHeader({
  title,
  subtitle,
  icon: Icon,
  sectionKey,
  visibility,
  onToggle,
  badge,
}: {
  title: string
  subtitle?: string
  icon?: any
  sectionKey: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
  badge?: string
}) {
  const isVisible = visibility[sectionKey] !== false
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isVisible 
        ? 'bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-2xs' 
        : 'bg-slate-100/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isVisible ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{title}</h4>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto bg-white dark:bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className={`text-xs font-bold flex items-center gap-1.5 ${
            isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}>
            {isVisible ? (
              <><Eye className="w-3.5 h-3.5 text-emerald-500" /> Visible on Website</>
            ) : (
              <><EyeOff className="w-3.5 h-3.5 text-slate-400" /> Hidden from Website</>
            )}
          </span>
          <Toggle value={isVisible} onChange={(val) => onToggle(sectionKey, val)} />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 1. HOME PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function HomePageTab({
  slug,
  visibility,
  onToggle,
  pageContent,
  onSaveContent,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
  pageContent: Record<string, any>
  onSaveContent: (updates: Record<string, any>) => void
}) {
  const [aboutTitle, setAboutTitle] = useState(pageContent.home_about_title || '')
  const [aboutDesc, setAboutDesc] = useState(pageContent.home_about_desc || '')

  useEffect(() => {
    setAboutTitle(pageContent.home_about_title || '')
    setAboutDesc(pageContent.home_about_desc || '')
  }, [pageContent])

  const homeSections = [
    { key: 'home_sliders', label: 'Hero Banner Sliders', icon: Image, desc: 'Rotating carousel banner on top' },
    { key: 'home_about', label: 'About College Teaser', icon: Info, desc: 'Introductory snippet & vision highlight' },
    { key: 'home_stats', label: 'Key Statistics Counter', icon: BarChart2, desc: 'Students, faculty, and pass rates' },
    { key: 'home_courses', label: 'Featured Courses', icon: BookOpen, desc: 'Popular classes & programs grid' },
    { key: 'home_teachers', label: 'Teachers Showcase', icon: Users, desc: 'Faculty members spotlight' },
    { key: 'home_gallery', label: 'Campus Life Gallery', icon: Camera, desc: 'Selected campus photos' },
    { key: 'home_blogs', label: 'Notice & News Feed', icon: FileText, desc: 'Recent school circulars' },
    { key: 'home_testimonials', label: 'Student Reviews', icon: Star, desc: 'Testimonials carousel' },
    { key: 'home_contact', label: 'Quick Contact & Map', icon: Phone, desc: 'Campus location & enquiry callout' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Home Page (Landing /)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">9 Content Sections</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Toggle visibility and manage the content of each section on your home landing page.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Home Page
          </a>
        )}
      </div>

      {/* Quick Section Switchboard */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Section Visibility Switchboard
            </h3>
            <p className="text-[11px] text-slate-400">Quickly toggle which sections appear on the home landing page</p>
          </div>
          <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
            {homeSections.filter(s => visibility[s.key] !== false).length} of {homeSections.length} Visible
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {homeSections.map((sec) => {
            const isVisible = visibility[sec.key] !== false
            return (
              <div
                key={sec.key}
                onClick={() => onToggle(sec.key, !isVisible)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isVisible
                    ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/50 text-slate-800 dark:text-slate-100'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <sec.icon className={`w-4 h-4 shrink-0 ${isVisible ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">{sec.label}</span>
                </div>
                <Toggle value={isVisible} onChange={(val) => onToggle(sec.key, val)} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* SECTION 1: HERO SLIDERS */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="1. Hero Carousel Sliders"
          subtitle="Top banner with rotating imagery, headline titles, and call-to-action buttons"
          icon={Image}
          sectionKey="home_sliders"
          visibility={visibility}
          onToggle={onToggle}
          badge="Top Hero"
        />
        {visibility.home_sliders !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <SlidersTab slug={slug} hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 2: ABOUT SNAPSHOT */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="2. About Institution Snapshot"
          subtitle="Brief introduction, school overview, and direct link to the About Us page"
          icon={Info}
          sectionKey="home_about"
          visibility={visibility}
          onToggle={onToggle}
          badge="Story"
        />
        {visibility.home_about !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Home About Heading">
                <input
                  className={inp}
                  placeholder="e.g. Empowering Students For Tomorrow's World"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Home About Teaser Paragraph">
                  <textarea
                    className={txa}
                    placeholder="Brief description that will appear on the landing page..."
                    value={aboutDesc}
                    onChange={(e) => setAboutDesc(e.target.value)}
                  />
                </Field>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onSaveContent({ home_about_title: aboutTitle, home_about_desc: aboutDesc })}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save About Snippet
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 3: KEY STATISTICS */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="3. Key Statistics Counters"
          subtitle="Animated counters showcasing student count, faculty, pass rate, and achievements"
          icon={BarChart2}
          sectionKey="home_stats"
          visibility={visibility}
          onToggle={onToggle}
          badge="Counters"
        />
        {visibility.home_stats !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <StatsTab slug={slug} hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 4: COURSES & CLASSES */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="4. Featured Academic Courses"
          subtitle="Display top academic streams, classes, and special programs on the home page"
          icon={BookOpen}
          sectionKey="home_courses"
          visibility={visibility}
          onToggle={onToggle}
          badge="Curriculum"
        />
        {visibility.home_courses !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <CoursesTab slug={slug} hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 5: TEACHERS SPOTLIGHT */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="5. Faculty & Mentors Showcase"
          subtitle="Highlight experienced teachers and subject heads on the home page"
          icon={Users}
          sectionKey="home_teachers"
          visibility={visibility}
          onToggle={onToggle}
          badge="Faculty"
        />
        {visibility.home_teachers !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <span>Teachers are automatically fetched from your active Employee records with designation 'Teacher' or 'Faculty'.</span>
              {slug && (
                <a
                  href={`/${slug}/teachers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-bold text-violet-600 hover:text-violet-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Faculty Page
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 6: CAMPUS GALLERY */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="6. Campus Life Gallery Highlights"
          subtitle="Display recent photos from school functions, sports, and science labs"
          icon={Camera}
          sectionKey="home_gallery"
          visibility={visibility}
          onToggle={onToggle}
          badge="Photos"
        />
        {visibility.home_gallery !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <GalleryTab slug={slug} hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 7: NOTICE & NEWS */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="7. Notice Board & News Feed"
          subtitle="Display exam circulars, holiday announcements, and event highlights"
          icon={FileText}
          sectionKey="home_blogs"
          visibility={visibility}
          onToggle={onToggle}
          badge="Notices"
        />
        {visibility.home_blogs !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <BlogsTab slug={slug} hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 8: TESTIMONIALS */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="8. Student & Parent Testimonials"
          subtitle="Display reviews, alumni achievements, and parent feedback"
          icon={Star}
          sectionKey="home_testimonials"
          visibility={visibility}
          onToggle={onToggle}
          badge="Reviews"
        />
        {visibility.home_testimonials !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <TestimonialsTab hideHeader />
          </div>
        )}
      </Card>

      {/* SECTION 9: QUICK CONTACT */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="9. Quick Contact & Map Teaser"
          subtitle="Direct contact card with institution phone number, address, and quick link"
          icon={Phone}
          sectionKey="home_contact"
          visibility={visibility}
          onToggle={onToggle}
          badge="Contact"
        />
        {visibility.home_contact !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <span>The quick contact card displays your primary contact number, email, and address from General Settings.</span>
              {slug && (
                <a
                  href={`/${slug}/contact`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-bold text-violet-600 hover:text-violet-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Contact Page
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 2. ABOUT PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function AboutPageTab({
  slug,
  visibility,
  onToggle,
  pageContent,
  onSaveContent,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
  pageContent: Record<string, any>
  onSaveContent: (updates: Record<string, any>) => void
}) {
  const [form, setForm] = useState({
    about_intro_title: pageContent.about_intro_title || '',
    about_intro_text: pageContent.about_intro_text || '',
    about_vision_text: pageContent.about_vision_text || '',
    about_mission_text: pageContent.about_mission_text || '',
    principal_name: pageContent.principal_name || '',
    principal_title: pageContent.principal_title || '',
    principal_photo: pageContent.principal_photo || '',
    principal_message: pageContent.principal_message || '',
  })

  useEffect(() => {
    setForm({
      about_intro_title: pageContent.about_intro_title || '',
      about_intro_text: pageContent.about_intro_text || '',
      about_vision_text: pageContent.about_vision_text || '',
      about_mission_text: pageContent.about_mission_text || '',
      principal_name: pageContent.principal_name || '',
      principal_title: pageContent.principal_title || '',
      principal_photo: pageContent.principal_photo || '',
      principal_message: pageContent.principal_message || '',
    })
  }, [pageContent])

  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">About Page (/about)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize your institution's history, vision, mission, and principal's message with hide/show toggles.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/about`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live About Page
          </a>
        )}
      </div>

      {/* SECTION 1: MAIN STORY */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="1. Main Institution Story & Introduction"
          subtitle="Detailed overview of the institution foundation, ethos, and history"
          icon={BookOpen}
          sectionKey="about_main"
          visibility={visibility}
          onToggle={onToggle}
          badge="History"
        />
        {visibility.about_main !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <Field label="Page Main Heading">
              <input
                className={inp}
                placeholder="e.g. Dedicated to Academic Excellence & Holistic Growth"
                value={form.about_intro_title}
                onChange={e => setField('about_intro_title', e.target.value)}
              />
            </Field>
            <Field label="Our Story & Foundation Text">
              <textarea
                className={txa + " min-h-[110px]"}
                placeholder="Describe your school's history, values, and environment..."
                value={form.about_intro_text}
                onChange={e => setField('about_intro_text', e.target.value)}
              />
            </Field>
          </div>
        )}
      </Card>

      {/* SECTION 2: VISION & MISSION */}
      <Card className="space-y-4">
        <div className="space-y-3">
          <SectionVisibilityHeader
            title="2A. Vision Statement Card"
            subtitle="Display institution's long-term vision for learners"
            icon={Sparkles}
            sectionKey="about_vision"
            visibility={visibility}
            onToggle={onToggle}
            badge="Vision"
          />
          {visibility.about_vision !== false && (
            <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
              <Field label="Our Vision Statement">
                <textarea
                  className={txa}
                  placeholder="To nurture resilient global citizens equipped with intellectual excellence..."
                  value={form.about_vision_text}
                  onChange={e => setField('about_vision_text', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <SectionVisibilityHeader
            title="2B. Mission Statement Card"
            subtitle="Display core daily educational commitments"
            icon={Award}
            sectionKey="about_mission"
            visibility={visibility}
            onToggle={onToggle}
            badge="Mission"
          />
          {visibility.about_mission !== false && (
            <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
              <Field label="Our Mission Statement">
                <textarea
                  className={txa}
                  placeholder="Provide learner-centric pedagogy, world-class athletic facilities, and ethical grounding..."
                  value={form.about_mission_text}
                  onChange={e => setField('about_mission_text', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 3: PRINCIPAL'S DESK */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="3. Principal's / Director's Desk & Message"
          subtitle="Display greeting from the head of the institution with portrait photo"
          icon={GraduationCap}
          sectionKey="about_principal"
          visibility={visibility}
          onToggle={onToggle}
          badge="Leadership"
        />
        {visibility.about_principal !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Principal / Director Name">
                <input
                  className={inp}
                  placeholder="Dr. Anand Verma, Ph.D."
                  value={form.principal_name}
                  onChange={e => setField('principal_name', e.target.value)}
                />
              </Field>
              <Field label="Designation / Credentials">
                <input
                  className={inp}
                  placeholder="Principal & Academic Director"
                  value={form.principal_title}
                  onChange={e => setField('principal_title', e.target.value)}
                />
              </Field>
              <Field label="Portrait Image URL">
                <input
                  className={inp}
                  placeholder="https://..."
                  value={form.principal_photo}
                  onChange={e => setField('principal_photo', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Principal's Message Quote">
              <textarea
                className={txa + " min-h-[100px]"}
                placeholder="Welcome to our institution. Every child who enters our campus carries boundless potential..."
                value={form.principal_message}
                onChange={e => setField('principal_message', e.target.value)}
              />
            </Field>
          </div>
        )}
      </Card>

      {/* SECTION 4: STATS ON ABOUT */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="4. Statistics & Milestones Counter"
          subtitle="Display achievement counters (total students, faculty, pass rate) on the About page"
          icon={BarChart2}
          sectionKey="about_stats"
          visibility={visibility}
          onToggle={onToggle}
          badge="Metrics"
        />
        {visibility.about_stats !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Counters use data configured in your Key Statistics manager.
            </p>
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSaveContent(form)}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
        >
          <Save className="w-4 h-4" /> Save About Page Content
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 3. COURSES PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function CoursesPageTab({
  slug,
  visibility,
  onToggle,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Courses & Classes (/courses)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage academic programs, classes, syllabus highlights, and customize which details are visible.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/courses`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Courses Page
          </a>
        )}
      </div>

      {/* Subpage Display Options */}
      <Card className="p-5">
        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-violet-600" /> Course Card Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Course Fees</span>
              <span className="text-[10px] text-slate-400">Display annual / monthly tuition</span>
            </div>
            <Toggle value={visibility.courses_fees !== false} onChange={val => onToggle('courses_fees', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Duration & Grade</span>
              <span className="text-[10px] text-slate-400">Display class eligibility level</span>
            </div>
            <Toggle value={visibility.courses_duration !== false} onChange={val => onToggle('courses_duration', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">"Apply Online" Button</span>
              <span className="text-[10px] text-slate-400">Link directly to admission form</span>
            </div>
            <Toggle value={visibility.courses_apply !== false} onChange={val => onToggle('courses_apply', val)} />
          </div>
        </div>
      </Card>

      {/* Courses Manager */}
      <Card className="p-6">
        <CoursesTab slug={slug} hideHeader={false} />
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 4. TEACHERS PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function TeachersPageTab({
  slug,
  visibility,
  onToggle,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
}) {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadTeachers = useCallback(async () => {
    setLoading(true)
    const res = await fetchTeachersList()
    setTeachers(res.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTeachers()
  }, [loadTeachers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Teachers / Faculty (/teachers)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showcase your qualified faculty members, their educational backgrounds, and subject specializations.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/teachers`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Faculty Page
          </a>
        )}
      </div>

      {/* Display Controls */}
      <Card className="p-5">
        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-violet-600" /> Faculty Card Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Experience Badge</span>
              <span className="text-[10px] text-slate-400">Display years of teaching experience</span>
            </div>
            <Toggle value={visibility.teachers_experience !== false} onChange={val => onToggle('teachers_experience', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Teacher Bio</span>
              <span className="text-[10px] text-slate-400">Display teacher summary note</span>
            </div>
            <Toggle value={visibility.teachers_bio !== false} onChange={val => onToggle('teachers_bio', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Assigned Subjects</span>
              <span className="text-[10px] text-slate-400">Display department & subject tags</span>
            </div>
            <Toggle value={visibility.teachers_classes !== false} onChange={val => onToggle('teachers_classes', val)} />
          </div>
        </div>
      </Card>

      {/* Teachers List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              Active Faculty Members ({teachers.length})
            </h3>
            <p className="text-xs text-slate-400">Synchronized with your institute staff master</p>
          </div>
          <button
            onClick={loadTeachers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading teachers...
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active teachers found in your staff list. Add teachers in Employee Management with designation 'Teacher' or 'Faculty'.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3.5 hover:border-violet-300 transition-colors"
              >
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-violet-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 flex items-center justify-center font-black text-sm shrink-0">
                    {t.name?.[0] || 'T'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{t.name}</h4>
                  <p className="text-[11px] text-violet-600 font-semibold truncate">{t.designation || 'Teacher'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{t.qualification || t.department || 'Academic Department'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 5. GALLERY PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function GalleryPageTab({
  slug,
  visibility,
  onToggle,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Campus Gallery (/gallery)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize photo albums, annual sports, lab sessions, and campus events.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/gallery`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Gallery Page
          </a>
        )}
      </div>

      {/* Gallery Display Options */}
      <Card className="p-5">
        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-violet-600" /> Gallery Page Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Lightbox Fullscreen</span>
              <span className="text-[10px] text-slate-400">Click photo to zoom fullscreen</span>
            </div>
            <Toggle value={visibility.gallery_lightbox !== false} onChange={val => onToggle('gallery_lightbox', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Photo Captions</span>
              <span className="text-[10px] text-slate-400">Display caption label on hover</span>
            </div>
            <Toggle value={visibility.gallery_captions !== false} onChange={val => onToggle('gallery_captions', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Category Filter Tabs</span>
              <span className="text-[10px] text-slate-400">Sports, Events, Campus filter</span>
            </div>
            <Toggle value={visibility.gallery_filters !== false} onChange={val => onToggle('gallery_filters', val)} />
          </div>
        </div>
      </Card>

      {/* Gallery Photos Tab */}
      <Card className="p-6">
        <GalleryTab slug={slug} hideHeader={false} />
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 6. NOTICE & NEWS PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function NewsPageTab({
  slug,
  visibility,
  onToggle,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Notice & News (/news)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish school circulars, exam timetables, event notifications, and urgent parent bulletins.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/news`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Notice Board
          </a>
        )}
      </div>

      {/* Display Options */}
      <Card className="p-5">
        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-violet-600" /> Notice Board Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Publish Dates</span>
              <span className="text-[10px] text-slate-400">Display circular issue timestamp</span>
            </div>
            <Toggle value={visibility.news_dates !== false} onChange={val => onToggle('news_dates', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Show Category Tags</span>
              <span className="text-[10px] text-slate-400">Holiday, Exam, Event badges</span>
            </div>
            <Toggle value={visibility.news_categories !== false} onChange={val => onToggle('news_categories', val)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div>
              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Enable Detail Popup</span>
              <span className="text-[10px] text-slate-400">Full notice modal for visitors</span>
            </div>
            <Toggle value={visibility.news_modals !== false} onChange={val => onToggle('news_modals', val)} />
          </div>
        </div>
      </Card>

      {/* Notices Manager */}
      <Card className="p-6">
        <BlogsTab slug={slug} hideHeader={false} />
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 7. CONTACT US PAGE TAB
// ═══════════════════════════════════════════════════════════════════
function ContactPageTab({
  slug,
  visibility,
  onToggle,
  pageContent,
  onSaveContent,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
  pageContent: Record<string, any>
  onSaveContent: (updates: Record<string, any>) => void
}) {
  const [mapUrl, setMapUrl] = useState(pageContent.map_embed_url || '')
  const [officeHours, setOfficeHours] = useState(pageContent.contact_office_hours || '')
  const [directions, setDirections] = useState(pageContent.contact_directions || '')

  useEffect(() => {
    setMapUrl(pageContent.map_embed_url || '')
    setOfficeHours(pageContent.contact_office_hours || '')
    setDirections(pageContent.contact_directions || '')
  }, [pageContent])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Contact Us (/contact)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure campus address, Google Map embed, direct enquiry form, and visiting hours.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/contact`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Live Contact Page
          </a>
        )}
      </div>

      {/* SECTION 1: MAP EMBED */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="1. Google Map Interactive Embed"
          subtitle="Interactive location map so parents and visitors can navigate to campus easily"
          icon={MapPin}
          sectionKey="contact_map"
          visibility={visibility}
          onToggle={onToggle}
          badge="Map"
        />
        {visibility.contact_map !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <Field label="Google Maps Embed URL (or iframe src)">
              <input
                className={inp}
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={mapUrl}
                onChange={e => setMapUrl(e.target.value)}
              />
            </Field>
            <p className="text-[11px] text-slate-400">
              Open Google Maps &gt; Search your school &gt; Click 'Share' &gt; 'Embed a map' &gt; Copy the URL from inside the <code className="text-violet-600">src="..."</code> attribute.
            </p>
          </div>
        )}
      </Card>

      {/* SECTION 2: DIRECT ENQUIRY FORM */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="2. Direct Online Message Form"
          subtitle="Visitors can fill out their name, phone, email, and message to reach admissions"
          icon={Mail}
          sectionKey="contact_form"
          visibility={visibility}
          onToggle={onToggle}
          badge="Form"
        />
        {visibility.contact_form !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When visitors submit this form, entries are automatically logged into your <strong className="text-violet-600 font-bold">Admission Enquiries</strong> tab.
            </p>
          </div>
        )}
      </Card>

      {/* SECTION 3: ADDRESS & CONTACT CARDS */}
      <Card className="space-y-4">
        <SectionVisibilityHeader
          title="3. Campus Address & Contact Cards"
          subtitle="Display official school phone numbers, email addresses, and campus location"
          icon={Phone}
          sectionKey="contact_info"
          visibility={visibility}
          onToggle={onToggle}
          badge="Contact Info"
        />
        {visibility.contact_info !== false && (
          <div className="pt-2 pl-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Office / Visiting Hours">
                <input
                  className={inp}
                  placeholder="e.g. Mon – Sat: 8:00 AM – 3:30 PM"
                  value={officeHours}
                  onChange={e => setOfficeHours(e.target.value)}
                />
              </Field>
              <Field label="Landmark / Directions Note">
                <input
                  className={inp}
                  placeholder="e.g. Opposite City Park, 500m from Central Metro Station"
                  value={directions}
                  onChange={e => setDirections(e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSaveContent({
            map_embed_url: mapUrl,
            contact_office_hours: officeHours,
            contact_directions: directions,
          })}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
        >
          <Save className="w-4 h-4" /> Save Contact Settings
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 8. ADMISSION ENQUIRIES TAB (WRAPPER)
// ═══════════════════════════════════════════════════════════════════
function EnquiriesPageTab({
  slug,
  visibility,
  onToggle,
}: {
  slug?: string
  visibility: Record<string, boolean>
  onToggle: (key: string, val: boolean) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-violet-600" />
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Admission Applications & Leads (/apply)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">Dedicated Subpage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review and follow up on admission enquiries and applications received from your website.
          </p>
        </div>
        {slug && (
          <a
            href={`/${slug}/apply`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Online Application Form
          </a>
        )}
      </div>

      {/* Online Application Setting */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              Allow Public Online Student Applications
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              When enabled, visitors can fill out complete online admission registration at <code className="text-violet-600">/{slug}/apply</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${visibility.enquiries_public_form !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
              {visibility.enquiries_public_form !== false ? 'Accepting Applications' : 'Form Disabled'}
            </span>
            <Toggle value={visibility.enquiries_public_form !== false} onChange={val => onToggle('enquiries_public_form', val)} />
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <EnquiriesTab slug={slug} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function WebsiteManagementPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<any>(null)
  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const [pageContent, setPageContent] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchWebsiteSettings().then(r => {
      if (r.data) {
        setSettings(r.data)
        setVisibility(r.data.page_sections_visibility || {})
        setPageContent(r.data.page_content || {})
      }
    })
  }, [])

  const slug = settings?.slug
  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : null

  const handleToggleVisibility = async (key: string, value: boolean) => {
    setVisibility(prev => ({ ...prev, [key]: value }))
    const res = await updateSectionVisibility({ [key]: value })
    if (res.success) {
      toast.success(`${value ? 'Visible' : 'Hidden'} on website`)
    } else {
      toast.error('Failed to update visibility')
      setVisibility(prev => ({ ...prev, [key]: !value }))
    }
  }

  const handleSavePageContent = async (updates: Record<string, any>) => {
    setPageContent(prev => ({ ...prev, ...updates }))
    const res = await updatePageContent(updates)
    if (res.success) {
      toast.success('Page content saved successfully!')
    } else {
      toast.error('Failed to save page content')
    }
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />
      case 'home':
        return (
          <HomePageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
            pageContent={pageContent}
            onSaveContent={handleSavePageContent}
          />
        )
      case 'about':
        return (
          <AboutPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
            pageContent={pageContent}
            onSaveContent={handleSavePageContent}
          />
        )
      case 'courses':
        return (
          <CoursesPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        )
      case 'teachers':
        return (
          <TeachersPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        )
      case 'gallery':
        return (
          <GalleryPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        )
      case 'news':
        return (
          <NewsPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        )
      case 'contact':
        return (
          <ContactPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
            pageContent={pageContent}
            onSaveContent={handleSavePageContent}
          />
        )
      case 'enquiries':
        return (
          <EnquiriesPageTab
            slug={slug}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-0 w-full min-h-screen">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" /> Website Management
            {settings?.website_title && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
                {settings.website_title}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Build and manage your institution's public website & dedicated subpages</p>
        </div>
        <div className="flex items-center gap-3">
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" /> Visit Website
            </a>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${settings?.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {settings?.is_published ? <><CheckCircle className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
          </div>
        </div>
      </div>

      {/* Website URL Banner */}
      {publicUrl && (
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-white">
            <Globe className="w-5 h-5 text-white/70 shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-white/70 block">Your Website URL</span>
              <span className="text-sm font-black tracking-tight">{publicUrl}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl)
                toast.success('Website URL copied to clipboard!')
              }}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" /> Copy Link
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white text-indigo-700 text-[11px] font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Website
            </a>
          </div>
        </div>
      )}

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <aside className="w-60 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col py-4 gap-1 px-3">
          <div className="px-3 pb-2 mb-1 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Page-Wise Management</span>
          </div>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </aside>

        {/* Right Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">
          {renderTab()}
        </main>
      </div>
    </div>
  )
}

