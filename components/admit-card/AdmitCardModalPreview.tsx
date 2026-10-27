'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import {
  X,
  Printer,
  Sparkles,
  QrCode,
  School,
  Award,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Scissors,
  AlertCircle,
  FileText,
  MapPin,
  Check,
  Edit3,
  Upload,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Type,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MousePointer,
  GripVertical
} from 'lucide-react'
import { AdmitCardConfig, getStoredTimetables } from '@/lib/admit-card-sync'

export interface CanvaElementWrapperProps {
  id: string
  label: string
  isSelected: boolean
  isCanvaMode: boolean
  offset: { x: number; y: number }
  scale?: number
  onSelect: (id: string, e: React.MouseEvent) => void
  onStartDrag: (id: string, e: React.MouseEvent) => void
  onNudge?: (dx: number, dy: number) => void
  onReset?: () => void
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  isDragging?: boolean
}

export const CanvaElementWrapper: React.FC<CanvaElementWrapperProps> = ({
  id,
  label,
  isSelected,
  isCanvaMode,
  offset,
  scale = 1,
  onSelect,
  onStartDrag,
  onNudge,
  onReset,
  children,
  className = '',
  style = {},
  isDragging = false
}) => {
  if (!isCanvaMode) {
    return (
      <div
        className={className}
        style={{
          transform: (offset.x !== 0 || offset.y !== 0 || scale !== 1)
            ? `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
            : undefined,
          ...style
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id, e)
      }}
      className={`relative group transition-shadow ${className} ${
        isSelected
          ? 'ring-2 ring-blue-500 rounded-md z-30 shadow-lg'
          : 'hover:ring-1 hover:ring-dashed hover:ring-blue-400 cursor-pointer'
      }`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)',
        ...style
      }}
    >
      {/* Canva Floating Selection Indicator & Drag Handle Pill */}
      {isSelected && (
        <>
          {/* Top Pill Handle */}
          <div
            onMouseDown={(e) => onStartDrag(id, e)}
            className="absolute -top-7 left-0 z-40 bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded-t-md text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-grab active:cursor-grabbing select-none print:hidden"
            title="Drag with mouse or use arrow keys to reposition"
          >
            <Move className="w-3 h-3 text-white/90" />
            <span>{label}</span>
            <span className="text-[8px] opacity-75 font-mono">
              ({offset.x > 0 ? `+${offset.x}` : offset.x}, {offset.y > 0 ? `+${offset.y}` : offset.y})
            </span>
            {(offset.x !== 0 || offset.y !== 0) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onReset?.()
                }}
                title="Reset element to original position"
                className="hover:bg-blue-800 p-0.5 rounded text-white/90 hover:text-white"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* 4 Corner Resize / Anchor Points (Canva Signature Look) */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-2xs pointer-events-none z-40 print:hidden" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-2xs pointer-events-none z-40 print:hidden" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-2xs pointer-events-none z-40 print:hidden" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-sm shadow-2xs pointer-events-none z-40 print:hidden" />
        </>
      )}

      {children}
    </div>
  )
}

interface AdmitCardModalPreviewProps {
  card: AdmitCardConfig | null
  customSubjects?: { subjectName: string; date: string; fromTime: string; toTime: string }[]
  onClose: () => void
  editable?: boolean
  onUpdateField?: (field: string, value: any) => void
  onUpdateSubject?: (idx: number, key: string, value: string) => void
}

export interface AdmitCardPaperProps {
  card: AdmitCardConfig | null
  customSubjects?: { subjectName: string; date: string; fromTime: string; toTime: string }[]
  className?: string
  editable?: boolean
  canvaMode?: boolean
  onUpdateField?: (field: string, value: any) => void
  onUpdateSubject?: (idx: number, key: string, value: string) => void
}

// Convert any 3 or 6 hex code to rgba string
export function hexToRgba(hex?: string, alpha: number = 1): string {
  if (!hex || typeof hex !== 'string') return `rgba(30, 58, 138, ${alpha})`
  let cleanHex = hex.trim().replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const num = parseInt(cleanHex, 16)
  if (isNaN(num)) return `rgba(30, 58, 138, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const ProperQrCode: React.FC<{
  className?: string
  color?: string
  size?: number
  style?: React.CSSProperties
}> = ({ className = 'w-20 h-20', color = '#0f172a', size, style }) => {
  const isFinder = (r: number, c: number) => {
    if (r <= 6 && c <= 6) return true
    if (r <= 6 && c >= 18) return true
    if (r >= 18 && c <= 6) return true
    return false
  }

  const isAlignment = (r: number, c: number) => {
    return r >= 16 && r <= 20 && c >= 16 && c <= 20
  }

  const isTiming = (r: number, c: number) => {
    return (r === 6 && c >= 7 && c <= 17) || (c === 6 && r >= 7 && r <= 17)
  }

  const modules: { r: number; c: number }[] = []
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      if (isFinder(r, c)) continue
      if (isAlignment(r, c)) continue
      if (isTiming(r, c)) {
        if ((r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0)) {
          modules.push({ r, c })
        }
        continue
      }
      const v = (r * 11 + c * 17 + (r ^ c) * 5 + (r * c)) % 7
      if (v === 0 || v === 2 || v === 4) {
        modules.push({ r, c })
      }
    }
  }

  return (
    <svg
      viewBox="0 0 25 25"
      className={className}
      style={size ? { width: `${size}px`, height: `${size}px`, ...style } : style}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="25" height="25" fill="#ffffff" />
      {/* Top-Left Finder */}
      <rect x="0" y="0" width="7" height="7" fill={color} />
      <rect x="1" y="1" width="5" height="5" fill="#ffffff" />
      <rect x="2" y="2" width="3" height="3" fill={color} />

      {/* Top-Right Finder */}
      <rect x="18" y="0" width="7" height="7" fill={color} />
      <rect x="19" y="1" width="5" height="5" fill="#ffffff" />
      <rect x="20" y="2" width="3" height="3" fill={color} />

      {/* Bottom-Left Finder */}
      <rect x="0" y="18" width="7" height="7" fill={color} />
      <rect x="1" y="19" width="5" height="5" fill="#ffffff" />
      <rect x="2" y="20" width="3" height="3" fill={color} />

      {/* Alignment Pattern */}
      <rect x="16" y="16" width="5" height="5" fill={color} />
      <rect x="17" y="17" width="3" height="3" fill="#ffffff" />
      <rect x="18" y="18" width="1" height="1" fill={color} />

      {/* Data & Timing Modules */}
      {modules.map(m => (
        <rect key={`${m.r}-${m.c}`} x={m.c} y={m.r} width="1" height="1" fill={color} />
      ))}
    </svg>
  )
}

export const SampleSchoolLogo: React.FC<{
  className?: string
  width?: number | string
  height?: number | string
  color?: string
  style?: React.CSSProperties
}> = ({ className = '', width = 56, height = 56, color = '#1e3a8a', style }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={width}
      height={height}
      className={`shrink-0 ${className}`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Laurel / Circle Border */}
      <circle cx="50" cy="50" r="47" stroke={color} strokeWidth="2.5" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="43" stroke={color} strokeWidth="1.5" />
      
      {/* Background Crest Shield */}
      <path
        d="M50 14 L78 22 C78 52 50 78 50 78 C50 78 22 52 22 22 Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      
      {/* Graduation Cap / Mortarboard */}
      <polygon points="50,25 68,32 50,39 32,32" fill={color} />
      <polygon points="50,39 64,33.5 64,37 50,42 36,37 36,33.5" fill={color} />
      <path d="M62 33 L62 44" stroke={color} strokeWidth="1.5" />
      <circle cx="62" cy="45" r="1.5" fill={color} />
      
      {/* Open Book */}
      <path
        d="M34 50 C40 48 48 50 50 52 C52 50 60 48 66 50 L66 64 C60 62 52 64 50 66 C48 64 40 62 34 64 Z"
        fill="white"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line x1="50" y1="52" x2="50" y2="66" stroke={color} strokeWidth="1.5" />
      <line x1="38" y1="54" x2="46" y2="54" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="58" x2="46" y2="58" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="54" y1="54" x2="62" y2="54" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="54" y1="58" x2="62" y2="58" stroke={color} strokeWidth="1" strokeLinecap="round" />

      {/* Ribbon / Scroll with Stars */}
      <path
        d="M26 80 L50 76 L74 80 L70 86 L50 82 L30 86 Z"
        fill={color}
      />
      {/* 3 Academic Honor Stars */}
      <polygon points="44,80 45,82 47,82 45.5,83 46,85 44,84 42,85 42.5,83 41,82 43,82" fill="white" />
      <polygon points="50,79 51,81 53,81 51.5,82 52,84 50,83 48,84 48.5,82 47,81 49,81" fill="white" />
      <polygon points="56,80 57,82 59,82 57.5,83 58,85 56,84 54,85 54.5,83 53,82 55,82" fill="white" />
    </svg>
  )
}

export interface LiveEditableTextProps {
  value: string
  onSave?: (newValue: string) => void
  className?: string
  style?: React.CSSProperties
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  multiline?: boolean
  placeholder?: string
  editable?: boolean
  title?: string
  tooltipPosition?: 'top' | 'bottom' | 'auto'
  fontSizeControl?: {
    value: string | number
    onChange: (newValue: string) => void
    label?: string
  }
}

export const LiveEditableText: React.FC<LiveEditableTextProps> = ({
  value,
  onSave,
  className = '',
  style,
  tag = 'span',
  multiline = false,
  placeholder = 'Click to edit...',
  editable = true,
  title = 'Click to edit text live',
  tooltipPosition = 'bottom',
  fontSizeControl
}) => {
  const [currentVal, setCurrentVal] = useState(value || '')
  const [showSizeTooltip, setShowSizeTooltip] = useState(false)
  const elRef = useRef<HTMLElement | null>(null)
  const isFocused = useRef(false)

  // Track dynamic font size from style or control
  const parsedStyleSize = style?.fontSize ? parseFloat(String(style.fontSize)) : undefined
  const [internalSize, setInternalSize] = useState<number | undefined>(parsedStyleSize)

  useEffect(() => {
    if (fontSizeControl?.value !== undefined) {
      const parsed = parseFloat(String(fontSizeControl.value))
      if (!isNaN(parsed) && parsed > 0) setInternalSize(parsed)
    } else if (style?.fontSize) {
      const parsed = parseFloat(String(style.fontSize))
      if (!isNaN(parsed) && parsed > 0) setInternalSize(parsed)
    }
  }, [fontSizeControl?.value, style?.fontSize])

  useEffect(() => {
    if (!isFocused.current) {
      setCurrentVal(value || '')
      if (elRef.current && elRef.current.innerText !== (value || '')) {
        elRef.current.innerText = value || ''
      }
    }
  }, [value])

  if (!editable) {
    const Tag = tag as any
    return <Tag className={className} style={style}>{value}</Tag>
  }

  const Tag = tag as any
  const isBlock = ['h1', 'h2', 'h3', 'h4', 'p', 'div'].includes(tag) || (className.split(/\s+/).includes('block') && !className.split(/\s+/).includes('inline-block'))

  const currentFontSize = fontSizeControl?.value !== undefined
    ? (parseFloat(String(fontSizeControl.value)) || 14)
    : (internalSize || parsedStyleSize || 13)

  const handleSizeChange = (delta: number) => {
    const nextSize = Math.max(6, Math.min(48, Math.round((currentFontSize + delta) * 2) / 2))
    if (fontSizeControl?.onChange) {
      fontSizeControl.onChange(String(nextSize))
    } else {
      setInternalSize(nextSize)
    }
  }

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(internalSize && !fontSizeControl ? { fontSize: `${internalSize}px` } : {})
  }

  return (
    <span className={`relative group/live-text max-w-full ${isBlock ? 'block w-full' : 'inline-block'}`}>
      <Tag
        ref={elRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        title={title}
        className={`${className} outline-none cursor-pointer transition-all rounded-xs hover:outline hover:outline-1 hover:outline-dashed hover:outline-blue-500/80 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:text-slate-900 print:outline-none print:ring-0 print:bg-transparent`}
        style={mergedStyle}
        onClick={() => {
          setShowSizeTooltip(true)
        }}
        onFocus={() => {
          isFocused.current = true
          setShowSizeTooltip(true)
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          isFocused.current = false
          setTimeout(() => setShowSizeTooltip(false), 250)
          const text = (e.currentTarget.innerText || '').trim()
          setCurrentVal(text)
          if (text !== value) {
            onSave?.(text)
          }
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === 'Enter' && !multiline) {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      >
        {currentVal || placeholder}
      </Tag>

      {/* Floating Font Size (A- / A+) Toolbar on Click/Focus */}
      {editable && showSizeTooltip && (
        <span
          contentEditable={false}
          onMouseDown={e => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className={`absolute z-50 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/95 text-white rounded-lg shadow-2xl text-xs whitespace-nowrap border border-slate-700 pointer-events-auto print:hidden select-none animate-in fade-in zoom-in-95 ${
            tooltipPosition === 'top'
              ? '-top-9 left-1/2 -translate-x-1/2'
              : 'top-full mt-1.5 left-1/2 -translate-x-1/2'
          }`}
        >
          <span className="text-[9.5px] text-slate-300 font-bold uppercase tracking-wider">
            {fontSizeControl?.label || 'Font'}:
          </span>
          <button
            type="button"
            title="Make font smaller (A-)"
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
              handleSizeChange(-1)
            }}
            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-300 font-black text-xs flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
          >
            A-
          </button>
          <span className="font-mono font-black text-emerald-400 text-xs px-1 min-w-[32px] text-center">
            {currentFontSize}px
          </span>
          <button
            type="button"
            title="Make font bigger (A+)"
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
              handleSizeChange(1)
            }}
            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-300 font-black text-xs flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
          >
            A+
          </button>
          <button
            type="button"
            title="Close"
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
              setShowSizeTooltip(false)
            }}
            className="w-4 h-4 ml-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
          >
            ×
          </button>
        </span>
      )}
    </span>
  )
}

