'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus,
  Pencil, 
  Eye, 
  X, 
  CheckCircle2, 
  List, 
  Palette, 
  Check, 
  Save, 
  RotateCw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { 
  UniversalIdCardRender,
  IdCardBackDesign,
  ID_CARD_COLOR_PRESETS,
  ID_CARD_DESIGNS
} from '@/components/id-cards/IdCardTemplates'
import { fetchIdCardSetups, deleteIdCardSetup, saveIdCardSetup } from '../actions'

interface IdCardItem {
  id: number
  title: string
  session: string
  designId: 1 | 2 | 3 | 4
  designName: string
  orientation: 'Vertical' | 'Horizontal'
  dimensions: string
  badge: string
  description: string
  date: string
  time: string
  themeColor?: string
  schoolName?: string
  tagline?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  principalName?: string
  principalSign?: string
  schoolLogo?: string
  customLabels?: Record<string, string>
}

const INITIAL_ID_CARD_DATA: IdCardItem[] = [
  { 
    id: 1, 
    title: 'Modern Smart ID Card', 
    session: '2025-26', 
    designId: 1,
    designName: 'Design 1 (Vertical)',
    orientation: 'Vertical',
    dimensions: '280 × 450 px',
    badge: 'Design 1 • Smart Modern',
    description: 'Clean curved header with institute emblem, portrait photo, admission/identity grid, QR code & signature',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 2, 
    title: 'Academic Campus RFID Card', 
    session: '2025-26', 
    designId: 2,
    designName: 'Design 2 (Horizontal)',
    orientation: 'Horizontal',
    dimensions: '450 × 280 px',
    badge: 'Design 2 • Academic RFID',
    description: 'Full-width banner, photo on left, multi-column identity layout, RFID badge simulation & barcode',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 3, 
    title: 'Executive Prestige ID Pass', 
    session: '2025-26', 
    designId: 3,
    designName: 'Design 3 (Vertical)',
    orientation: 'Vertical',
    dimensions: '280 × 450 px',
    badge: 'Design 3 • Executive Prestige',
    description: 'Luxury gradient header, lanyard clip slot, royal circular gold-accented photo frame & official stamp',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
  { 
    id: 4, 
    title: 'Corporate High-Tech Card', 
    session: '2025-26', 
    designId: 4,
    designName: 'Design 4 (Horizontal)',
    orientation: 'Horizontal',
    dimensions: '450 × 280 px',
    badge: 'Design 4 • High-Tech Metro',
    description: 'Modern tech dual-tone header, horizontal badge with gold microchip / RFID graphic & verification QR',
    date: '15/09/2025', 
    time: '11:00 AM' 
  },
]

export default function IdCardSetupPage() {
  const [formatFilter, setFormatFilter] = useState<'All' | 'Vertical' | 'Horizontal'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<IdCardItem[]>(INITIAL_ID_CARD_DATA)
  
  // Theme Color State
  const [themeColor, setThemeColor] = useState<string>('#0284C7')

  // Preview & Live Editing State
  const [previewItem, setPreviewItem] = useState<IdCardItem | null>(null)
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSavingLive, setIsSavingLive] = useState(false)

  // Live editable fields for preview
  const [modalSchoolName, setModalSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [modalTagline, setModalTagline] = useState('Center of Academic Excellence')
  const [modalSchoolAddress, setModalSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [modalSchoolPhone, setModalSchoolPhone] = useState('+91 11 2345 6789')
  const [modalSchoolEmail, setModalSchoolEmail] = useState('info@academy.edu')
  const [modalSession, setModalSession] = useState('2025-26')
  const [modalTitle, setModalTitle] = useState('INSTITUTE IDENTITY CARD')
  const [modalPrincipalName, setModalPrincipalName] = useState('K.Singhal')
  const [modalCustomLabels, setModalCustomLabels] = useState<Record<string, string>>({})

  // Load from PostgreSQL
  useEffect(() => {
    loadSetups()
  }, [])

  const loadSetups = async () => {
    try {
      const res = await fetchIdCardSetups()
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Find saved theme color if any
        const firstWithColor = res.data.find((item: any) => item.themeColor)
        if (firstWithColor?.themeColor) {
          setThemeColor(firstWithColor.themeColor)
        }

        // Overlay saved content onto the 4 system templates
        const updated = INITIAL_ID_CARD_DATA.map(initItem => {
          const match = res.data.find(
            (item: any) => Number(item.designId) === initItem.designId
          )
          if (match) {
            return {
              ...initItem,
              title: match.title || initItem.title,
              session: match.session || initItem.session,
              date: match.date || initItem.date,
              time: match.time || initItem.time,
              themeColor: match.themeColor || undefined,
              schoolName: match.schoolName || undefined,
              tagline: match.tagline || undefined,
              schoolAddress: match.schoolAddress || undefined,
              schoolPhone: match.schoolPhone || undefined,
              schoolEmail: match.schoolEmail || undefined,
              principalName: match.principalName || undefined,
              customLabels: typeof match.customLabels === 'object' && match.customLabels !== null ? match.customLabels : undefined
            }
          }
          return initItem
        })
        setData(updated)
      } else {
        setData(INITIAL_ID_CARD_DATA)
      }
    } catch (err) {
      console.error(err)
      setData(INITIAL_ID_CARD_DATA)
    }
  }

  // When opening preview modal, synchronize live edit fields
  const openPreview = (item: IdCardItem) => {
    setPreviewItem(item)
    setPreviewSide('front')
    setModalTitle(item.title)
    setModalSession(item.session || '2025-26')
    setModalSchoolName(item.schoolName || 'COSMOPOLITAN INTER COLLEGE')
    setModalTagline(item.tagline || 'Center of Academic Excellence')
    setModalSchoolAddress(item.schoolAddress || 'Knowledge Park, Sector 62, New Delhi')
    setModalSchoolPhone(item.schoolPhone || '+91 11 2345 6789')
    setModalSchoolEmail(item.schoolEmail || 'info@academy.edu')
    setModalPrincipalName(item.principalName || 'K.Singhal')
    setModalCustomLabels(item.customLabels || {})
  }

  const handleUpdateLiveField = (field: string, value: any) => {
    if (field === 'schoolName') setModalSchoolName(value)
    else if (field === 'tagline') setModalTagline(value)
    else if (field === 'schoolAddress') setModalSchoolAddress(value)
    else if (field === 'schoolPhone') setModalSchoolPhone(value)
    else if (field === 'schoolEmail') setModalSchoolEmail(value)
    else if (field === 'session') setModalSession(value)
    else if (field === 'title') setModalTitle(value)
    else if (field === 'principalName') setModalPrincipalName(value)
  }

  const handleUpdateLiveLabel = (key: string, value: string) => {
    setModalCustomLabels(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Save changes made inside the live preview
  const handleSaveLiveChanges = async () => {
    if (!previewItem) return
    setIsSavingLive(true)
    try {
      await saveIdCardSetup({
        title: modalTitle,
        cardFor: 'Universal',
        session: modalSession,
        designId: previewItem.designId,
        tagline: modalTagline,
        schoolName: modalSchoolName,
        schoolAddress: modalSchoolAddress,
        schoolPhone: modalSchoolPhone,
        schoolEmail: modalSchoolEmail,
        themeColor: themeColor,
        principalName: modalPrincipalName,
        customLabels: modalCustomLabels
      })

      // Update local item
      setData(prev => prev.map(it => {
        if (it.id === previewItem.id) {
          return {
            ...it,
            title: modalTitle,
            session: modalSession,
            schoolName: modalSchoolName,
            tagline: modalTagline,
            schoolAddress: modalSchoolAddress,
            schoolPhone: modalSchoolPhone,
            schoolEmail: modalSchoolEmail,
            principalName: modalPrincipalName,
            themeColor: themeColor,
            customLabels: modalCustomLabels
          }
        }
        return it
      }))

      setToastMessage('ID Card changes & custom text saved successfully!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsSavingLive(false)
    }
  }

  // Filter data based on format filter and search query (Universal, no Student/Teacher/Employee split)
  const filteredData = data.filter(item => {
    const matchesFormat = formatFilter === 'All' || item.orientation === formatFilter
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.session.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orientation.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFormat && matchesSearch
  })

  // Format Counts
  const counts = {
    All: data.length,
    Vertical: data.filter(i => i.orientation === 'Vertical').length,
    Horizontal: data.filter(i => i.orientation === 'Horizontal').length,
  }

  const handleDelete = async (id: any) => {
    setData(prev => prev.filter(item => item.id !== id))
    try {
      await deleteIdCardSetup(String(id))
    } catch (e) {}
    setToastMessage('ID Card design deleted.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            ID Card Setup
            <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-600 px-2.5 py-0.5 rounded-full font-bold">
              4 Unified Designs
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            4 distinct ID card designs (Vertical & Horizontal layouts) • Universal institute branding & dynamic theme palette
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Design Title, Format, Session..." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          <Link
            href={`/institute/id-card/setup/generate?color=${encodeURIComponent(themeColor)}`}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-teal-500/25 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create ID Card</span>
          </Link>
        </div>
      </div>

      {/* ─── THEME COLOR SELECTION BAR ─── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>Theme Color Palette</span>
                <span className="text-[10px] font-normal lowercase text-slate-400">
                  (changes whole template color)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Select any color swatch or custom hex — all 4 ID card designs immediately transform to your selected theme
              </p>
            </div>
          </div>

          {/* Color Picker & Custom Hex Input */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                title="Choose custom color"
              />
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#0284C7"
                maxLength={7}
                className="w-18 text-[11px] font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Color Preset Swatches */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {ID_CARD_COLOR_PRESETS.map(preset => {
            const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase()
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setThemeColor(preset.hex)}
                title={`${preset.name} (${preset.hex})`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  isSelected
                    ? 'ring-2 ring-teal-500 border-transparent text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
                style={isSelected ? { backgroundColor: preset.hex } : {}}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Format Filter Tabs & Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Format Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setFormatFilter('All')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs flex items-center gap-2 ${
              formatFilter === 'All' 
                ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <span>All 4 Designs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              formatFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.All}
            </span>
          </button>

          <button 
            onClick={() => setFormatFilter('Vertical')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs flex items-center gap-2 ${
              formatFilter === 'Vertical' 
                ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Vertical (Portrait)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              formatFilter === 'Vertical' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.Vertical}
            </span>
          </button>

          <button 
            onClick={() => setFormatFilter('Horizontal')} 
            className={`px-5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs flex items-center gap-2 ${
              formatFilter === 'Horizontal' 
                ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-600/20' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Horizontal (Landscape)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              formatFilter === 'Horizontal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts.Horizontal}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <List className="w-3.5 h-3.5 text-teal-600" />
          <span>Table View • {filteredData.length} Templates Active</span>
        </div>
      </div>

      {/* ─── TABLE VIEW ONLY ─── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5 w-16 text-left">Design #</th>
                <th className="px-4 py-3.5 text-left">Template Title & Features</th>
                <th className="px-4 py-3.5">Format & Dimensions</th>
                <th className="px-4 py-3.5">Academic Session</th>
                <th className="px-4 py-3.5">Theme Palette</th>
                <th className="px-4 py-3.5">Live Preview</th>
                <th className="px-4 py-3.5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                      <p className="text-sm">No ID card setups found matching criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const currentItemColor = item.themeColor || themeColor
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-black text-xs shadow-2xs">
                            #{item.designId}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3.5 text-left">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block">
                            {item.description}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          <span>{item.orientation}</span>
                          <span className="text-slate-300 dark:text-slate-500">•</span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{item.dimensions}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {item.session}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs" 
                            style={{ backgroundColor: currentItemColor }}
                          />
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {currentItemColor}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <button 
                          type="button"
                          onClick={() => openPreview(item)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 hover:border-teal-300 flex items-center justify-center gap-1.5 transition-all border border-teal-200 dark:border-teal-800 mx-auto font-bold text-xs shadow-2xs"
                          title="Open full interactive preview and edit text"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Preview & Edit</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => openPreview(item)}
                            title="Interactive Live Preview"
                            className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-200 transition-colors shadow-2xs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/institute/id-card/setup/generate?design=${item.designId}&color=${encodeURIComponent(currentItemColor)}`}
                            title="Full Edit Form"
                            className="px-3 py-1.5 rounded-xl bg-teal-600 text-white flex items-center gap-1.5 hover:bg-teal-700 transition-colors text-xs font-bold shadow-xs"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Customize</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LIVE INTERACTIVE PREVIEW & EDIT MODAL ─── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header with Title & Color Switcher */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                  <span>{previewItem.title}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    Design {previewItem.designId} • {previewItem.orientation}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" />
                    Click Any Text to Edit
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Direct live text & label editing • Custom theme color & front/back view
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Front / Back Toggle */}
                <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setPreviewSide('front')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'front' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setPreviewSide('back')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewSide === 'back' 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Back
                  </button>
                </div>

                <button 
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Quick Color Palette Swatches */}
            <div className="px-6 py-2.5 bg-slate-100/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                  Template Theme:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ID_CARD_COLOR_PRESETS.slice(0, 7).map(preset => {
                    const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase()
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setThemeColor(preset.hex)}
                        title={preset.name}
                        className={`w-5 h-5 rounded-full border border-white/60 transition-transform flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-teal-500 scale-110 shadow-xs' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  title="Pick custom hex color"
                />
                <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  {themeColor}
                </span>
              </div>
            </div>

            {/* Modal Body / Rendered Card with Live Inline Editing */}
            <div className="p-8 flex items-center justify-center bg-slate-100/70 dark:bg-slate-900/60 overflow-y-auto flex-1 min-h-[480px]">
              <div 
                className="transition-transform duration-200 flex items-center justify-center drop-shadow-xl"
                style={{ 
                  transform: previewItem.orientation === 'Horizontal' ? 'scale(0.98)' : 'scale(0.98)',
                  transformOrigin: 'center' 
                }}
              >
                {previewSide === 'back' ? (
                  <IdCardBackDesign 
                    orientation={previewItem.orientation === 'Horizontal' ? 'landscape' : 'portrait'}
                    schoolName={modalSchoolName}
                    schoolAddress={modalSchoolAddress}
                    schoolPhone={modalSchoolPhone}
                    schoolEmail={modalSchoolEmail}
                    themeColor={themeColor}
                    editable={true}
                    onUpdateField={handleUpdateLiveField}
                  />
                ) : (
                  <UniversalIdCardRender
                    designId={previewItem.designId}
                    themeColor={themeColor}
                    schoolName={modalSchoolName}
                    tagline={modalTagline}
                    schoolAddress={modalSchoolAddress}
                    schoolPhone={modalSchoolPhone}
                    session={modalSession}
                    title={modalTitle}
                    principalName={modalPrincipalName}
                    principalSign={previewItem.principalSign}
                    schoolLogo={previewItem.schoolLogo}
                    editable={true}
                    customLabels={modalCustomLabels}
                    onUpdateField={handleUpdateLiveField}
                    onUpdateLabel={handleUpdateLiveLabel}
                  />
                )}
              </div>
            </div>

            {/* Modal Footer with Save, Customize & Close */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                Standard CR80 ID Card • Live changes auto-apply to template
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveLiveChanges}
                  disabled={isSavingLive}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingLive ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <Link
                  href={`/institute/id-card/setup/generate?design=${previewItem.designId}&color=${encodeURIComponent(themeColor)}`}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-teal-600" />
                  <span>Full Edit Form</span>
                </Link>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-5 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
    </div>
  )
}
