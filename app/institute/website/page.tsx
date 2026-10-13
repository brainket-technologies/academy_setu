'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Globe, Settings, Image, BarChart2, BookOpen, HelpCircle, MessageSquare, FileText,
  Camera, Save, Plus, Trash2, ExternalLink, Eye, EyeOff, Edit2, X, CheckCircle, RefreshCw,
  ChevronDown, ChevronUp, Star, LayoutDashboard, Link2, Inbox, Phone, Mail,
  Palette, Type, Sparkles, Check, Copy
} from 'lucide-react'
import {
  fetchWebsiteSettings, saveWebsiteSettings,
  fetchSliders, saveSlider, deleteSlider,
  fetchStats, saveStat, deleteStat,
  fetchCourses, saveCourse, deleteCourse,
  fetchFaqs, saveFaq, deleteFaq,
  fetchTestimonials, saveTestimonial, deleteTestimonial,
  fetchBlogs, saveBlog, deleteBlog,
  fetchGallery, saveGalleryItem, deleteGalleryItem,
  fetchEnquiries, updateEnquiryStatus,
} from './actions'

// ─── SIDEBAR TABS ────────────────────────────────────────────────
const TABS = [
  { key: 'general', label: 'General Settings', icon: Settings },
  { key: 'sliders', label: 'Sliders', icon: Image },
  { key: 'stats', label: 'Statistics', icon: BarChart2 },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { key: 'blogs', label: 'Blogs', icon: FileText },
  { key: 'gallery', label: 'Gallery', icon: Camera },
  { key: 'enquiries', label: 'Admission Enquiries', icon: Inbox },
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
            <span>📞 {form.contact_phone || '+91 99999 99999'} • ✉️ {form.contact_email || 'info@school.com'}</span>
            <span>Institute Portal Login →</span>
          </div>

          {/* Mini Navbar */}
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b border-black/5 transition-colors"
            style={{ backgroundColor: navbarBg }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                {(form.website_title || 'A').charAt(0)}
              </div>
              <span
                className="text-xs font-extrabold truncate max-w-[160px]"
                style={{ color: headingColor, fontFamily: `"${headingFont}", sans-serif` }}
              >
                {form.website_title || 'Cosmopolitan Inter College'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold" style={{ color: navbarText }}>
              <span className="cursor-pointer hover:opacity-80">Home</span>
              <span className="cursor-pointer hover:opacity-80">About</span>
              <span className="cursor-pointer hover:opacity-80">Courses</span>
              <button
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-transform"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: buttonTextColor }}
              >
                Admissions Open
              </button>
            </div>
          </div>

          {/* Mini Hero & Card Content */}
          <div
            className="p-5 transition-colors"
            style={{ backgroundColor: sectionAltBg }}
          >
            <div className="max-w-md space-y-2">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                Campus Welcome
              </span>
              <h4
                className="text-base sm:text-lg font-black leading-tight"
                style={{ color: headingColor, fontFamily: `"${headingFont}", sans-serif` }}
              >
                {form.hero_tagline || 'Excellence in Academics & Innovation'}
              </h4>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: bodyTextColor }}
              >
                {form.hero_sub_text || 'Providing exceptional academic standards and holistic student development.'}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-xs"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: buttonTextColor }}
                >
                  Explore Programs →
                </button>
                <a
                  href="#preview"
                  onClick={e => e.preventDefault()}
                  className="text-[11px] font-bold hover:underline"
                  style={{ color: linkColor }}
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Mini Card */}
            <div
              className="mt-4 p-3.5 rounded-xl border shadow-2xs max-w-sm transition-colors"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <div className="text-[11px] font-bold" style={{ color: headingColor, fontFamily: `"${headingFont}", sans-serif` }}>
                🏆 Recognized Excellence
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: bodyTextColor }}>
                Sample card preview displaying border & background styling.
              </p>
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
function SlidersTab() {
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Hero Sliders ({items.length})</h3>
        <button onClick={handleNew} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors">
          <Plus className="w-4 h-4" /> Add Slider
        </button>
      </div>

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
function StatsTab() {
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Statistics / Achievements</h3>
        <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Stat</button>
      </div>

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
function CoursesTab() {
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Courses Offered</h3>
        <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Course</button>
      </div>

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
function TestimonialsTab() {
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Testimonials</h3>
        <button onClick={() => { setForm({ rating: 5 }); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add</button>
      </div>
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
function BlogsTab() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<number | null>(null)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const load = useCallback(async () => { const r = await fetchBlogs(); setItems(r.data || []) }, [])
  useEffect(() => { load() }, [load])
  const handleSave = async () => { const res = await saveBlog(form); if (res.success) { toast.success('Blog saved!'); setForm({}); setEditing(null); load() } else toast.error(res.error) }
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await deleteBlog(id); load() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Blogs / News</h3>
        <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Post</button>
      </div>
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
function GalleryTab() {
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Gallery ({items.length} images)</h3>
        <button onClick={() => { setForm({}); setEditing(0) }} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"><Plus className="w-4 h-4" /> Add Image</button>
      </div>
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
function EnquiriesTab() {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Admission & Contact Enquiries</h2>
          <p className="text-xs text-slate-400">Leads and enquiries submitted from your public website</p>
        </div>
        <button onClick={reload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
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
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function WebsiteManagementPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchWebsiteSettings().then(r => { if (r.data) setSettings(r.data) })
  }, [])

  const slug = settings?.slug
  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}` : null

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab />
      case 'sliders': return <SlidersTab />
      case 'stats': return <StatsTab />
      case 'courses': return <CoursesTab />
      case 'faqs': return <FaqsTab />
      case 'testimonials': return <TestimonialsTab />
      case 'blogs': return <BlogsTab />
      case 'gallery': return <GalleryTab />
      case 'enquiries': return <EnquiriesTab />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-0 w-full min-h-screen">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" /> Website Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Build and manage your institution's public website</p>
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
        <aside className="w-56 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col py-4 gap-1 px-3">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
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