export const AdmitCardPaper: React.FC<AdmitCardPaperProps> = ({
  card,
  customSubjects,
  className = '',
  editable = true,
  onUpdateField,
  onUpdateSubject
}) => {
  if (!card) return null

  // Lookup timetable subjects
  const timetables = getStoredTimetables()
  const table = timetables.find(t => t.id === Number(card.timeTableId))
  const subjects = (customSubjects && customSubjects.length > 0)
    ? customSubjects
    : (table && table.subjects && table.subjects.length > 0)
      ? table.subjects
      : [
        { subjectName: 'English Core', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Mathematics', date: '2025-03-23', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'General Science', date: '2025-03-25', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Social Science', date: '2025-03-27', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Hindi / Regional', date: '2025-03-29', fromTime: '10:00', toTime: '13:00' }
      ]

  const fields = card.displayFields || {}

  // Helper to accurately determine field visibility from checkboxes
  const isFieldVisible = (key: string): boolean => {
    if (key === 'gateClosure') return true
    if (fields && typeof fields[key] === 'boolean') {
      return fields[key]
    }
    const defaults: { [k: string]: boolean } = {
      name: true,
      fatherName: true,
      motherName: true,
      mobileNo: false,
      admissionNo: true,
      registrationNo: true,
      rollNo: true,
      enrollmentNo: false,
      dob: true,
      address: true,
      class: true,
      section: true,
      photo: true,
      logo: true,
      qrCode: true,
      studentSign: true,
      teacherSign: true,
      principalSign: true,
      parentSign: true,
      affiliationDetails: true,
      boardFormat: true,
      verifiedPass: true,
      centerCode: true,
      helpline: true,
      mottoQuote: true,
      gateClosure: true
    }
    return defaults[key] ?? true
  }

  // Determine template style type (normalize for backwards compatibility)
  const styleRaw = (card.templateStyle || 'Classic Board').toLowerCase()
  let templateType: 'classic' | 'modern' | 'executive' | 'compact' = 'classic'
  if (styleRaw.includes('modern') || styleRaw.includes('emerald') || styleRaw.includes('split') || styleRaw.includes('dual')) {
    templateType = 'modern'
  } else if (styleRaw.includes('executive') || styleRaw.includes('crimson') || styleRaw.includes('heritage') || styleRaw.includes('crest')) {
    templateType = 'executive'
  } else if (styleRaw.includes('compact') || styleRaw.includes('minimal') || styleRaw.includes('slate') || styleRaw.includes('ticket')) {
    templateType = 'compact'
  }

  // Determine Theme Color (respect explicit themeColor, or fallback to historical default)
  let primaryColor = card.themeColor
  if (!primaryColor) {
    if (styleRaw.includes('emerald')) primaryColor = '#047857'
    else if (styleRaw.includes('crimson')) primaryColor = '#991b1b'
    else if (styleRaw.includes('slate')) primaryColor = '#334155'
    else primaryColor = '#1e3a8a'
  }

  const bgTintLight = hexToRgba(primaryColor, 0.05)
  const bgTintMedium = hexToRgba(primaryColor, 0.1)
  const bgTintSubtle = hexToRgba(primaryColor, 0.03)
  const borderTint = hexToRgba(primaryColor, 0.25)
  const borderTintStrong = hexToRgba(primaryColor, 0.5)
  const primary = primaryColor
  const tintLight = bgTintLight

  const schoolName = card.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress = card.schoolAddress || 'Knowledge Park, Sector 62, New Delhi - 110092'
  const examName = card.examName || 'Final Term Examination'
  const session = card.session || '2025-2026'
  const classNameStr = card.className || 'Class X'
  const admitLabel = card.admitCardLabel || 'ADMIT CARD • HALL TICKET'
  const reportingTimeValue = card.reportingTimeValue || '09:30 AM IST'
  const gateClosureValue = card.gateClosureValue || '09:50 AM (Sharp)'
  const defaultPointOne = `1. Reporting & Gate Closure Time: Candidates must report to the examination center by ${reportingTimeValue}. Gate closure time is ${gateClosureValue}.`
  const rawInstructions = card.instructions !== undefined && card.instructions !== null ? card.instructions :
    `${defaultPointOne}\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.`

  const instructions = useMemo(() => {
    const timeStr = (reportingTimeValue && reportingTimeValue.trim()) ? reportingTimeValue.trim() : '09:30 AM IST'
    const gateStr = (gateClosureValue && gateClosureValue.trim()) ? gateClosureValue.trim() : '09:50 AM (Sharp)'
    const pointOne = `1. Reporting & Gate Closure Time: Candidates must report to the examination center by ${timeStr}. Gate closure time is ${gateStr}.`
    if (!rawInstructions || !rawInstructions.trim()) {
      return `${pointOne}\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.`
    }
    const lines = rawInstructions.split('\n')
    if (lines[0] && (
      lines[0].toLowerCase().includes('reporting') ||
      lines[0].toLowerCase().includes('gate closure') ||
      lines[0].toLowerCase().includes('candidates must') ||
      lines[0].toLowerCase().includes('30 minute')
    )) {
      lines[0] = pointOne
      return lines.join('\n')
    }
    return rawInstructions
  }, [rawInstructions, reportingTimeValue, gateClosureValue])

  const principalName = card.principalName || ''
  const studentSignTitle = card.studentSignLabel || "Candidate Sign"
  const teacherSignTitle = card.teacherSignLabel || "Teacher Sign"
  const parentSignTitle = card.parentSignLabel || "Parent Sign"
  const principalSignTitle = card.principalSignLabel || "Principal Sign & Seal"
  const showTimetable = card.showExamTimeTable !== false

  // All primary labels are editable live so the user can customize template headers/labels
  const [labels, setLabels] = useState<Record<string, string>>({
    estd: 'ESTD',
    estdYear: '2010',
    boardFormat: 'Board Format',
    affTo: 'Aff. To :',
    schoolCode: 'School Code :',
    affNo: 'Aff. No. :',
    udiseCode: 'UDISE Code :',
    email: 'Email :',
    helpline: 'Helpline :',
    qrCodeText: 'CODE: 123456',
    specimenSign: 'Specimen Sign',
    studentPhoto: 'Student Photo',
    examTitle: 'EXAMINATION :',
    sessionTitle: 'ACADEMIC SESSION :',
    centerCode: 'Center :',
    admissionNo: 'Admission No. :',
    registrationNo: 'Registration No. :',
    rollNo: 'Roll No. :',
    enrollmentNo: 'Enrollment No. :',
    name: 'Candidate Name :',
    fatherName: 'Father Name :',
    motherName: 'Mother Name :',
    class: 'Class :',
    section: 'Section :',
    dob: 'Date of Birth :',
    mobileNo: 'Mobile No. :',
    address: 'Exam Center Address :',
    timetableHeading: 'EXAMINATION DATE SHEET & TIME TABLE',
    thSNo: 'S.No.',
    thDate: 'Exam Date',
    thTime: 'Time Slot',
    thSubject: 'Subject / Paper',
    thInvigilator: 'Invigilator Sign',
    instructionsHeading: 'Important Candidate Instructions:',
    noteLabel: 'Note:',
    reportingTime: 'Reporting Time',
    gateClosure: 'Gate Closure',
    stubTitle: 'Detachable Invigilator Attendance Slip',
    stubHallCopy: 'Exam Hall Copy',
    verifiedPass: 'Verified Pass',
    activeBadge: 'ACTIVE',
    ...(card.customLabels || {})
  })

  useEffect(() => {
    if (card.customLabels) {
      setLabels(prev => ({ ...prev, ...card.customLabels }))
    }
  }, [card.customLabels])

  const updateLabel = (key: string, val: string) => {
    setLabels(prev => {
      const updated = { ...prev, [key]: val }
      onUpdateField?.('customLabels', updated)
      return updated
    })
  }

  // Specimen student data (static display, not editable)
  const specimenStudent = {
    name: 'Aarav Sharma',
    rollNo: '10104',
    admissionNo: 'ADM-2025-089',
    registrationNo: 'REG-2025-9842',
    enrollmentNo: 'ENR-884920',
    fatherName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    dob: '15/08/2010',
    mobileNo: '+91 98765 43210',
    address: 'H.No. 45, Green Avenue, Knowledge Park, New Delhi - 110092',
    className: card.className || 'Class X',
    section: 'Section A',
    affiliateTo: 'Central Board of Secondary Education',
    schoolCode: '123456',
    affNo: '2130842',
    udiseCode: '09100201923',
    email: 'contact@cosmopolitan.edu',
    phone: '+91 11 2345 6789 / 9999999999',
    centerCode: 'CC-104',
    centerName: 'Cosmopolitan Examination Center'
  }

  const logoPosition: 'left' | 'center' | 'right' = (card.logoPosition as any) || 'left'
  const contentPosition: 'left' | 'center' | 'right' = (card.contentPosition as any) || 'left'
  const photoPosition: 'right' | 'left' = (card.photoPosition as any) || 'right'

  const photoWidth = card.studentPhotoWidth ? Number(card.studentPhotoWidth) : (card.studentPhotoSize ? Number(card.studentPhotoSize) : 88)
  const photoHeight = card.studentPhotoHeight ? Number(card.studentPhotoHeight) : Math.round(photoWidth * 1.25)
  const logoWidth = card.schoolLogoWidth ? Number(card.schoolLogoWidth) : 54
  const logoHeight = card.schoolLogoHeight ? Number(card.schoolLogoHeight) : logoWidth
  const schoolLogo = card.schoolLogo || ''
  const showLogo = card.displayFields?.logo !== false

  const qrCodeSize = card.qrCodeSize ? Number(card.qrCodeSize) : 68
  const signatureWidth = card.signatureWidth ? Number(card.signatureWidth) : 95
  const signatureFontSize = card.signatureFontSize
    ? (card.signatureFontSize.toString().endsWith('px') ? card.signatureFontSize : `${card.signatureFontSize}px`)
    : undefined

  // Intelligent scaling helper that prevents legacy 30px address or 18px instructions from distorting any template
  const parseSizeWithClamp = (val: any, defaultVal: number, min: number, max: number): string => {
    if (!val) return `${defaultVal}px`
    const num = parseFloat(val.toString())
    if (isNaN(num)) return `${defaultVal}px`
    if (num > max) return `${defaultVal}px`
    if (num < min) return `${min}px`
    return `${num}px`
  }

  const headerNameFontSize = parseSizeWithClamp(card.headerNameFontSize, 22, 14, 32)
  const headerDetailsFontSize = parseSizeWithClamp(card.headerDetailsFontSize, 10, 8, 16)
  const headingFontSize = parseSizeWithClamp(card.headingFontSize, 13, 10, 20)
  const studentDetailsFontSize = parseSizeWithClamp(card.studentDetailsFontSize, 11, 8.5, 15)
  const timetableDetailsFontSize = parseSizeWithClamp(card.timetableDetailsFontSize, 11, 8.5, 15)
  const instructionsFontSize = parseSizeWithClamp(card.defaultFontSize, 8.5, 7, 13)

  const renderInteractiveLogo = (customClass?: string) => {
    if (!showLogo) return null
    return (
      <div
        onClick={() => {
          if (editable) onUpdateField?.('triggerLogoUpload', true)
        }}
        title={editable ? 'Click to upload or change institute logo' : undefined}
        className={`shrink-0 flex items-center justify-center relative group ${customClass || ''} ${
          editable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg p-0.5 transition-all' : ''
        }`}
      >
        {schoolLogo ? (
          <img
            src={schoolLogo}
            alt="School Logo"
            style={{ width: `${logoWidth}px`, height: `${logoHeight}px`, objectFit: 'contain' }}
            className="rounded-lg object-contain shadow-2xs"
          />
        ) : (
          <SampleSchoolLogo width={logoWidth} height={logoHeight} color={primaryColor} />
        )}
        {editable && (
          <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-lg flex flex-col items-center justify-center text-[7.5px] font-bold transition-opacity">
            <Upload className="w-3.5 h-3.5 mb-0.5" />
            <span>Change</span>
          </div>
        )}
      </div>
    )
  }

  const orderList = Array.isArray(card.signatureOrder) && card.signatureOrder.length > 0
    ? card.signatureOrder.filter(k => k !== 'schoolStamp')
    : ['studentSign', 'parentSign', 'teacherSign', 'principalSign']

  const signDefinitions: Record<string, { key: string; label: string; name?: string }> = {
    principalSign: { key: 'principalSign', label: principalSignTitle, name: principalName },
    teacherSign: { key: 'teacherSign', label: teacherSignTitle },
    studentSign: { key: 'studentSign', label: studentSignTitle },
    parentSign: { key: 'parentSign', label: parentSignTitle }
  }

  const activeSigns: { key: string; label: string; name?: string }[] = []
  for (const k of orderList) {
    if (isFieldVisible(k) && signDefinitions[k]) {
      activeSigns.push(signDefinitions[k])
    }
  }
  for (const k of Object.keys(signDefinitions)) {
    if (isFieldVisible(k) && !orderList.includes(k)) {
      activeSigns.push(signDefinitions[k])
    }
  }

  return (
    <div
      id="printable-admit-card-container"
      className={`w-full max-w-[800px] bg-white text-slate-900 flex flex-col font-sans shrink-0 relative shadow-2xl rounded-2xl print:shadow-none print:rounded-none overflow-hidden ${className}`}
    >
      {/* ========================================================================= */}
      {/* TEMPLATE 1: CLASSIC BOARD OFFICIAL (CBSE / State Board Official Style)    */}
      {/* ========================================================================= */}
      {templateType === 'classic' && (
        <div
          className="p-6 sm:p-7 flex flex-col relative"
          style={{
            border: `3px double ${primaryColor}`,
            boxShadow: `inset 0 0 0 1px ${borderTint}`
          }}
        >
          {/* Header */}
          <div
            className={`flex ${
              logoPosition === 'center'
                ? 'flex-col items-center text-center'
                : logoPosition === 'right'
                ? 'flex-row-reverse justify-between items-center'
                : 'flex-row justify-between items-center'
            } border-b-2 pb-3 mb-3 gap-3.5`}
            style={{ borderColor: borderTintStrong }}
          >
            <div
              className={`flex items-center gap-3.5 ${
                logoPosition === 'right' ? 'flex-row-reverse' : ''
              } ${
                contentPosition === 'center'
                  ? 'items-center text-center'
                  : contentPosition === 'right'
                  ? 'items-end text-right'
                  : 'items-start text-left'
              }`}
            >
              {renderInteractiveLogo()}

              <div className={contentPosition === 'center' ? 'text-center' : contentPosition === 'right' ? 'text-right' : 'text-left'}>
                <LiveEditableText
                  tag="h1"
                  value={schoolName}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolName', val)}
                  className="text-xl sm:text-2xl font-black uppercase tracking-wide block leading-snug"
                  style={{ color: primaryColor, fontSize: headerNameFontSize }}
                  fontSizeControl={{
                    label: 'School Heading',
                    value: headerNameFontSize ? parseInt(headerNameFontSize) : 24,
                    onChange: val => onUpdateField?.('headerNameFontSize', val)
                  }}
                />
                <LiveEditableText
                  tag="p"
                  value={schoolAddress}
                  editable={editable}
                  onSave={val => onUpdateField?.('schoolAddress', val)}
                  className="text-[10.5px] font-semibold text-slate-600 leading-tight block mt-0.5"
                  style={{ fontSize: headerDetailsFontSize }}
                  fontSizeControl={{
                    label: 'Address',
                    value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 10.5,
                    onChange: val => onUpdateField?.('headerDetailsFontSize', val)
                  }}
                />

                {isFieldVisible('affiliationDetails') && (
                  <div className={`grid grid-cols-2 gap-x-5 gap-y-0.5 text-[9px] font-bold text-slate-700 mt-1.5 ${contentPosition === 'center' ? 'text-center' : contentPosition === 'right' ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <LiveEditableText value={labels.affTo || 'Aff. To :'} editable={editable} onSave={val => updateLabel('affTo', val)} className="inline-block shrink-0" />{' '}
                      <span className="text-slate-800 font-semibold">{specimenStudent.affiliateTo}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <LiveEditableText value={labels.schoolCode || 'School Code :'} editable={editable} onSave={val => updateLabel('schoolCode', val)} className="inline-block shrink-0" />{' '}
                      <span className="text-slate-800 font-semibold">{specimenStudent.schoolCode}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <LiveEditableText value={labels.affNo || 'Aff. No. :'} editable={editable} onSave={val => updateLabel('affNo', val)} className="inline-block shrink-0" />{' '}
                      <span className="text-slate-800 font-semibold">{specimenStudent.affNo}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <LiveEditableText value={labels.udiseCode || 'UDISE Code :'} editable={editable} onSave={val => updateLabel('udiseCode', val)} className="inline-block shrink-0" />{' '}
                      <span className="text-slate-800 font-semibold">{specimenStudent.udiseCode}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {isFieldVisible('boardFormat') && (
                <LiveEditableText
                  value={labels.boardFormat || 'Board Format'}
                  editable={editable}
                  onSave={val => updateLabel('boardFormat', val)}
                  className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-xs inline-block"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
              {isFieldVisible('qrCode') && (
                <div className="bg-white p-1 rounded-md border border-slate-300 shadow-2xs flex flex-col items-center">
                  <ProperQrCode size={qrCodeSize} color={primaryColor} />
                  <LiveEditableText
                    value={labels.qrCodeText || 'CODE: 123456'}
                    editable={editable}
                    onSave={val => updateLabel('qrCodeText', val)}
                    className="text-[7.5px] text-slate-500 font-bold font-mono tracking-wider inline-block mt-0.5"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sub Header Contact */}
          {(isFieldVisible('email') || isFieldVisible('helpline') || isFieldVisible('mobileNo')) && (
            <div className="flex justify-center gap-6 text-[9.5px] font-bold text-slate-600 border-b pb-1.5 mb-3" style={{ borderColor: borderTint }}>
              {isFieldVisible('email') && (
                <span>
                  <LiveEditableText value={labels.email || 'Email :'} editable={editable} onSave={val => updateLabel('email', val)} className="inline-block" />{' '}
                  <span className="font-normal text-slate-700">{specimenStudent.email}</span>
                </span>
              )}
              {isFieldVisible('email') && (isFieldVisible('helpline') || isFieldVisible('mobileNo')) && <span>•</span>}
              {(isFieldVisible('helpline') || isFieldVisible('mobileNo')) && (
                <span>
                  <LiveEditableText value={labels.helpline || 'Helpline :'} editable={editable} onSave={val => updateLabel('helpline', val)} className="inline-block" />{' '}
                  <span className="font-normal text-slate-700">{specimenStudent.phone}</span>
                </span>
              )}
            </div>
          )}

          {/* Title Banner */}
          <div className="text-center my-1.5">
            <div
              className="inline-block px-8 py-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <LiveEditableText
                tag="h2"
                value={admitLabel}
                editable={editable}
                onSave={val => onUpdateField?.('admitCardLabel', val)}
                className="text-sm sm:text-base font-black tracking-widest uppercase text-white inline-block"
                style={{ fontSize: headingFontSize }}
                fontSizeControl={{
                  label: 'Admit Title',
                  value: headingFontSize ? parseInt(headingFontSize) : 14,
                  onChange: val => onUpdateField?.('headingFontSize', val)
                }}
              />
            </div>
          </div>

          {/* Term & Session info bar (LABELS AND EXAM/SESSION ARE EDITABLE) */}
          <div
            className="flex flex-wrap justify-between items-center text-[11px] font-black uppercase mb-3.5 px-3 py-1.5 rounded-lg border gap-2"
            style={{
              backgroundColor: bgTintLight,
              borderColor: borderTint,
              color: primaryColor
            }}
          >
            <span>
              <LiveEditableText value={labels.examTitle || 'EXAMINATION :'} editable={editable} onSave={val => updateLabel('examTitle', val)} className="inline-block" />{' '}
              <LiveEditableText value={examName} editable={editable} onSave={val => onUpdateField?.('examName', val)} className="inline-block ml-1" />
            </span>
            {isFieldVisible('gateClosure') && (
              <span className="flex items-center gap-1">
                <LiveEditableText value={labels.gateClosure || 'Gate Closure :'} editable={editable} onSave={val => updateLabel('gateClosure', val)} className="inline-block text-rose-500 font-bold" />{' '}
                <LiveEditableText value={gateClosureValue} editable={editable} onSave={val => onUpdateField?.('gateClosureValue', val)} className="inline-block font-extrabold text-rose-700" />
              </span>
            )}
            <span>
              <LiveEditableText value={labels.sessionTitle || 'ACADEMIC SESSION :'} editable={editable} onSave={val => updateLabel('sessionTitle', val)} className="inline-block" />{' '}
              <LiveEditableText value={session} editable={editable} onSave={val => onUpdateField?.('session', val)} className="inline-block ml-1" />
            </span>
          </div>

          {/* Student Details (PRIMARY LABELS ARE EDITABLE, DUMMY SPECIMEN DATA IS STATIC) */}
          <div className={`flex gap-4 items-start mb-4 ${photoPosition === 'left' ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-slate-800" style={{ fontSize: studentDetailsFontSize }}>
              {isFieldVisible('admissionNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.admissionNo || 'Admission No. :'}
                    editable={editable}
                    onSave={val => updateLabel('admissionNo', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-900 px-1 whitespace-nowrap">
                    {specimenStudent.admissionNo}
                  </span>
                </div>
              )}

              {isFieldVisible('registrationNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.registrationNo || 'Registration No. :'}
                    editable={editable}
                    onSave={val => updateLabel('registrationNo', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-900 px-1 whitespace-nowrap">
                    {specimenStudent.registrationNo}
                  </span>
                </div>
              )}

              {isFieldVisible('rollNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.rollNo || 'Roll No. :'}
                    editable={editable}
                    onSave={val => updateLabel('rollNo', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1 whitespace-nowrap" style={{ color: primaryColor }}>
                    {specimenStudent.rollNo}
                  </span>
                </div>
              )}

              {isFieldVisible('enrollmentNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.enrollmentNo || 'Enrollment No. :'}
                    editable={editable}
                    onSave={val => updateLabel('enrollmentNo', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-900 px-1 whitespace-nowrap">
                    {specimenStudent.enrollmentNo}
                  </span>
                </div>
              )}

              {isFieldVisible('name') && (
                <div className="flex items-center col-span-2 min-w-0">
                  <LiveEditableText
                    value={labels.name || 'Candidate Name :'}
                    editable={editable}
                    onSave={val => updateLabel('name', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-sm px-1 truncate" style={{ color: primaryColor }}>
                    {specimenStudent.name}
                  </span>
                </div>
              )}

              {isFieldVisible('fatherName') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.fatherName || 'Father Name :'}
                    editable={editable}
                    onSave={val => updateLabel('fatherName', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1 truncate">
                    {specimenStudent.fatherName}
                  </span>
                </div>
              )}

              {isFieldVisible('motherName') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.motherName || 'Mother Name :'}
                    editable={editable}
                    onSave={val => updateLabel('motherName', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1 truncate">
                    {specimenStudent.motherName}
                  </span>
                </div>
              )}

              {isFieldVisible('class') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.class || 'Class :'}
                    editable={editable}
                    onSave={val => updateLabel('class', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1 whitespace-nowrap">
                    {classNameStr}
                  </span>
                </div>
              )}

              {isFieldVisible('section') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.section || 'Section :'}
                    editable={editable}
                    onSave={val => updateLabel('section', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-black text-slate-900 px-1 whitespace-nowrap">
                    {specimenStudent.section}
                  </span>
                </div>
              )}

              {isFieldVisible('dob') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.dob || 'Date of Birth :'}
                    editable={editable}
                    onSave={val => updateLabel('dob', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1 whitespace-nowrap">
                    {specimenStudent.dob}
                  </span>
                </div>
              )}

              {isFieldVisible('mobileNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.mobileNo || 'Mobile No. :'}
                    editable={editable}
                    onSave={val => updateLabel('mobileNo', val)}
                    className="font-extrabold whitespace-nowrap inline-block shrink-0"
                  />
                  <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 font-bold text-slate-700 px-1 whitespace-nowrap">
                    {specimenStudent.mobileNo}
                  </span>
                </div>
              )}

              {isFieldVisible('address') && (
                <div className="flex items-center col-span-2 min-w-0 py-0.5 px-1.5 rounded" style={{ backgroundColor: tintLight }}>
                  <LiveEditableText
                    value={labels.address || 'Exam Center Address :'}
                    editable={editable}
                    onSave={val => updateLabel('address', val)}
                    className="font-black whitespace-nowrap inline-block shrink-0 text-[10.5px]"
                    style={{ color: primary }}
                  />
                  <span className="flex-1 border-b border-dashed ml-1.5 text-[11px] font-extrabold px-1 truncate" style={{ color: primary, borderColor: borderTint }}>
                    {schoolAddress}
                  </span>
                </div>
              )}
            </div>

            {/* Photo Box with Specimen Signature underneath */}
            {isFieldVisible('photo') && (
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="bg-slate-50 border-2 rounded flex flex-col items-center justify-center text-[9px] text-slate-400 font-bold shrink-0 shadow-xs relative overflow-hidden"
                  style={{
                    width: `${photoWidth}px`,
                    height: `${photoHeight}px`,
                    borderColor: borderTintStrong
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-300 p-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 mb-1" />
                    <LiveEditableText
                      value={labels.studentPhoto || 'Student Photo'}
                      editable={editable}
                      onSave={val => updateLabel('studentPhoto', val)}
                      className="text-[8px] uppercase font-bold text-slate-500 inline-block"
                    />
                  </div>
                </div>
                {isFieldVisible('studentSign') && (
                  <div
                    className="py-1 border text-center text-[7.5px] font-black uppercase text-slate-600 rounded bg-slate-50"
                    style={{ width: `${photoWidth}px`, borderColor: borderTint }}
                  >
                    <LiveEditableText
                      value={labels.specimenSign || 'Specimen Sign'}
                      editable={editable}
                      onSave={val => updateLabel('specimenSign', val)}
                      className="inline-block"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Table (HEADING AND TABLE COLUMN HEADERS ARE EDITABLE LABELS) */}
          {showTimetable && (
            <div className="space-y-1.5 mt-1">
              <div
                className="text-center font-black text-[11px] tracking-widest uppercase py-1 rounded"
                style={{ backgroundColor: bgTintMedium, color: primaryColor }}
              >
                <LiveEditableText
                  value={labels.timetableHeading || 'EXAMINATION DATE SHEET & TIME TABLE'}
                  editable={editable}
                  onSave={val => updateLabel('timetableHeading', val)}
                  className="inline-block"
                />
              </div>

              <div className="border rounded-lg overflow-hidden" style={{ borderColor: borderTintStrong }}>
                <table className="w-full text-xs text-center border-collapse" style={{ fontSize: timetableDetailsFontSize }}>
                  <thead>
                    <tr className="font-black text-white text-[11px]" style={{ backgroundColor: primaryColor, fontSize: timetableDetailsFontSize }}>
                      <th className="py-2 px-2 border-r border-white/20 w-12">
                        <LiveEditableText value={labels.thSNo || 'S.No.'} editable={editable} onSave={val => updateLabel('thSNo', val)} />
                      </th>
                      <th className="py-2 px-3 border-r border-white/20 w-28">
                        <LiveEditableText value={labels.thDate || 'Exam Date'} editable={editable} onSave={val => updateLabel('thDate', val)} />
                      </th>
                      <th className="py-2 px-3 border-r border-white/20 w-32">
                        <LiveEditableText value={labels.thTime || 'Time Slot'} editable={editable} onSave={val => updateLabel('thTime', val)} />
                      </th>
                      <th className="py-2 px-3 border-r border-white/20 text-left">
                        <LiveEditableText value={labels.thSubject || 'Subject / Paper'} editable={editable} onSave={val => updateLabel('thSubject', val)} />
                      </th>
                      <th className="py-2 px-3 w-32">
                        <LiveEditableText value={labels.thInvigilator || 'Invigilator Sign'} editable={editable} onSave={val => updateLabel('thInvigilator', val)} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub: any, sidx: number) => (
                      <tr
                        key={sidx}
                        className="border-b font-semibold text-slate-700"
                        style={{
                          borderColor: borderTint,
                          backgroundColor: sidx % 2 === 0 ? 'transparent' : bgTintSubtle,
                          fontSize: timetableDetailsFontSize
                        }}
                      >
                        <td className="py-1.5 border-r font-bold" style={{ borderColor: borderTint }}>{sidx + 1}.</td>
                        <td className="py-1.5 border-r font-bold text-slate-900" style={{ borderColor: borderTint }}>
                          {sub.date}
                        </td>
                        <td className="py-1.5 border-r text-slate-600" style={{ borderColor: borderTint }}>
                          {sub.fromTime} - {sub.toTime || '13:00'}
                        </td>
                        <td className="py-1.5 px-3 border-r text-left text-slate-900 font-bold" style={{ borderColor: borderTint }}>
                          {sub.subjectName}
                        </td>
                        <td className="py-1.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructions && (
            <div
              className="mt-3 p-2.5 rounded-lg border text-[9px] text-slate-700 leading-relaxed"
              style={{ backgroundColor: bgTintSubtle, borderColor: borderTint, fontSize: instructionsFontSize }}
            >
              <LiveEditableText
                value={labels.instructionsHeading || 'Important Candidate Instructions:'}
                editable={editable}
                onSave={val => updateLabel('instructionsHeading', val)}
                className="font-black uppercase inline-block"
                style={{ color: primaryColor, fontSize: instructionsFontSize }}
              />
              <LiveEditableText
                tag="p"
                multiline
                value={instructions}
                editable={editable}
                onSave={val => onUpdateField?.('instructions', val)}
                className="mt-0.5 whitespace-pre-line text-slate-600 block"
                style={{ fontSize: instructionsFontSize }}
              />
            </div>
          )}

          {/* Dynamic Signatures */}
          {activeSigns.length > 0 && (
            <div
              className="flex justify-between items-end gap-3 text-center mt-7 pb-1 text-[8.5px] font-black uppercase text-slate-700"
              style={{ fontSize: signatureFontSize }}
            >
              {activeSigns.map(s => (
                <div key={s.key} className="flex-1 flex flex-col items-center min-w-[70px]">
                  <div className="mb-1.5 min-h-[24px] flex flex-col items-center justify-end" style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}>
                    <div className="w-full h-0.5 border-t border-dashed border-slate-400" />
                  </div>
                  <LiveEditableText
                    value={s.label}
                    editable={editable}
                    onSave={val => onUpdateField?.(s.key + 'Label', val)}
                    className="truncate max-w-[130px] inline-block"
                    style={{ fontSize: signatureFontSize }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 2: MODERN DUAL-COLUMN PASS (Academy Split-Column Format)          */}
      {/* ========================================================================= */}
      {templateType === 'modern' && (
        <div className="flex flex-col min-h-[580px] border-2 bg-white" style={{ borderColor: primaryColor }}>
          {/* Main Dual-Column Body */}
          <div className="flex flex-col sm:flex-row flex-1">
            {/* Left Column Profile Sidebar */}
            <div
              className="w-full sm:w-64 p-5 flex flex-col justify-start border-b sm:border-b-0 sm:border-r"
              style={{
                backgroundColor: bgTintLight,
                borderColor: borderTintStrong
              }}
            >
              <div className="space-y-4">
              {/* Badge */}
              <div className="flex items-center justify-between">
                {isFieldVisible('verifiedPass') && (
                  <LiveEditableText
                    value={labels.verifiedPass || 'Verified Pass'}
                    editable={editable}
                    onSave={val => updateLabel('verifiedPass', val)}
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-xs inline-block"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
                {isFieldVisible('admissionNo') && (
                  <span className="text-[9px] font-black text-slate-500 font-mono">
                    #{specimenStudent.admissionNo}
                  </span>
                )}
              </div>

              {/* Photo */}
              {isFieldVisible('photo') && (
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-xl border-2 p-1 bg-white shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      width: `${photoWidth}px`,
                      height: `${photoHeight}px`,
                      borderColor: primaryColor
                    }}
                  >
                    <div className="w-full h-full rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-dashed border-slate-300 text-center p-2">
                      <User className="w-8 h-8 text-slate-400 mb-1" />
                      <LiveEditableText
                        value={labels.studentPhoto || 'Student Photo'}
                        editable={editable}
                        onSave={val => updateLabel('studentPhoto', val)}
                        className="text-[8px] font-bold text-slate-500 uppercase inline-block"
                      />
                    </div>
                    <div
                      className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded text-[7px] font-black text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      ACTIVE
                    </div>
                  </div>
                </div>
              )}

              {/* Roll No Callout Box */}
              {isFieldVisible('rollNo') && (
                <div
                  className="rounded-xl p-3 text-center text-white shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                    <LiveEditableText
                      value={labels.rollNo || 'Roll Number'}
                      editable={editable}
                      onSave={val => updateLabel('rollNo', val)}
                      className="inline-block"
                    />
                  </div>
                  <div className="text-xl font-black tracking-widest mt-0.5">
                    {specimenStudent.rollNo}
                  </div>
                  {(isFieldVisible('class') || isFieldVisible('section')) && (
                    <div className="text-[10px] font-bold text-white/90 mt-1 pt-1 border-t border-white/20">
                      {isFieldVisible('class') ? classNameStr : ''}
                      {isFieldVisible('class') && isFieldVisible('section') ? ' • ' : ''}
                      {isFieldVisible('section') ? 'Sec A' : ''}
                    </div>
                  )}
                </div>
              )}

              {/* QR Code Verification */}
              {isFieldVisible('qrCode') && (
                <div className="bg-white p-2.5 rounded-xl border flex flex-col items-center gap-1.5 shadow-xs" style={{ borderColor: borderTint }}>
                  <ProperQrCode size={qrCodeSize} color={primaryColor} />
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-600 text-center">Scan to Verify Candidate Record</span>
                  <LiveEditableText
                    value={labels.qrCodeText || 'CODE: 123456'}
                    editable={editable}
                    onSave={val => updateLabel('qrCodeText', val)}
                    className="text-[7px] text-slate-400 font-bold font-mono inline-block"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white">
            <div>
              {/* Header */}
              <div className="border-b pb-3 mb-3" style={{ borderColor: borderTint }}>
                <div
                  className={`flex items-center justify-between gap-3 ${
                    logoPosition === 'right' ? 'flex-row-reverse' : ''
                  } ${
                    contentPosition === 'center' || logoPosition === 'center'
                      ? 'flex-col sm:flex-row justify-center'
                      : ''
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      logoPosition === 'right' ? 'flex-row-reverse' : ''
                    } ${
                      contentPosition === 'center'
                        ? 'text-center items-center'
                        : contentPosition === 'right'
                        ? 'text-right items-end'
                        : 'text-left items-start'
                    }`}
                  >
                    {renderInteractiveLogo()}
                    <div className={contentPosition === 'center' ? 'text-center' : contentPosition === 'right' ? 'text-right' : 'text-left'}>
                      <LiveEditableText
                        tag="h1"
                        value={schoolName}
                        editable={editable}
                        onSave={val => onUpdateField?.('schoolName', val)}
                        className="text-lg sm:text-xl font-black uppercase tracking-tight block"
                        style={{ color: primaryColor, fontSize: headerNameFontSize }}
                        fontSizeControl={{
                          label: 'School Heading',
                          value: headerNameFontSize ? parseInt(headerNameFontSize) : 22,
                          onChange: val => onUpdateField?.('headerNameFontSize', val)
                        }}
                      />
                      <LiveEditableText
                        tag="p"
                        value={schoolAddress}
                        editable={editable}
                        onSave={val => onUpdateField?.('schoolAddress', val)}
                        className="text-[10px] text-slate-500 font-semibold block mt-0.5"
                        style={{ fontSize: headerDetailsFontSize }}
                        fontSizeControl={{
                          label: 'Address',
                          value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 10,
                          onChange: val => onUpdateField?.('headerDetailsFontSize', val)
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-white tracking-wider inline-block"
                      style={{ backgroundColor: primaryColor, fontSize: headingFontSize }}
                    >
                      <LiveEditableText
                        value={admitLabel}
                        editable={editable}
                        onSave={val => onUpdateField?.('admitCardLabel', val)}
                        style={{ fontSize: headingFontSize }}
                        fontSizeControl={{
                          label: 'Admit Title',
                          value: headingFontSize ? parseInt(headingFontSize) : 13,
                          onChange: val => onUpdateField?.('headingFontSize', val)
                        }}
                      />
                    </span>
                    <div className="text-[9px] font-bold text-slate-500 mt-1">
                      <LiveEditableText value={labels.sessionTitle || 'Session :'} editable={editable} onSave={val => updateLabel('sessionTitle', val)} className="inline-block" />{' '}
                      <LiveEditableText value={session} editable={editable} onSave={val => onUpdateField?.('session', val)} className="inline-block" />
                    </div>
                  </div>
                </div>

                <div
                  className="mt-2.5 px-3 py-1.5 rounded-md text-[10.5px] font-black uppercase flex flex-wrap items-center justify-between gap-2"
                  style={{ backgroundColor: bgTintMedium, color: primaryColor }}
                >
                  <span>
                    <LiveEditableText value={labels.examTitle || 'EXAM :'} editable={editable} onSave={val => updateLabel('examTitle', val)} className="inline-block" />{' '}
                    <LiveEditableText value={examName} editable={editable} onSave={val => onUpdateField?.('examName', val)} className="inline-block ml-1" />
                  </span>
                  {isFieldVisible('gateClosure') && (
                    <span className="flex items-center gap-1">
                      <LiveEditableText value={labels.gateClosure || 'Gate Closure :'} editable={editable} onSave={val => updateLabel('gateClosure', val)} className="inline-block text-rose-500 font-bold" />{' '}
                      <LiveEditableText value={gateClosureValue} editable={editable} onSave={val => onUpdateField?.('gateClosureValue', val)} className="inline-block font-extrabold text-rose-700" />
                    </span>
                  )}
                  {isFieldVisible('centerCode') && (
                    <span>
                      <LiveEditableText value={labels.centerCode || 'CENTER :'} editable={editable} onSave={val => updateLabel('centerCode', val)} className="inline-block" />{' '}
                      <span>{specimenStudent.centerCode}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Student Details Grid (PRIMARY LABELS ARE EDITABLE, DATA IS STATIC) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-4" style={{ fontSize: studentDetailsFontSize }}>
                {isFieldVisible('name') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.name || 'Student Name'} editable={editable} onSave={val => updateLabel('name', val)} className="inline-block" />
                    </div>
                    <div className="font-black text-slate-900 text-xs truncate" style={{ color: primaryColor }}>
                      {specimenStudent.name}
                    </div>
                  </div>
                )}
                {isFieldVisible('admissionNo') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.admissionNo || 'Admission No.'} editable={editable} onSave={val => updateLabel('admissionNo', val)} className="inline-block" />
                    </div>
                    <div className="font-black text-slate-800 text-xs">
                      {specimenStudent.admissionNo}
                    </div>
                  </div>
                )}
                {isFieldVisible('registrationNo') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.registrationNo || 'Registration No.'} editable={editable} onSave={val => updateLabel('registrationNo', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {specimenStudent.registrationNo}
                    </div>
                  </div>
                )}
                {isFieldVisible('enrollmentNo') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.enrollmentNo || 'Enrollment No.'} editable={editable} onSave={val => updateLabel('enrollmentNo', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {specimenStudent.enrollmentNo}
                    </div>
                  </div>
                )}
                {isFieldVisible('rollNo') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.rollNo || 'Roll No.'} editable={editable} onSave={val => updateLabel('rollNo', val)} className="inline-block" />
                    </div>
                    <div className="font-black text-slate-800 text-xs">
                      {specimenStudent.rollNo}
                    </div>
                  </div>
                )}
                {isFieldVisible('fatherName') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.fatherName || "Father's Name"} editable={editable} onSave={val => updateLabel('fatherName', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {specimenStudent.fatherName}
                    </div>
                  </div>
                )}
                {isFieldVisible('motherName') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.motherName || "Mother's Name"} editable={editable} onSave={val => updateLabel('motherName', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {specimenStudent.motherName}
                    </div>
                  </div>
                )}
                {isFieldVisible('class') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.class || 'Class'} editable={editable} onSave={val => updateLabel('class', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {classNameStr}
                    </div>
                  </div>
                )}
                {isFieldVisible('section') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.section || 'Section'} editable={editable} onSave={val => updateLabel('section', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {specimenStudent.section}
                    </div>
                  </div>
                )}
                {isFieldVisible('dob') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.dob || 'Date of Birth'} editable={editable} onSave={val => updateLabel('dob', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {specimenStudent.dob}
                    </div>
                  </div>
                )}
                {isFieldVisible('mobileNo') && (
                  <div className="p-2 rounded-lg border bg-slate-50/70" style={{ borderColor: borderTint }}>
                    <div className="text-[8.5px] font-bold text-slate-400 uppercase">
                      <LiveEditableText value={labels.mobileNo || 'Mobile No.'} editable={editable} onSave={val => updateLabel('mobileNo', val)} className="inline-block" />
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {specimenStudent.mobileNo}
                    </div>
                  </div>
                )}
                {isFieldVisible('address') && (
                  <div className="p-2 rounded-lg border col-span-2 sm:col-span-3 ring-1" style={{ borderColor: primary, backgroundColor: tintLight }}>
                    <div className="text-[9px] font-black uppercase tracking-wide" style={{ color: primary }}>
                      <LiveEditableText value={labels.address || 'Exam Center Address'} editable={editable} onSave={val => updateLabel('address', val)} className="inline-block" />
                    </div>
                    <div className="font-extrabold text-[11.5px] truncate mt-0.5" style={{ color: primary }}>
                      {schoolAddress}
                    </div>
                  </div>
                )}
              </div>

              {/* Datesheet Table (HEADERS ARE EDITABLE LABELS, DATA IS STATIC) */}
              {showTimetable && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-800 uppercase">
                    <LiveEditableText
                      value={labels.timetableHeading || 'Subject Examination Schedule'}
                      editable={editable}
                      onSave={val => updateLabel('timetableHeading', val)}
                      className="inline-block"
                    />
                    <span className="text-[8.5px] text-slate-400 font-bold">{subjects.length} Subjects Scheduled</span>
                  </div>
                  <div className="border rounded-xl overflow-hidden" style={{ borderColor: borderTintStrong, fontSize: timetableDetailsFontSize }}>
                    <table className="w-full text-xs text-left border-collapse" style={{ fontSize: timetableDetailsFontSize }}>
                      <thead>
                        <tr className="text-white text-[10px] font-black" style={{ backgroundColor: primaryColor, fontSize: timetableDetailsFontSize }}>
                          <th className="py-1.5 px-2.5">
                            <LiveEditableText value={labels.thDate || 'Date'} editable={editable} onSave={val => updateLabel('thDate', val)} />
                          </th>
                          <th className="py-1.5 px-2.5">
                            <LiveEditableText value={labels.thTime || 'Time'} editable={editable} onSave={val => updateLabel('thTime', val)} />
                          </th>
                          <th className="py-1.5 px-2.5">
                            <LiveEditableText value={labels.thSubject || 'Subject Paper'} editable={editable} onSave={val => updateLabel('thSubject', val)} />
                          </th>
                          <th className="py-1.5 px-2.5 text-center">
                            <LiveEditableText value={labels.thInvigilator || 'Invigilator'} editable={editable} onSave={val => updateLabel('thInvigilator', val)} />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: borderTint }}>
                        {subjects.map((sub: any, sidx: number) => (
                          <tr key={sidx} className="text-[11px] font-semibold text-slate-700" style={{ fontSize: timetableDetailsFontSize }}>
                            <td className="py-1 px-2.5 font-bold text-slate-900">{sub.date}</td>
                            <td className="py-1 px-2.5 text-slate-600">{sub.fromTime} - {sub.toTime || '13:00'}</td>
                            <td className="py-1 px-2.5 font-bold" style={{ color: primaryColor }}>{sub.subjectName}</td>
                            <td className="py-1 px-2.5 text-center"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Candidate Instructions */}
              {instructions && (
                <div
                  className="mt-2.5 p-2 rounded-lg border text-[8.5px] leading-relaxed"
                  style={{ backgroundColor: bgTintSubtle, borderColor: borderTint, fontSize: instructionsFontSize }}
                >
                  <LiveEditableText
                    value={labels.instructionsHeading || 'Important Candidate Instructions:'}
                    editable={editable}
                    onSave={val => updateLabel('instructionsHeading', val)}
                    className="font-black uppercase inline-block text-[8px]"
                    style={{ color: primaryColor, fontSize: instructionsFontSize }}
                  />
                  <LiveEditableText
                    tag="p"
                    multiline
                    value={instructions}
                    editable={editable}
                    onSave={val => onUpdateField?.('instructions', val)}
                    className="mt-0.5 whitespace-pre-line text-slate-600 block text-[8px]"
                    style={{ fontSize: instructionsFontSize }}
                  />
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Full-Width Bottom Signatures Strip */}
          {activeSigns.length > 0 && (
            <div
              className="px-6 py-5 border-t flex items-end justify-between gap-4 bg-slate-50/70"
              style={{ borderColor: borderTintStrong, fontSize: signatureFontSize }}
            >
              {activeSigns.map(s => (
                <div key={s.key} className="flex-1 flex flex-col items-center min-w-[70px] text-center">
                  <div className="mb-1.5 min-h-[24px] flex flex-col items-center justify-end" style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}>
                    <div className="w-full h-0.5 border-t border-dashed border-slate-400" />
                  </div>
                  <LiveEditableText
                    value={s.label}
                    editable={editable}
                    onSave={val => onUpdateField?.(s.key + 'Label', val)}
                    className="text-[8.5px] font-black uppercase text-slate-700 block truncate max-w-[140px]"
                    style={{ fontSize: signatureFontSize }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 3: EXECUTIVE HERITAGE (Crest & Formal Certificate Style)          */}
      {/* ========================================================================= */}
      {templateType === 'executive' && (
        <div
          className="p-7 relative bg-white"
          style={{
            border: `6px double ${primaryColor}`,
            boxShadow: `inset 0 0 0 2px ${borderTint}`
          }}
        >
          {/* Ornate Corner Elements */}
          <div className="absolute top-2 left-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute top-2 right-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute bottom-2 left-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>
          <div className="absolute bottom-2 right-2 text-[10px] font-serif font-black" style={{ color: primaryColor }}>◆ ❖ ◆</div>

          {/* Crest Header */}
          <div
            className={`pb-3 border-b-2 ${
              contentPosition === 'center'
                ? 'text-center'
                : contentPosition === 'right'
                ? 'text-right'
                : 'text-left'
            }`}
            style={{ borderColor: borderTintStrong }}
          >
            {showLogo && (
              <div
                className={`flex mb-2 ${
                  logoPosition === 'center'
                    ? 'justify-center'
                    : logoPosition === 'right'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  onClick={() => {
                    if (editable) onUpdateField?.('triggerLogoUpload', true)
                  }}
                  title={editable ? 'Click to upload or change institute logo' : undefined}
                  className={`rounded-full border-2 flex items-center justify-center shadow-xs overflow-hidden p-1 relative group ${
                    editable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
                  }`}
                  style={{
                    width: `${Math.max(logoWidth + 12, 56)}px`,
                    height: `${Math.max(logoHeight + 12, 56)}px`,
                    borderColor: primaryColor,
                    backgroundColor: bgTintLight,
                    color: primaryColor
                  }}
                >
                  {schoolLogo ? (
                    <img
                      src={schoolLogo}
                      alt="School Logo"
                      style={{ width: `${logoWidth}px`, height: `${logoHeight}px`, objectFit: 'contain' }}
                      className="rounded-full object-contain"
                    />
                  ) : (
                    <SampleSchoolLogo width={logoWidth} height={logoHeight} color={primaryColor} />
                  )}
                  {editable && (
                    <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-[7.5px] font-bold transition-opacity">
                      <Upload className="w-3 h-3" />
                      <span>Change</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <LiveEditableText
              tag="h1"
              value={schoolName}
              editable={editable}
              onSave={val => onUpdateField?.('schoolName', val)}
              className="text-2xl font-black uppercase tracking-wider font-serif block"
              style={{ color: primaryColor, fontSize: headerNameFontSize }}
              fontSizeControl={{
                label: 'School Heading',
                value: headerNameFontSize ? parseInt(headerNameFontSize) : 24,
                onChange: val => onUpdateField?.('headerNameFontSize', val)
              }}
            />
            {isFieldVisible('mottoQuote') && (
              <p className="text-[10px] font-serif text-slate-600 font-semibold tracking-wide mt-0.5">
                <LiveEditableText
                  value={labels.mottoQuote || 'An Autonomous Institution Committed to Academic Excellence'}
                  editable={editable}
                  onSave={val => updateLabel('mottoQuote', val)}
                  className="inline-block"
                />
              </p>
            )}
            <LiveEditableText
              tag="p"
              value={schoolAddress}
              editable={editable}
              onSave={val => onUpdateField?.('schoolAddress', val)}
              className="text-[10px] text-slate-600 font-serif font-medium mt-0.5 block"
              style={{ fontSize: headerDetailsFontSize }}
              fontSizeControl={{
                label: 'Address',
                value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 10,
                onChange: val => onUpdateField?.('headerDetailsFontSize', val)
              }}
            />

            {/* Official Title Ribbon */}
            <div className="mt-3 flex justify-center">
              <div
                className="px-6 py-1.5 rounded-full border text-white font-serif uppercase tracking-widest text-xs font-black shadow-xs"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor, fontSize: headingFontSize }}
              >
                <LiveEditableText
                  value={admitLabel}
                  editable={editable}
                  onSave={val => onUpdateField?.('admitCardLabel', val)}
                  style={{ fontSize: headingFontSize }}
                  fontSizeControl={{
                    label: 'Admit Title',
                    value: headingFontSize ? parseInt(headingFontSize) : 12,
                    onChange: val => onUpdateField?.('headingFontSize', val)
                  }}
                /> • SESSION <LiveEditableText value={session} editable={editable} onSave={val => onUpdateField?.('session', val)} />
              </div>
            </div>
            <div className="text-[11px] font-serif font-black uppercase mt-1.5 flex flex-wrap justify-center items-center gap-3" style={{ color: primaryColor }}>
              <span><LiveEditableText value={examName} editable={editable} onSave={val => onUpdateField?.('examName', val)} /></span>
              {isFieldVisible('gateClosure') && (
                <span className="text-[10px] text-rose-700 font-sans font-bold flex items-center gap-1">
                  <LiveEditableText value={labels.gateClosure || 'Gate Closure :'} editable={editable} onSave={val => updateLabel('gateClosure', val)} className="inline-block text-rose-500" />{' '}
                  <LiveEditableText value={gateClosureValue} editable={editable} onSave={val => onUpdateField?.('gateClosureValue', val)} className="inline-block font-extrabold text-rose-700" />
                </span>
              )}
            </div>
          </div>

          {/* Candidate Profile Block (PRIMARY LABELS ARE EDITABLE, DATA IS STATIC) */}
          <div
            className={`my-4 flex gap-5 items-center bg-slate-50/60 p-3.5 rounded-xl border ${
              photoPosition === 'left' ? 'flex-row-reverse' : ''
            }`}
            style={{ borderColor: borderTint }}
          >
            <div className={`flex-1 grid ${(!isFieldVisible('photo') && !isFieldVisible('qrCode')) ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-x-6 gap-y-2 text-xs`} style={{ fontSize: studentDetailsFontSize }}>
              {/* Row 1: Candidate Name Full Width Headline */}
              {isFieldVisible('name') && (
                <div className="flex items-center col-span-2 min-w-0 border-b pb-1 mb-0.5" style={{ borderColor: borderTint }}>
                  <LiveEditableText
                    value={labels.name || 'Candidate Name :'}
                    editable={editable}
                    onSave={val => updateLabel('name', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-black text-sm tracking-wide truncate ml-1" style={{ color: primaryColor }}>
                    {specimenStudent.name}
                  </span>
                </div>
              )}

              {/* Row 2: Roll No. & Admission No. */}
              {isFieldVisible('rollNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.rollNo || 'Roll No. :'}
                    editable={editable}
                    onSave={val => updateLabel('rollNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-black text-slate-900 whitespace-nowrap ml-1" style={{ color: primaryColor }}>
                    {specimenStudent.rollNo}
                  </span>
                </div>
              )}

              {isFieldVisible('admissionNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.admissionNo || 'Admission No. :'}
                    editable={editable}
                    onSave={val => updateLabel('admissionNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.admissionNo}
                  </span>
                </div>
              )}

              {/* Row 3: Registration No. & Date of Birth */}
              {isFieldVisible('registrationNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.registrationNo || 'Registration No. :'}
                    editable={editable}
                    onSave={val => updateLabel('registrationNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.registrationNo}
                  </span>
                </div>
              )}

              {isFieldVisible('dob') ? (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.dob || 'Date of Birth :'}
                    editable={editable}
                    onSave={val => updateLabel('dob', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.dob}
                  </span>
                </div>
              ) : isFieldVisible('enrollmentNo') ? (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.enrollmentNo || 'Enrollment No. :'}
                    editable={editable}
                    onSave={val => updateLabel('enrollmentNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.enrollmentNo}
                  </span>
                </div>
              ) : null}

              {/* Row 4: Class & Section */}
              {isFieldVisible('class') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.class || 'Class :'}
                    editable={editable}
                    onSave={val => updateLabel('class', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {classNameStr}
                  </span>
                </div>
              )}

              {isFieldVisible('section') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.section || 'Section :'}
                    editable={editable}
                    onSave={val => updateLabel('section', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.section}
                  </span>
                </div>
              )}

              {/* Row 5: Father's Name & Mother's Name */}
              {isFieldVisible('fatherName') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.fatherName || "Father's Name :"}
                    editable={editable}
                    onSave={val => updateLabel('fatherName', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 truncate ml-1">
                    {specimenStudent.fatherName}
                  </span>
                </div>
              )}

              {isFieldVisible('motherName') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.motherName || "Mother's Name :"}
                    editable={editable}
                    onSave={val => updateLabel('motherName', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 truncate ml-1">
                    {specimenStudent.motherName}
                  </span>
                </div>
              )}

              {/* Additional optional fields if enabled */}
              {isFieldVisible('enrollmentNo') && isFieldVisible('dob') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.enrollmentNo || 'Enrollment No. :'}
                    editable={editable}
                    onSave={val => updateLabel('enrollmentNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.enrollmentNo}
                  </span>
                </div>
              )}

              {isFieldVisible('mobileNo') && (
                <div className="flex items-center min-w-0">
                  <LiveEditableText
                    value={labels.mobileNo || 'Mobile No. :'}
                    editable={editable}
                    onSave={val => updateLabel('mobileNo', val)}
                    className="font-serif font-bold text-slate-600 whitespace-nowrap min-w-[110px] shrink-0 inline-block text-[10.5px]"
                  />
                  <span className="font-serif font-bold text-slate-800 whitespace-nowrap ml-1">
                    {specimenStudent.mobileNo}
                  </span>
                </div>
              )}

              {/* Row 6: Exam Center Address Spanning Full Width */}
              {isFieldVisible('address') && (
                <div className="flex items-center col-span-2 min-w-0 py-0.5 px-2 rounded" style={{ backgroundColor: tintLight }}>
                  <LiveEditableText
                    value={labels.address || 'Exam Center Address :'}
                    editable={editable}
                    onSave={val => updateLabel('address', val)}
                    className="font-serif font-extrabold whitespace-nowrap min-w-[140px] shrink-0 inline-block text-[10.5px]"
                    style={{ color: primary }}
                  />
                  <span className="font-serif font-bold text-[11px] truncate ml-1" style={{ color: primary }}>
                    {schoolAddress}
                  </span>
                </div>
              )}
            </div>

            {/* Photo, Proper QR & Verified Seal */}
            {(isFieldVisible('photo') || isFieldVisible('qrCode')) && (
              <div className="flex items-center gap-2.5 shrink-0">
                {isFieldVisible('photo') && (
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      className="border-2 rounded-lg bg-white flex flex-col items-center justify-center p-1 shadow-sm"
                      style={{
                        width: `${photoWidth}px`,
                        height: `${photoHeight}px`,
                        borderColor: primaryColor
                      }}
                    >
                      <div className="w-full h-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center p-1">
                        <User className="w-6 h-6 text-slate-400 mb-0.5" />
                        <LiveEditableText
                          value={labels.studentPhoto || 'Candidate Photo'}
                          editable={editable}
                          onSave={val => updateLabel('studentPhoto', val)}
                          className="text-[7px] uppercase font-bold text-slate-500 font-serif inline-block"
                        />
                      </div>
                    </div>
                    {isFieldVisible('studentSign') && (
                      <div className="border border-dashed border-slate-400 rounded px-2 py-0.5 text-center bg-white/60" style={{ width: `${photoWidth}px` }}>
                        <LiveEditableText
                          value={labels.specimenSign || 'Specimen Sign'}
                          editable={editable}
                          onSave={val => updateLabel('specimenSign', val)}
                          className="text-[7px] uppercase font-bold text-slate-500 font-serif inline-block"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Official Verification QR Code */}
                {isFieldVisible('qrCode') && (
                  <div
                    className="border-2 rounded-lg bg-white flex flex-col items-center justify-between p-1.5 shadow-sm text-center shrink-0"
                    style={{ borderColor: borderTintStrong }}
                  >
                    <span className="text-[6.5px] font-serif font-black uppercase text-slate-600 tracking-wider">OFFICIAL QR</span>
                    <ProperQrCode size={qrCodeSize} color={primaryColor} />
                    <LiveEditableText
                      value={labels.qrCodeText || 'CODE: 123456'}
                      editable={editable}
                      onSave={val => updateLabel('qrCodeText', val)}
                      className="text-[6.5px] font-mono font-bold text-slate-600 inline-block"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timetable Ledger (HEADERS ARE EDITABLE LABELS, DATA IS STATIC) */}
          {showTimetable && (
            <div className="space-y-1">
              <div className="font-serif font-bold text-xs uppercase tracking-wider text-center" style={{ color: primaryColor }}>
                <LiveEditableText
                  value={labels.timetableHeading || 'Official Examination Schedule'}
                  editable={editable}
                  onSave={val => updateLabel('timetableHeading', val)}
                  className="inline-block"
                />
              </div>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: borderTintStrong, fontSize: timetableDetailsFontSize }}>
                <table className="w-full text-xs text-center border-collapse" style={{ fontSize: timetableDetailsFontSize }}>
                  <thead>
                    <tr className="text-white text-[10.5px] font-serif font-bold" style={{ backgroundColor: primaryColor, fontSize: timetableDetailsFontSize }}>
                      <th className="py-1.5 px-2 border-r border-white/20 w-12">
                        <LiveEditableText value={labels.thSNo || 'No.'} editable={editable} onSave={val => updateLabel('thSNo', val)} />
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20">
                        <LiveEditableText value={labels.thDate || 'Exam Date'} editable={editable} onSave={val => updateLabel('thDate', val)} />
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20">
                        <LiveEditableText value={labels.thTime || 'Time'} editable={editable} onSave={val => updateLabel('thTime', val)} />
                      </th>
                      <th className="py-1.5 px-3 border-r border-white/20 text-left">
                        <LiveEditableText value={labels.thSubject || 'Subject / Course Paper'} editable={editable} onSave={val => updateLabel('thSubject', val)} />
                      </th>
                      <th className="py-1.5 px-3">
                        <LiveEditableText value={labels.thInvigilator || 'Invigilator Initial'} editable={editable} onSave={val => updateLabel('thInvigilator', val)} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub: any, sidx: number) => (
                      <tr
                        key={sidx}
                        className="border-b font-serif text-slate-800 text-[11px]"
                        style={{
                          borderColor: borderTint,
                          backgroundColor: sidx % 2 === 0 ? 'transparent' : bgTintSubtle,
                          fontSize: timetableDetailsFontSize
                        }}
                      >
                        <td className="py-1.5 border-r" style={{ borderColor: borderTint }}>{sidx + 1}</td>
                        <td className="py-1.5 border-r font-bold" style={{ borderColor: borderTint }}>{sub.date}</td>
                        <td className="py-1.5 border-r text-slate-600" style={{ borderColor: borderTint }}>{sub.fromTime} - {sub.toTime || '13:00'}</td>
                        <td className="py-1.5 px-3 border-r text-left font-bold" style={{ borderColor: borderTint, color: primaryColor }}>{sub.subjectName}</td>
                        <td className="py-1.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Candidate Instructions */}
          {instructions && (
            <div
              className="mt-3 p-2.5 rounded-lg border text-[9px] text-slate-700 font-serif leading-relaxed"
              style={{ backgroundColor: bgTintSubtle, borderColor: borderTint, fontSize: instructionsFontSize }}
            >
              <div className="font-serif font-black uppercase text-[9.5px] mb-0.5" style={{ color: primaryColor, fontSize: instructionsFontSize }}>
                <LiveEditableText
                  value={labels.instructionsHeading || 'Important Candidate Instructions:'}
                  editable={editable}
                  onSave={val => updateLabel('instructionsHeading', val)}
                  className="inline-block"
                  style={{ fontSize: instructionsFontSize }}
                />
              </div>
              <LiveEditableText
                tag="p"
                multiline
                value={instructions}
                editable={editable}
                onSave={val => onUpdateField?.('instructions', val)}
                className="whitespace-pre-line text-slate-600 block"
                style={{ fontSize: instructionsFontSize }}
              />
            </div>
          )}

          {/* Signatures */}
          {activeSigns.length > 0 && (
            <div className="flex justify-around items-end gap-4 text-center mt-7 pt-2 text-[8.5px] font-serif font-black uppercase text-slate-700" style={{ fontSize: signatureFontSize }}>
              {activeSigns.map(s => (
                <div key={s.key} className="flex-1 flex flex-col items-center">
                  <div className="mx-auto mb-1 min-h-[24px] flex flex-col items-center justify-end" style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}>
                    <div className="w-full h-0.5 border-t border-dashed border-slate-400" />
                  </div>
                  <LiveEditableText
                    value={s.label}
                    editable={editable}
                    onSave={val => onUpdateField?.(s.key + 'Label', val)}
                    className="inline-block"
                    style={{ fontSize: signatureFontSize }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 4: COMPACT MINIMALIST (Fast Print / Detachable Stub Format)        */}
      {/* ========================================================================= */}
      {templateType === 'compact' && (
        <div className="p-5 border-2 flex flex-col justify-between text-slate-900" style={{ borderColor: primaryColor }}>
          {/* Top Barcode Header */}
          <div>
            <div
              className={`flex justify-between items-start pb-2 border-b gap-3 ${
                logoPosition === 'right' ? 'flex-row-reverse' : ''
              }`}
              style={{ borderColor: borderTintStrong }}
            >
              <div
                className={`flex items-start gap-3 ${
                  logoPosition === 'right' ? 'flex-row-reverse' : ''
                } ${
                  contentPosition === 'center'
                    ? 'text-center'
                    : contentPosition === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {renderInteractiveLogo()}
                <div className={contentPosition === 'center' ? 'text-center' : contentPosition === 'right' ? 'text-right' : 'text-left'}>
                  <LiveEditableText
                    tag="h1"
                    value={schoolName}
                    editable={editable}
                    onSave={val => onUpdateField?.('schoolName', val)}
                    className="text-base sm:text-lg font-black uppercase tracking-tight block"
                    style={{ color: primaryColor, fontSize: headerNameFontSize }}
                    fontSizeControl={{
                      label: 'School Heading',
                      value: headerNameFontSize ? parseInt(headerNameFontSize) : 20,
                      onChange: val => onUpdateField?.('headerNameFontSize', val)
                    }}
                  />
                  <LiveEditableText
                    tag="p"
                    value={schoolAddress}
                    editable={editable}
                    onSave={val => onUpdateField?.('schoolAddress', val)}
                    className="text-[9.5px] text-slate-600 font-semibold block"
                    style={{ fontSize: headerDetailsFontSize }}
                    fontSizeControl={{
                      label: 'Address',
                      value: headerDetailsFontSize ? parseFloat(headerDetailsFontSize) : 9.5,
                      onChange: val => onUpdateField?.('headerDetailsFontSize', val)
                    }}
                  />
                  {isFieldVisible('centerCode') && (
                    <div className="text-[9px] font-bold text-slate-700 mt-0.5">
                      <LiveEditableText value={labels.centerCode || 'Center :'} editable={editable} onSave={val => updateLabel('centerCode', val)} className="inline-block" />{' '}
                      <span>Cosmopolitan Examination Center (Code: 104)</span>
                    </div>
                  )}
                </div>
              </div>

              {isFieldVisible('qrCode') && (
                <div className="text-right flex items-center gap-3 shrink-0">
                  <div className="bg-white p-1 rounded-md border border-slate-300 shadow-2xs flex flex-col items-center">
                    <ProperQrCode size={qrCodeSize} color={primaryColor} />
                    <LiveEditableText
                      value={labels.qrCodeText || 'CODE: 10104-ADM'}
                      editable={editable}
                      onSave={val => updateLabel('qrCodeText', val)}
                      className="text-[7px] text-slate-500 font-mono font-bold tracking-wider mt-0.5 inline-block"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Title Bar */}
            <div
              className="my-2 px-3 py-1 text-white text-[10.5px] font-black uppercase flex items-center justify-between rounded"
              style={{ backgroundColor: primaryColor, fontSize: headingFontSize }}
            >
              <span>
                <LiveEditableText
                  value={admitLabel}
                  editable={editable}
                  onSave={val => onUpdateField?.('admitCardLabel', val)}
                  style={{ fontSize: headingFontSize }}
                  fontSizeControl={{
                    label: 'Admit Title',
                    value: headingFontSize ? parseInt(headingFontSize) : 11,
                    onChange: val => onUpdateField?.('headingFontSize', val)
                  }}
                /> // <LiveEditableText value={examName} editable={editable} onSave={val => onUpdateField?.('examName', val)} />
              </span>
              <span>
                <LiveEditableText value={labels.sessionTitle || 'SESSION :'} editable={editable} onSave={val => updateLabel('sessionTitle', val)} className="inline-block mr-1" />
                <LiveEditableText value={session} editable={editable} onSave={val => onUpdateField?.('session', val)} className="inline-block" />
              </span>
            </div>

            {/* Candidate Card Info (PRIMARY LABELS ARE EDITABLE, DATA IS STATIC) */}
            <div className="grid grid-cols-12 gap-3 p-3 rounded-lg border bg-slate-50/80 mb-3" style={{ borderColor: borderTint, fontSize: studentDetailsFontSize }}>
              {/* Photo Column (if left positioned) */}
              {isFieldVisible('photo') && photoPosition === 'left' && (
                <div className="col-span-3 flex flex-col items-center justify-center pr-3 border-r" style={{ borderColor: borderTint }}>
                  <div
                    className="border rounded bg-white flex flex-col items-center justify-center text-center p-1 shadow-2xs"
                    style={{
                      width: `${photoWidth}px`,
                      height: `${photoHeight}px`,
                      borderColor: primaryColor
                    }}
                  >
                    <User className="w-6 h-6 text-slate-400 mb-0.5" />
                    <LiveEditableText
                      value={labels.studentPhoto || 'Student Photo'}
                      editable={editable}
                      onSave={val => updateLabel('studentPhoto', val)}
                      className="text-[7.5px] uppercase font-bold text-slate-500 inline-block"
                    />
                  </div>
                  {isFieldVisible('studentSign') && (
                    <LiveEditableText
                      value={labels.specimenSign || 'Specimen ID'}
                      editable={editable}
                      onSave={val => updateLabel('specimenSign', val)}
                      className="text-[7.5px] font-bold text-slate-400 mt-1 uppercase inline-block"
                    />
                  )}
                </div>
              )}

              {/* Main Candidate Details Ledger */}
              <div className={`${isFieldVisible('photo') ? 'col-span-9' : 'col-span-12'} grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs`}>
                {/* Left Column */}
                <div className="space-y-1.5">
                  {isFieldVisible('name') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.name || 'Candidate Name :'}
                        editable={editable}
                        onSave={val => updateLabel('name', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-black text-slate-900 truncate" style={{ color: primaryColor }}>{specimenStudent.name}</span>
                    </div>
                  )}
                  {isFieldVisible('rollNo') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.rollNo || 'Roll No. :'}
                        editable={editable}
                        onSave={val => updateLabel('rollNo', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-black text-slate-900">{specimenStudent.rollNo}</span>
                    </div>
                  )}
                  {isFieldVisible('admissionNo') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.admissionNo || 'Admission No. :'}
                        editable={editable}
                        onSave={val => updateLabel('admissionNo', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-800 whitespace-nowrap">{specimenStudent.admissionNo}</span>
                    </div>
                  )}
                  {isFieldVisible('registrationNo') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.registrationNo || 'Reg. No. :'}
                        editable={editable}
                        onSave={val => updateLabel('registrationNo', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-800 whitespace-nowrap">{specimenStudent.registrationNo}</span>
                    </div>
                  )}
                  {isFieldVisible('dob') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.dob || 'Date of Birth :'}
                        editable={editable}
                        onSave={val => updateLabel('dob', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-900 whitespace-nowrap">{specimenStudent.dob}</span>
                    </div>
                  )}
                  {isFieldVisible('mobileNo') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.mobileNo || 'Mobile No. :'}
                        editable={editable}
                        onSave={val => updateLabel('mobileNo', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-900 whitespace-nowrap">{specimenStudent.mobileNo}</span>
                    </div>
                  )}
                  {isFieldVisible('address') && (
                    <div className="text-[10px] p-1.5 rounded leading-snug border" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
                      <LiveEditableText
                        value={labels.address || 'Exam Center Address :'}
                        editable={editable}
                        onSave={val => updateLabel('address', val)}
                        className="text-[9.5px] font-black uppercase mr-1 inline-block"
                        style={{ color: primary }}
                      />
                      <span className="font-bold" style={{ color: primary }}>{schoolAddress}</span>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-1.5 border-l pl-3" style={{ borderColor: borderTint }}>
                  {isFieldVisible('class') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.class || 'Class :'}
                        editable={editable}
                        onSave={val => updateLabel('class', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-800">{classNameStr}</span>
                    </div>
                  )}
                  {isFieldVisible('section') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.section || 'Section :'}
                        editable={editable}
                        onSave={val => updateLabel('section', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-bold text-slate-800">{specimenStudent.section}</span>
                    </div>
                  )}
                  {isFieldVisible('fatherName') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.fatherName || "Father's Name :"}
                        editable={editable}
                        onSave={val => updateLabel('fatherName', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-semibold text-slate-800 truncate">{specimenStudent.fatherName}</span>
                    </div>
                  )}
                  {isFieldVisible('motherName') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.motherName || "Mother's Name :"}
                        editable={editable}
                        onSave={val => updateLabel('motherName', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-semibold text-slate-800 truncate">{specimenStudent.motherName}</span>
                    </div>
                  )}
                  {isFieldVisible('enrollmentNo') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.enrollmentNo || 'Enrollment :'}
                        editable={editable}
                        onSave={val => updateLabel('enrollmentNo', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <span className="font-semibold text-slate-800 whitespace-nowrap">{specimenStudent.enrollmentNo}</span>
                    </div>
                  )}
                  {isFieldVisible('gateClosure') && (
                    <div className="flex items-baseline gap-1 text-[11px]">
                      <LiveEditableText
                        value={labels.gateClosure || 'Gate Closure :'}
                        editable={editable}
                        onSave={val => updateLabel('gateClosure', val)}
                        className="text-[9.5px] text-slate-500 font-bold uppercase whitespace-nowrap inline-block"
                      />
                      <LiveEditableText
                        value={gateClosureValue}
                        editable={editable}
                        onSave={val => onUpdateField?.('gateClosureValue', val)}
                        className="font-bold text-rose-700 whitespace-nowrap ml-1 inline-block"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Column (if right positioned or default) */}
              {isFieldVisible('photo') && photoPosition !== 'left' && (
                <div className="col-span-3 flex flex-col items-center justify-center border-l pl-3" style={{ borderColor: borderTint }}>
                  <div
                    className="border rounded bg-white flex flex-col items-center justify-center text-center p-1 shadow-2xs"
                    style={{
                      width: `${photoWidth}px`,
                      height: `${photoHeight}px`,
                      borderColor: primaryColor
                    }}
                  >
                    <User className="w-6 h-6 text-slate-400 mb-0.5" />
                    <LiveEditableText
                      value={labels.studentPhoto || 'Student Photo'}
                      editable={editable}
                      onSave={val => updateLabel('studentPhoto', val)}
                      className="text-[7.5px] uppercase font-bold text-slate-500 inline-block"
                    />
                  </div>
                  {isFieldVisible('studentSign') && (
                    <LiveEditableText
                      value={labels.specimenSign || 'Specimen ID'}
                      editable={editable}
                      onSave={val => updateLabel('specimenSign', val)}
                      className="text-[7.5px] font-bold text-slate-400 mt-1 uppercase inline-block"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Timetable Matrix (HEADERS ARE EDITABLE LABELS, DATA IS STATIC) */}
            {showTimetable && (
              <div className="border rounded overflow-hidden" style={{ borderColor: borderTintStrong, fontSize: timetableDetailsFontSize }}>
                <table className="w-full text-xs text-left border-collapse" style={{ fontSize: timetableDetailsFontSize }}>
                  <thead>
                    <tr className="text-white text-[9.5px] font-black uppercase" style={{ backgroundColor: primaryColor, fontSize: timetableDetailsFontSize }}>
                      <th className="py-1 px-2">
                        <LiveEditableText value={labels.thSNo || '#'} editable={editable} onSave={val => updateLabel('thSNo', val)} />
                      </th>
                      <th className="py-1 px-2">
                        <LiveEditableText value={labels.thDate || 'Exam Date'} editable={editable} onSave={val => updateLabel('thDate', val)} />
                      </th>
                      <th className="py-1 px-2">
                        <LiveEditableText value={labels.thTime || 'Slot'} editable={editable} onSave={val => updateLabel('thTime', val)} />
                      </th>
                      <th className="py-1 px-2">
                        <LiveEditableText value={labels.thSubject || 'Subject'} editable={editable} onSave={val => updateLabel('thSubject', val)} />
                      </th>
                      <th className="py-1 px-2 text-center">
                        <LiveEditableText value={labels.thInvigilator || 'Invigilator Verification'} editable={editable} onSave={val => updateLabel('thInvigilator', val)} />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: borderTint }}>
                    {subjects.map((sub: any, sidx: number) => (
                      <tr key={sidx} className="text-[10.5px] font-semibold text-slate-800" style={{ fontSize: timetableDetailsFontSize }}>
                        <td className="py-1 px-2 text-slate-500">{sidx + 1}</td>
                        <td className="py-1 px-2 font-bold">{sub.date}</td>
                        <td className="py-1 px-2 text-slate-600">{sub.fromTime} - {sub.toTime || '13:00'}</td>
                        <td className="py-1 px-2 font-bold" style={{ color: primaryColor }}>{sub.subjectName}</td>
                        <td className="py-1 px-2 text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Instructions */}
            {instructions && (
              <div
                className="mt-3 p-2.5 rounded-lg border text-[9px] text-slate-700 leading-relaxed"
                style={{ backgroundColor: bgTintSubtle, borderColor: borderTint, fontSize: instructionsFontSize }}
              >
                <LiveEditableText
                  value={labels.instructionsHeading || 'Important Candidate Instructions:'}
                  editable={editable}
                  onSave={val => updateLabel('instructionsHeading', val)}
                  className="font-black uppercase inline-block"
                  style={{ color: primaryColor, fontSize: instructionsFontSize }}
                />
                <LiveEditableText
                  tag="p"
                  multiline
                  value={instructions}
                  editable={editable}
                  onSave={val => onUpdateField?.('instructions', val)}
                  className="mt-0.5 whitespace-pre-line text-slate-600 block"
                  style={{ fontSize: instructionsFontSize }}
                />
              </div>
            )}

            {/* Dynamic Signatures (Same format as other templates) */}
            {activeSigns.length > 0 && (
              <div className="flex justify-between items-end gap-3 text-center mt-6 pt-2 pb-1 text-[8.5px] font-black uppercase text-slate-700" style={{ fontSize: signatureFontSize }}>
                {activeSigns.map(s => (
                  <div key={s.key} className="flex-1 flex flex-col items-center min-w-[70px]">
                    <div className="mb-1.5 min-h-[24px] flex flex-col items-center justify-end" style={{ width: `${signatureWidth}px`, maxWidth: '100%' }}>
                      <div className="w-full h-0.5 border-t border-dashed border-slate-400" />
                    </div>
                    <LiveEditableText
                      value={s.label}
                      editable={editable}
                      onSave={val => onUpdateField?.(s.key + 'Label', val)}
                      className="inline-block"
                      style={{ fontSize: signatureFontSize }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const AdmitCardModalPreview: React.FC<AdmitCardModalPreviewProps> = ({
  card,
  customSubjects,
  onClose,
  editable,
  onUpdateField,
  onUpdateSubject
}) => {
  const printRef = useRef<HTMLDivElement>(null)

  if (!card) return null

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const primaryColor = card.themeColor || '#1e3a8a'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-admit-card-container, #printable-admit-card-container * {
            visibility: visible !important;
          }
          #printable-admit-card-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[880px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto">
        
        {/* Modal Top Control Bar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Live Admit Card • Examination Hall Ticket
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-[8px] font-black text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {card.templateStyle || 'Classic Board'}
                </span>
                {editable && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Interactive Label Editing Enabled
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Exam: <span className="font-bold text-slate-700 dark:text-slate-300">{card.examName}</span> • Class: <span className="font-bold text-blue-600">{card.className}</span> ({card.session})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Admit Card
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Paper Scroll Container */}
        <div className="overflow-auto bg-slate-200/60 dark:bg-slate-950 p-4 sm:p-6 flex-1 flex justify-center items-start">
          <div ref={printRef} className="w-full flex justify-center">
            <AdmitCardPaper
              card={card}
              customSubjects={customSubjects}
              editable={editable}
              onUpdateField={onUpdateField}
              onUpdateSubject={onUpdateSubject}
            />
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Admit Card ID: #{card.id} • Status: <strong className="text-emerald-600">{card.status}</strong></span>
          <span className="text-[11px] font-semibold text-blue-600">Simultaneously synced with Exam Setup</span>
        </div>

      </div>
    </div>
  )
}

export interface AdmitCardMiniPreviewProps {
  template: 'Classic Board' | 'Modern Split Pass' | 'Executive Heritage' | 'Compact Minimalist' | string
  themeColor?: string
  schoolName?: string
  studentName?: string
  className?: string
  rollNo?: string
  examName?: string
  session?: string
  isSelected?: boolean
  displayFields?: { [key: string]: boolean }
  showExamTimeTable?: boolean
  schoolLogo?: string
  logoPosition?: 'left' | 'center' | 'right' | string
  contentPosition?: 'left' | 'center' | 'right' | string
  photoPosition?: 'right' | 'left' | string
}

export const AdmitCardMiniPreview: React.FC<AdmitCardMiniPreviewProps> = ({
  template,
  themeColor = '#1e3a8a',
  schoolName = 'DELHI PUBLIC SCHOOL',
  studentName = 'Aarav Sharma',
  className: studentClass = 'Class X',
  rollNo = '10104',
  examName = 'Final Term Exam',
  session = '2025-26',
  isSelected = false,
  displayFields,
  showExamTimeTable = true,
  schoolLogo,
  logoPosition = 'left',
  contentPosition = 'left',
  photoPosition = 'right'
}) => {
  const isMiniFieldVisible = (key: string): boolean => {
    if (displayFields && typeof displayFields[key] === 'boolean') {
      return displayFields[key]
    }
    const defaults: Record<string, boolean> = {
      name: true,
      fatherName: true,
      motherName: true,
      mobileNo: false,
      admissionNo: true,
      registrationNo: true,
      rollNo: true,
      enrollmentNo: false,
      dob: true,
      address: true,
      class: true,
      section: true,
      photo: true,
      logo: true,
      studentSign: true,
      teacherSign: true,
      principalSign: true,
      parentSign: true,
      qrCode: true,
      affiliationDetails: true,
      boardFormat: true,
      verifiedPass: true,
      centerCode: true,
      helpline: true,
      mottoQuote: true,
      gateClosure: true
    }
    return defaults[key] ?? true
  }

  const styleRaw = (template || 'Classic Board').toLowerCase()
  let type: 'classic' | 'modern' | 'executive' | 'compact' = 'classic'
  if (styleRaw.includes('modern') || styleRaw.includes('split') || styleRaw.includes('emerald') || styleRaw.includes('dual')) {
    type = 'modern'
  } else if (styleRaw.includes('executive') || styleRaw.includes('heritage') || styleRaw.includes('crimson') || styleRaw.includes('crest')) {
    type = 'executive'
  } else if (styleRaw.includes('compact') || styleRaw.includes('minimal') || styleRaw.includes('slate') || styleRaw.includes('stub')) {
    type = 'compact'
  }

  const primary = themeColor || '#1e3a8a'
  const tintLight = hexToRgba(primary, 0.06)
  const tintMed = hexToRgba(primary, 0.12)
  const borderTint = hexToRgba(primary, 0.3)

  return (
    <div
      className={`w-full h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 relative flex flex-col justify-between text-slate-800 dark:text-slate-100 select-none ${
        isSelected
          ? 'shadow-md ring-2 ring-blue-500/50 scale-[1.01]'
          : 'shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderColor: isSelected ? primary : borderTint
      }}
    >
      {/* 1. CLASSIC BOARD MINI PREVIEW */}
      {type === 'classic' && (
        <div
          className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900"
          style={{ border: `2px double ${primary}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-1" style={{ borderColor: borderTint }}>
            <div className="flex items-center gap-1.5">
              {isMiniFieldVisible('logo') && (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-5 h-5 object-contain rounded shrink-0" />
                ) : (
                  <SampleSchoolLogo width={18} height={18} color={primary} className="shrink-0" />
                )
              )}
              <div>
                <div className="text-[7.5px] font-black leading-tight uppercase truncate max-w-[110px]" style={{ color: primary }}>
                  {schoolName}
                </div>
                <div className="text-[5px] text-slate-500 font-semibold leading-none">Affil. to CBSE Board • Code: 123456</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[4.5px] font-black uppercase px-1 py-0.5 rounded text-white" style={{ backgroundColor: primary }}>
                BOARD
              </span>
              <QrCode className="w-3.5 h-3.5 text-slate-700 mt-0.5" />
            </div>
          </div>

          {/* Title Strip */}
          <div
            className="w-full text-center py-0.5 rounded text-[6px] font-black uppercase text-white shadow-2xs my-0.5"
            style={{ backgroundColor: primary }}
          >
            ADMIT CARD • {examName} ({session})
          </div>

          {/* Candidate & Photo */}
          <div className="flex gap-1.5 items-center my-0.5">
            <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[5.5px]">
              {isMiniFieldVisible('name') && <div><span className="text-slate-400 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>}
              {isMiniFieldVisible('rollNo') && <div><span className="text-slate-400 font-bold">ROLL: </span><span className="font-black text-slate-900">{rollNo}</span></div>}
              {isMiniFieldVisible('class') && <div><span className="text-slate-400 font-bold">CLASS: </span><span className="font-bold text-slate-800">{studentClass}</span></div>}
              {isMiniFieldVisible('admissionNo') && <div><span className="text-slate-400 font-bold">ADM: </span><span className="font-bold text-slate-800">ADM-089</span></div>}
            </div>

            {/* Photo Box */}
            {isMiniFieldVisible('photo') && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="w-6 h-7 rounded border border-dashed flex flex-col items-center justify-center bg-slate-50 text-[5px] text-slate-400" style={{ borderColor: borderTint }}>
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                {isMiniFieldVisible('studentSign') && (
                  <span className="text-[4px] font-bold text-slate-500 uppercase leading-none">SPECIMEN SIGN</span>
                )}
              </div>
            )}
          </div>

          {/* Mini Table */}
          {showExamTimeTable !== false ? (
            <div className="border rounded overflow-hidden" style={{ borderColor: borderTint }}>
              <div className="flex text-[5px] font-black text-white px-1 py-0.5 justify-between" style={{ backgroundColor: primary }}>
                <span className="w-12">Exam Date</span>
                <span className="flex-1 pl-1">Subject</span>
                <span className="w-10 text-right">Sign</span>
              </div>
              <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between border-b" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
                <span className="w-12 font-bold">21 Mar 2025</span>
                <span className="flex-1 pl-1 font-bold text-slate-900">English Core</span>
                <span className="w-10 text-right text-slate-400"></span>
              </div>
              <div className="flex text-[5px] font-semibold text-slate-700 px-1 py-0.5 justify-between">
                <span className="w-12 font-bold">23 Mar 2025</span>
                <span className="flex-1 pl-1 font-bold text-slate-900">Mathematics</span>
                <span className="w-10 text-right text-slate-400"></span>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-[5.5px] font-bold text-slate-400 bg-slate-50 rounded border border-dashed" style={{ borderColor: borderTint }}>
              Timetable schedule hidden per setup
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between items-center pt-0.5 text-[4.5px] font-black uppercase text-slate-500 border-t" style={{ borderColor: borderTint }}>
            {isMiniFieldVisible('studentSign') && <span>Candidate Sign</span>}
            <span>Invigilator Sign</span>
            {isMiniFieldVisible('principalSign') && <span>Principal</span>}
          </div>
        </div>
      )}

      {/* 2. MODERN SPLIT PASS MINI PREVIEW */}
      {type === 'modern' && (
        <div className="w-full h-full flex flex-col bg-white text-slate-900 border" style={{ borderColor: primary }}>
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column Profile Sidebar */}
            <div
              className="w-[34%] p-1.5 flex flex-col justify-start border-r text-center"
              style={{ backgroundColor: tintLight, borderColor: borderTint }}
            >
              <div className="space-y-1 flex flex-col items-center">
                <span className="text-[4.5px] font-black uppercase px-1 py-0.5 rounded text-white shadow-2xs" style={{ backgroundColor: primary }}>
                  VERIFIED PASS
                </span>

                {/* Photo */}
                {isMiniFieldVisible('photo') && (
                  <div className="w-7 h-8 rounded border p-0.5 bg-white shadow-2xs flex flex-col items-center justify-center" style={{ borderColor: primary }}>
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}

                {/* Roll No */}
                {isMiniFieldVisible('rollNo') && (
                  <div className="w-full rounded px-1 py-0.5 text-white shadow-2xs" style={{ backgroundColor: primary }}>
                    <div className="text-[4px] font-bold text-white/80">ROLL NO</div>
                    <div className="text-[8px] font-black leading-tight tracking-wider">{rollNo}</div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mt-1">
                <QrCode className="w-4 h-4 text-slate-800" />
                <span className="text-[3.5px] font-mono text-slate-400 mt-0.5">#ADM-089</span>
              </div>
            </div>

            {/* Right Column Body */}
            <div className="flex-1 p-1.5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between border-b pb-1" style={{ borderColor: borderTint }}>
                  <div className="flex items-center gap-1">
                    {isMiniFieldVisible('logo') && (
                      schoolLogo ? (
                        <img src={schoolLogo} alt="Logo" className="w-4 h-4 object-contain rounded shrink-0" />
                      ) : (
                        <SampleSchoolLogo width={16} height={16} color={primary} className="shrink-0" />
                      )
                    )}
                    <div>
                      <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[95px]" style={{ color: primary }}>
                        {schoolName}
                      </div>
                      <div className="text-[5px] text-slate-500 font-semibold">{examName}</div>
                    </div>
                  </div>
                  <span className="text-[5px] font-black uppercase px-1 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: primary }}>
                    HALL TICKET
                  </span>
                </div>

                {/* Pill Cards */}
                <div className="grid grid-cols-2 gap-1 my-1">
                  {isMiniFieldVisible('name') && (
                    <div className="p-0.5 rounded border bg-slate-50 text-[5px]" style={{ borderColor: borderTint }}>
                      <div className="text-[4px] text-slate-400 font-bold uppercase">NAME</div>
                      <div className="font-black text-slate-900 truncate" style={{ color: primary }}>{studentName}</div>
                    </div>
                  )}
                  {isMiniFieldVisible('class') && (
                    <div className="p-0.5 rounded border bg-slate-50 text-[5px]" style={{ borderColor: borderTint }}>
                      <div className="text-[4px] text-slate-400 font-bold uppercase">CLASS</div>
                      <div className="font-bold text-slate-800 truncate">{studentClass} - Sec A</div>
                    </div>
                  )}
                </div>

                {/* Mini Timetable */}
                {showExamTimeTable !== false ? (
                  <div className="border rounded-md overflow-hidden text-[5px]" style={{ borderColor: borderTint }}>
                    <div className="px-1 py-0.5 font-black text-white flex justify-between" style={{ backgroundColor: primary }}>
                      <span>Subject Schedule</span>
                      <span>Time</span>
                    </div>
                    <div className="px-1 py-0.5 flex justify-between font-semibold border-b text-slate-700" style={{ borderColor: borderTint }}>
                      <span className="font-bold">English Core</span>
                      <span className="text-slate-500">10:00 - 13:00</span>
                    </div>
                    <div className="px-1 py-0.5 flex justify-between font-semibold text-slate-700 bg-slate-50/50">
                      <span className="font-bold">Mathematics</span>
                      <span className="text-slate-500">10:00 - 13:00</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-1 text-center text-[5.5px] font-bold text-slate-400 bg-slate-50 rounded border border-dashed" style={{ borderColor: borderTint }}>
                    Timetable hidden
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full-Width Signatures */}
          <div className="flex justify-between items-center text-[4.5px] font-black text-slate-500 px-2 py-0.5 border-t" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
            {isMiniFieldVisible('studentSign') && <span>Candidate Sign</span>}
            {isMiniFieldVisible('teacherSign') && <span>Teacher Sign</span>}
            {isMiniFieldVisible('principalSign') && <span className="font-bold" style={{ color: primary }}>Principal Verified ✓</span>}
          </div>
        </div>
      )}

      {/* 3. EXECUTIVE HERITAGE MINI PREVIEW */}
      {type === 'executive' && (
        <div
          className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative"
          style={{ border: `3px double ${primary}` }}
        >
          {/* Corner Marks */}
          <span className="absolute top-0.5 left-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute top-0.5 right-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute bottom-0.5 left-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>
          <span className="absolute bottom-0.5 right-0.5 text-[5px] font-serif" style={{ color: primary }}>◆</span>

          {/* Centered Crest Header */}
          <div className="text-center border-b pb-1" style={{ borderColor: borderTint }}>
            <div className="flex justify-center items-center gap-1">
              {isMiniFieldVisible('logo') ? (
                schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-3.5 h-3.5 object-contain rounded-full shrink-0" />
                ) : (
                  <SampleSchoolLogo width={15} height={15} color={primary} className="shrink-0" />
                )
              ) : (
                <Award className="w-3.5 h-3.5" style={{ color: primary }} />
              )}
              <span className="text-[7.5px] font-black uppercase font-serif tracking-wider" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[4.5px] font-serif text-slate-500 italic mt-0.5">Autonomous Academic Institution • Founded 2010</div>
            <div
              className="inline-block px-2 py-0.5 rounded-full text-white text-[5.5px] font-serif font-black uppercase tracking-wider mt-0.5 shadow-2xs"
              style={{ backgroundColor: primary }}
            >
              EXAMINATION HALL TICKET • {session}
            </div>
          </div>

          {/* Candidate Block */}
          <div className="flex items-center gap-1.5 p-1 rounded border bg-slate-50/60 my-0.5" style={{ borderColor: borderTint }}>
            <div className="flex-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[5px] font-serif">
              {isMiniFieldVisible('name') && <div><span className="text-slate-500 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>}
              {isMiniFieldVisible('rollNo') && <div><span className="text-slate-500 font-bold">ROLL: </span><span className="font-black text-slate-900">{rollNo}</span></div>}
              {isMiniFieldVisible('class') && <div><span className="text-slate-500 font-bold">CLASS: </span><span className="font-bold text-slate-800">{studentClass}</span></div>}
              {isMiniFieldVisible('admissionNo') && <div><span className="text-slate-500 font-bold">ADM: </span><span className="font-bold text-slate-800">ADM-089</span></div>}
            </div>

            {/* Photo */}
            <div className="flex items-center gap-1 shrink-0">
              {isMiniFieldVisible('photo') && (
                <div className="w-6 h-7 rounded border border-double flex items-center justify-center bg-white" style={{ borderColor: primary }}>
                  <User className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          {showExamTimeTable !== false ? (
            <div className="border rounded overflow-hidden text-[5px] font-serif" style={{ borderColor: borderTint }}>
              <div className="flex justify-between px-1 py-0.5 text-white font-black" style={{ backgroundColor: primary }}>
                <span>Paper / Course</span>
                <span>Date</span>
                <span>Invigilator</span>
              </div>
              <div className="flex justify-between px-1 py-0.5 border-b font-semibold text-slate-700" style={{ borderColor: borderTint, backgroundColor: tintLight }}>
                <span className="font-bold">English Core</span>
                <span>21-Mar-2025</span>
                <span className="text-slate-400"></span>
              </div>
              <div className="flex justify-between px-1 py-0.5 font-semibold text-slate-700">
                <span className="font-bold">Mathematics</span>
                <span>23-Mar-2025</span>
                <span className="text-slate-400"></span>
              </div>
            </div>
          ) : (
            <div className="py-1 text-center text-[5.5px] font-bold text-slate-400 bg-slate-50 rounded border border-dashed" style={{ borderColor: borderTint }}>
              Schedule hidden
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between items-center text-[4.5px] font-serif font-black uppercase text-slate-600 pt-0.5 border-t" style={{ borderColor: borderTint }}>
            {isMiniFieldVisible('studentSign') && <span>Candidate Sign</span>}
            <span>Superintendent</span>
            {isMiniFieldVisible('principalSign') && <span>Principal</span>}
          </div>
        </div>
      )}

      {/* 4. COMPACT MINIMALIST MINI PREVIEW */}
      {type === 'compact' && (
        <div className="w-full h-full p-1.5 flex flex-col justify-between bg-white text-slate-900 border" style={{ borderColor: primary }}>
          {/* Top Barcode Header */}
          <div>
            <div className="flex justify-between items-start border-b pb-0.5" style={{ borderColor: borderTint }}>
              <div className="flex items-center gap-1">
                {isMiniFieldVisible('logo') && (
                  schoolLogo ? (
                    <img src={schoolLogo} alt="Logo" className="w-4 h-4 object-contain rounded shrink-0" />
                  ) : (
                    <SampleSchoolLogo width={15} height={15} color={primary} className="shrink-0" />
                  )
                )}
                <div>
                  <div className="text-[7.5px] font-black uppercase leading-tight truncate max-w-[105px]" style={{ color: primary }}>
                    {schoolName}
                  </div>
                  <div className="text-[4.5px] text-slate-500 font-bold">Venue: Center 104 • Hall 3</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <QrCode className="w-4 h-4 text-slate-700" />
                {isMiniFieldVisible('rollNo') && (
                  <span className="text-[4.5px] font-mono font-bold text-slate-500">#{rollNo}</span>
                )}
              </div>
            </div>

            {/* High-Contrast Bar */}
            <div className="my-0.5 px-1 py-0.5 text-white text-[5.5px] font-black uppercase flex justify-between rounded" style={{ backgroundColor: primary }}>
              <span>ADMIT PASS // {session}</span>
              <span>{examName}</span>
            </div>

            {/* 3-Col Compact Block */}
            <div className="grid grid-cols-12 gap-1 p-1 rounded border bg-slate-50/70 text-[5px] my-0.5" style={{ borderColor: borderTint }}>
              <div className="col-span-6 space-y-0.5">
                {isMiniFieldVisible('name') && <div><span className="text-slate-400 font-bold">NAME: </span><span className="font-black text-slate-900" style={{ color: primary }}>{studentName}</span></div>}
                {isMiniFieldVisible('rollNo') && <div><span className="text-slate-400 font-bold">ROLL: </span><span className="font-bold text-slate-900">{rollNo} ({studentClass})</span></div>}
              </div>
              <div className="col-span-4 border-l pl-1 space-y-0.5" style={{ borderColor: borderTint }}>
                <div><span className="text-slate-400 font-bold">REPORT: </span><span className="font-bold text-slate-900">09:30 AM</span></div>
                <div><span className="text-slate-400 font-bold">GATE: </span><span className="font-bold text-rose-700">09:50 AM</span></div>
              </div>
              {isMiniFieldVisible('photo') && (
                <div className="col-span-2 flex items-center justify-center border-l pl-0.5" style={{ borderColor: borderTint }}>
                  <div className="w-5 h-6 rounded border bg-white flex items-center justify-center" style={{ borderColor: primary }}>
                    <User className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Compact Table */}
            {showExamTimeTable !== false ? (
              <div className="border rounded overflow-hidden text-[5px]" style={{ borderColor: borderTint }}>
                <div className="flex justify-between px-1 py-0.5 font-black text-white" style={{ backgroundColor: primary }}>
                  <span>Date & Paper</span>
                  <span>Slot</span>
                  <span>Verification</span>
                </div>
                <div className="flex justify-between px-1 py-0.5 font-semibold text-slate-700 border-b" style={{ borderColor: borderTint }}>
                  <span className="font-bold">21 Mar • English</span>
                  <span>10:00 AM</span>
                  <span className="text-slate-400">[ &nbsp; &nbsp; ]</span>
                </div>
              </div>
            ) : (
              <div className="py-1 text-center text-[5.5px] font-bold text-slate-400 bg-slate-50 rounded border border-dashed" style={{ borderColor: borderTint }}>
                Schedule hidden
              </div>
            )}
          </div>

          {/* Signatures Bar */}
          <div className="pt-2 flex justify-between items-end text-[4.5px] font-bold text-slate-500">
            {isMiniFieldVisible('principalSign') && <span className="border-t border-dashed border-slate-300 pt-0.5">Principal's Sign</span>}
            {isMiniFieldVisible('teacherSign') && <span className="border-t border-dashed border-slate-300 pt-0.5">Teacher's Sign</span>}
            {isMiniFieldVisible('studentSign') && <span className="border-t border-dashed border-slate-300 pt-0.5">Student's Sign</span>}
          </div>
        </div>
      )}
    </div>
  )
}

