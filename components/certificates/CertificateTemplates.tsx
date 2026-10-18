import React from 'react'
import { QrCode, Award, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { LiveEditableText, ProperQrCode, hexToRgba } from '@/components/admit-card/AdmitCardModalPreview'

export { hexToRgba }

export function adjustHex(hex?: string, amount: number = 0): string {
  let c = (hex || '#1e3a8a').trim().replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return amount < 0 ? '#0f2b5c' : '#38bdf8'
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (num & 255) + amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export const CERTIFICATE_COLOR_PRESETS = [
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Ocean Teal', hex: '#0F766E' },
  { name: 'Royal Emerald', hex: '#065F46' },
  { name: 'Amber Gold', hex: '#B45309' },
  { name: 'Burgundy', hex: '#660033' },
  { name: 'Crimson', hex: '#991B1B' },
  { name: 'Indigo', hex: '#4338CA' },
  { name: 'Plum Purple', hex: '#701A75' },
  { name: 'Midnight Slate', hex: '#0F172A' }
]

export interface CertificateCustomProps {
  title?: string
  subtitle?: string
  themeColor?: string
  schoolName?: string
  schoolAddress?: string
  studentName?: string
  className?: string
  content?: string
  date?: string
  awarder?: string
  principalName?: string
  principalLabel?: string
  secondarySignName?: string
  secondarySignLabel?: string
  showQr?: boolean
  showSeal?: boolean
  textColor?: string
  titleBgColor?: string
  hiddenFields?: string[]
  editable?: boolean
  customLabels?: Record<string, string>
  onUpdateField?: (field: string, value: string) => void
  onUpdateLabel?: (key: string, value: string) => void
}

// Common Gold Seal with Ribbons (Themed ribbon support)
const GoldSeal = ({ text = "ACADEMIC EXCELLENCE", ribbonColor = "#1e3a8a", className = "" }: { text?: string; ribbonColor?: string; className?: string }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    {/* Sunburst edges */}
    {[0, 30, 60, 90, 120, 150].map((deg) => (
      <div 
        key={deg} 
        className="absolute w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-xs" 
        style={{ transform: `rotate(${deg}deg)`, zIndex: 1 }}
      ></div>
    ))}
    {/* Inner golden disc */}
    <div className="absolute w-16 h-16 bg-gradient-to-b from-amber-300 via-amber-200 to-yellow-500 rounded-full z-10 border-2 border-amber-600/40 shadow-inner flex flex-col items-center justify-center p-1 text-center">
      <Award className="w-5 h-5 text-amber-900" />
      <span className="text-[6.5px] font-black text-amber-950 uppercase tracking-tighter leading-none mt-0.5">
        OFFICIAL SEAL
      </span>
    </div>
    {/* Ribbons */}
    <div 
      className="absolute bottom-[-18px] left-[12px] w-6 h-12 -rotate-[30deg] z-0 shadow-sm" 
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
        backgroundColor: ribbonColor
      }}
    ></div>
    <div 
      className="absolute bottom-[-18px] right-[12px] w-6 h-12 rotate-[30deg] z-0 shadow-sm" 
      style={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
        backgroundColor: ribbonColor
      }}
    ></div>
  </div>
)

// -------------------------------------------------------------
// DESIGN 1: BLUE & GOLD ROYAL GEOMETRIC (PORTRAIT/LANDSCAPE)
// -------------------------------------------------------------
export const CertificateDesign1: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF ACHIEVEMENT',
  subtitle = 'In Recognition of Academic Excellence',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.',
  date = '15 October 2025',
  awarder = 'Principal & Director',
  principalName,
  principalLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#1e3a8a'
  const borderTint = hexToRgba(primary, 0.25)
  const effectivePrincipalName = principalName || 'Dr. S. K. Sharma'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Director'

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Decorative Gold & Primary Corners */}
      <div className="absolute top-0 left-0 w-64 h-64 -translate-x-32 -translate-y-32 rotate-45 flex flex-col z-10 shadow-md pointer-events-none">
        <div className="w-full h-8 bg-amber-400"></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-20" style={{ backgroundColor: primary }}></div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-32 translate-y-32 rotate-45 flex flex-col z-10 shadow-md pointer-events-none">
        <div className="w-full h-20" style={{ backgroundColor: primary }}></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-8 bg-amber-400"></div>
      </div>

      {/* Thin Gold Frame */}
      <div className="absolute inset-5 border-2 border-amber-300/80 z-0 rounded-sm pointer-events-none"></div>
      <div className="absolute inset-7 border z-0 rounded-xs pointer-events-none" style={{ borderColor: borderTint }}></div>

      {/* Watermark */}
      {!isHidden('Water Mark') && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <Award className="w-96 h-96" style={{ color: primary }} />
        </div>
      )}

      {/* QR Code */}
      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-10 right-12 z-20 flex flex-col items-center bg-white p-1 rounded border border-slate-200 shadow-2xs">
          <ProperQrCode className="w-12 h-12" color={primary} />
          <span className="text-[7px] font-mono text-slate-400 mt-0.5">VERIFIED</span>
        </div>
      )}

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center pt-10 px-24 text-center">
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-serif font-black text-sm tracking-widest uppercase mb-0.5"
            style={{ color: primary }}
          />
        )}
        {!isHidden('School Address') && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[10px] text-slate-500 font-medium mb-4"
          />
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-2">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-4xl tracking-wider text-slate-900 uppercase drop-shadow-xs"
            />
            <LiveEditableText
              tag="p"
              value={subtitle}
              editable={editable}
              onSave={(val) => onUpdateField?.('subtitle', val)}
              className="font-bold text-xs tracking-[0.25em] uppercase mt-1"
              style={{ color: primary }}
            />
          </div>
        )}

        <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-3"></div>

        <p className="text-[11px] tracking-widest text-slate-500 font-semibold uppercase mb-2">
          {customLabels['presented_to'] || 'This Certificate is Proudly Presented To'}
        </p>

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <div className="my-1">
            <LiveEditableText
              tag="h3"
              value={studentName}
              editable={editable}
              onSave={(val) => onUpdateField?.('studentName', val)}
              className="font-serif font-black text-4xl tracking-wide border-b-2 border-amber-400/80 px-8 pb-1 inline-block"
              style={{ color: primary }}
            />
          </div>
        )}

        {/* Description / Content */}
        <div className="max-w-xl mx-auto mt-4 px-6">
          <LiveEditableText
            tag="p"
            multiline
            value={content}
            editable={editable}
            onSave={(val) => onUpdateField?.('content', val)}
            className="text-slate-600 text-xs font-medium leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end px-20 pb-10 mt-auto">
        {/* Date */}
        <div className="flex flex-col items-center w-40">
          {!isHidden('Certificate Date') && (
            <>
              <LiveEditableText
                tag="p"
                value={date}
                editable={editable}
                onSave={(val) => onUpdateField?.('date', val)}
                className="font-bold text-xs text-slate-800 mb-1"
              />
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                {customLabels['date_label'] || 'Date of Issue'}
              </p>
            </>
          )}
        </div>

        {/* Seal */}
        {showSeal && !isHidden('Water Mark') && (
          <div className="mb-2">
            <GoldSeal ribbonColor={primary} />
          </div>
        )}

        {/* Awarder / Principal Signature */}
        <div className="flex flex-col items-center w-40">
          {!isHidden('Principal Sign') && (
            <>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalName}
                editable={editable}
                onSave={(val) => onUpdateField?.('principalName', val)}
                className="font-serif italic font-bold text-sm mb-1"
                style={{ color: primary }}
              />
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalLabel}
                editable={editable}
                onSave={(val) => onUpdateLabel?.('principalSign', val)}
                className="text-[9px] font-bold text-slate-400 tracking-widest uppercase"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 2: CLASSIC ORNATE VINTAGE GOLD
// -------------------------------------------------------------
export const CertificateDesign2: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF MERIT',
  subtitle = 'For Demonstrating High Excellence',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certificate is conferred in recognition of exceptional scholarly merit, consistent diligence, and exemplary conduct shown throughout the academic term.',
  date = '15 October 2025',
  awarder = 'Principal / Head of Institution',
  principalName,
  principalLabel,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#b08d55'
  const primaryDark = adjustHex(primary, -25)
  const primaryLight = hexToRgba(primary, 0.12)
  const effectivePrincipalName = principalName || 'Authorized Signatory'
  const effectivePrincipalLabel = principalLabel || awarder || 'Head of Institution'

  return (
    <div className="w-[800px] h-[580px] bg-[#faf8f2] relative overflow-hidden flex flex-col font-serif shrink-0 border-[14px] border-white shadow-2xl select-none text-slate-800">
      {/* Ornate Gold Border */}
      <div 
        className="absolute inset-3 border-[2.5px] flex z-10 pointer-events-none"
        style={{ borderColor: primary }}
      >
        <div className="absolute -top-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -top-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -bottom-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
        <div className="absolute -bottom-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-2xl" style={{ color: primary }}>⚜</div>
      </div>

      <div className="relative z-20 flex flex-col items-center pt-8 px-20 flex-1 text-center">
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-serif font-black text-xs tracking-widest uppercase mb-0.5"
            style={{ color: primaryDark }}
          />
        )}
        {!isHidden('School Address') && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9.5px] text-slate-500 font-sans mb-3"
          />
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-1">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-black text-4xl tracking-wider text-slate-900 uppercase"
            />
            <div className="flex items-center justify-center gap-3 text-slate-600 mt-1">
              <div className="w-10 h-px" style={{ backgroundColor: primary }}></div>
              <LiveEditableText
                tag="h2"
                value={subtitle}
                editable={editable}
                onSave={(val) => onUpdateField?.('subtitle', val)}
                className="tracking-[0.2em] font-medium text-xs uppercase"
                style={{ color: primaryDark }}
              />
              <div className="w-10 h-px" style={{ backgroundColor: primary }}></div>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 my-2 text-xs" style={{ color: primary }}>
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>

        <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase mb-2 font-sans">
          {customLabels['presented_to'] || 'This Honor is Bestowed Upon'}
        </p>

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="text-5xl mb-2 font-medium tracking-wide"
            style={{ fontFamily: 'Georgia, serif', color: primaryDark }}
          />
        )}

        <div className="w-full max-w-xs mx-auto flex items-center gap-2 mb-3" style={{ color: primary }}>
          <span className="text-xs">♦</span>
          <div className="flex-1 h-px" style={{ backgroundColor: primary }}></div>
          <span className="text-xs">♦</span>
        </div>

        {/* Description */}
        <div className="max-w-xl px-6 font-sans">
          <LiveEditableText
            tag="p"
            multiline
            value={content}
            editable={editable}
            onSave={(val) => onUpdateField?.('content', val)}
            className="text-xs text-slate-600 leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 flex justify-between items-end px-20 pb-8 mt-auto h-32">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <LiveEditableText
                tag="p"
                value={date}
                editable={editable}
                onSave={(val) => onUpdateField?.('date', val)}
                className="text-xs text-slate-700 font-bold mb-1 font-sans"
              />
              <div className="w-full h-px" style={{ backgroundColor: primary }}></div>
              <p className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase font-sans mt-1">
                {customLabels['date_label'] || 'Date'}
              </p>
            </>
          )}
        </div>

        {showSeal && (
          <div 
            className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center flex-col relative shadow-inner"
            style={{ 
              borderColor: primary, 
              color: primary,
              backgroundColor: primaryLight
            }}
          >
            <span className="text-[9px]">★★★</span>
            <span className="font-bold text-[10px] text-center leading-tight">MERIT<br/>AWARD</span>
            <span className="text-[9px]">★★★</span>
          </div>
        )}

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalName}
                editable={editable}
                onSave={(val) => onUpdateField?.('principalName', val)}
                className="text-lg mb-0.5"
                style={{ fontFamily: 'cursive', color: primaryDark }}
              />
              <div className="w-full h-px" style={{ backgroundColor: primary }}></div>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalLabel}
                editable={editable}
                onSave={(val) => onUpdateLabel?.('principalSign', val)}
                className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase font-sans mt-1"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 3: MODERN LUXURY MINIMALIST (EMERALD & GOLD)
// -------------------------------------------------------------
export const CertificateDesign3: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF EXCELLENCE',
  subtitle = 'Excellence in Extracurricular & Sports',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'Presented in high honor and appreciation for exceptional sportsmanship, energetic teamwork, and exemplary performance representing the institution with pride.',
  date = '15 October 2025',
  awarder = 'Principal & Sports Council',
  principalName,
  principalLabel,
  showQr = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#065f46'
  const primaryDark = adjustHex(primary, -25)
  const primaryLight = hexToRgba(primary, 0.12)
  const effectivePrincipalName = principalName || 'Director.Admin'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Sports Council'

  return (
    <div 
      className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 shadow-2xl select-none text-slate-800"
      style={{ border: `10px solid ${primary}` }}
    >
      {/* Decorative Gold & Primary Accent Bars */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-400 to-amber-200 opacity-20 rounded-bl-full pointer-events-none"></div>
      <div 
        className="absolute bottom-0 left-0 w-44 h-44 opacity-15 rounded-tr-full pointer-events-none"
        style={{ background: `linear-gradient(to top right, ${primary}, #38bdf8)` }}
      ></div>

      <div className="absolute inset-4 border pointer-events-none" style={{ borderColor: hexToRgba(primary, 0.25) }}></div>

      {showQr && !isHidden('QR Code') && (
        <div 
          className="absolute top-8 right-8 z-20 p-1.5 rounded-lg border shadow-2xs"
          style={{ backgroundColor: primaryLight, borderColor: hexToRgba(primary, 0.3) }}
        >
          <ProperQrCode className="w-12 h-12" color={primary} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center pt-8 px-24 flex-1 text-center">
        {!isHidden('School Name') && (
          <div className="flex items-center gap-2 mb-0.5">
            <div 
              className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px]"
              style={{ backgroundColor: primary }}
            >
              <Award className="w-3.5 h-3.5" />
            </div>
            <LiveEditableText
              tag="h4"
              value={schoolName}
              editable={editable}
              onSave={(val) => onUpdateField?.('schoolName', val)}
              className="font-bold text-xs tracking-widest uppercase"
              style={{ color: primaryDark }}
            />
          </div>
        )}
        {!isHidden('School Address') && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9.5px] text-slate-400 font-medium mb-3"
          />
        )}

        {!isHidden('Title') && (
          <div className="mb-2">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-4xl tracking-wider uppercase text-slate-900"
            />
            <LiveEditableText
              tag="p"
              value={subtitle}
              editable={editable}
              onSave={(val) => onUpdateField?.('subtitle', val)}
              className="font-bold text-xs tracking-[0.25em] uppercase mt-1"
              style={{ color: primary }}
            />
          </div>
        )}

        <div 
          className="w-24 h-1 rounded-full my-2"
          style={{ background: `linear-gradient(to right, ${primary}, #f59e0b)` }}
        ></div>

        <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase mb-2">
          {customLabels['presented_to'] || 'This Distinction is Bestowed Upon'}
        </p>

        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="font-serif font-black text-4xl tracking-wide border-b-2 px-8 pb-1 inline-block my-1"
            style={{ color: primaryDark, borderColor: primary }}
          />
        )}

        <div className="max-w-xl mx-auto mt-4 px-6">
          <LiveEditableText
            tag="p"
            multiline
            value={content}
            editable={editable}
            onSave={(val) => onUpdateField?.('content', val)}
            className="text-slate-600 text-xs font-medium leading-relaxed"
          />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end px-20 pb-8 mt-auto">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <LiveEditableText
                tag="p"
                value={date}
                editable={editable}
                onSave={(val) => onUpdateField?.('date', val)}
                className="font-bold text-xs text-slate-800 mb-1"
              />
              <div className="w-full h-px mb-1" style={{ backgroundColor: hexToRgba(primary, 0.3) }}></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">
                {customLabels['date_label'] || 'Date of Issue'}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div 
            className="w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm"
            style={{ 
              borderColor: primary,
              backgroundColor: primaryLight,
              color: primary
            }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: primary }} />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: primaryDark }}>
            Verified Credential
          </span>
        </div>

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalName}
                editable={editable}
                onSave={(val) => onUpdateField?.('principalName', val)}
                className="font-serif italic font-bold text-sm mb-1"
                style={{ color: primaryDark }}
              />
              <div className="w-full h-px mb-1" style={{ backgroundColor: hexToRgba(primary, 0.3) }}></div>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalLabel}
                editable={editable}
                onSave={(val) => onUpdateLabel?.('principalSign', val)}
                className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// DESIGN 4: ELEGANT CORPORATE / ACADEMIC COMPLETION
// -------------------------------------------------------------
export const CertificateDesign4: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF COMPLETION',
  subtitle = 'Academic Curriculum & Co-Curricular',
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certifies the satisfactory completion of the prescribed curriculum and active participation in institutional projects with sincere effort and commendable diligence.',
  date = '15 October 2025',
  awarder = 'Principal & Academic Dean',
  principalName,
  principalLabel,
  showQr = true,
  showSeal = true,
  hiddenFields = [],
  editable = false,
  customLabels = {},
  onUpdateField,
  onUpdateLabel
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)
  const primary = themeColor || '#1e293b'
  const borderTint = hexToRgba(primary, 0.35)
  const effectivePrincipalName = principalName || 'Dean.Academics'
  const effectivePrincipalLabel = principalLabel || awarder || 'Principal & Academic Dean'

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Sleek Border Frames */}
      <div className="absolute inset-5 border-2 pointer-events-none" style={{ borderColor: primary }}></div>
      <div className="absolute inset-7 border pointer-events-none" style={{ borderColor: borderTint }}></div>

      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-10 right-12 z-20 bg-slate-50 p-1 rounded border border-slate-200 shadow-2xs">
          <ProperQrCode className="w-12 h-12" color={primary} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center pt-10 px-24 flex-1 text-center">
        {!isHidden('School Name') && (
          <LiveEditableText
            tag="h4"
            value={schoolName}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolName', val)}
            className="font-bold text-xs tracking-widest uppercase mb-0.5"
            style={{ color: primary }}
          />
        )}
        {!isHidden('School Address') && (
          <LiveEditableText
            tag="p"
            value={schoolAddress}
            editable={editable}
            onSave={(val) => onUpdateField?.('schoolAddress', val)}
            className="text-[9.5px] text-slate-500 font-medium mb-3"
          />
        )}

        {!isHidden('Title') && (
          <div className="mb-2">
            <LiveEditableText
              tag="h1"
              value={title}
              editable={editable}
              onSave={(val) => onUpdateField?.('title', val)}
              className="font-serif font-black text-4xl tracking-wider text-slate-900 uppercase"
            />
            <LiveEditableText
              tag="p"
              value={subtitle}
              editable={editable}
              onSave={(val) => onUpdateField?.('subtitle', val)}
              className="font-bold text-xs tracking-[0.25em] uppercase mt-1"
              style={{ color: primary }}
            />
          </div>
        )}

        <div className="w-28 h-0.5 my-2" style={{ backgroundColor: primary }}></div>

        <p className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase mb-2">
          {customLabels['presented_to'] || 'This Document Confirms That'}
        </p>

        {!isHidden('Student Name') && (
          <LiveEditableText
            tag="h3"
            value={studentName}
            editable={editable}
            onSave={(val) => onUpdateField?.('studentName', val)}
            className="font-serif font-black text-4xl tracking-wide border-b-2 px-8 pb-1 inline-block my-1"
            style={{ color: primary, borderColor: borderTint }}
          />
        )}

        <div className="max-w-xl mx-auto mt-4 px-6">
          <LiveEditableText
            tag="p"
            multiline
            value={content}
            editable={editable}
            onSave={(val) => onUpdateField?.('content', val)}
            className="text-slate-600 text-xs font-medium leading-relaxed"
          />
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end px-20 pb-10 mt-auto">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <LiveEditableText
                tag="p"
                value={date}
                editable={editable}
                onSave={(val) => onUpdateField?.('date', val)}
                className="font-bold text-xs text-slate-800 mb-1"
              />
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">
                {customLabels['date_label'] || 'Date of Issue'}
              </p>
            </>
          )}
        </div>

        {showSeal && (
          <div className="mb-1">
            <GoldSeal text="CERTIFIED" ribbonColor={primary} />
          </div>
        )}

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalName}
                editable={editable}
                onSave={(val) => onUpdateField?.('principalName', val)}
                className="font-serif italic font-bold text-sm mb-1"
                style={{ color: primary }}
              />
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <LiveEditableText
                tag="p"
                value={effectivePrincipalLabel}
                editable={editable}
                onSave={(val) => onUpdateLabel?.('principalSign', val)}
                className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// UNIFIED CERTIFICATE PAPER (RESPONSIVE SCALED VIEWPORT)
// -------------------------------------------------------------
export const CertificatePaper: React.FC<CertificateCustomProps & { template?: string; themeColor?: string }> = ({
  template = 'Certificate Design 1',
  themeColor,
  ...props
}) => {
  const tmpl = (template || '').toLowerCase()
  if (tmpl.includes('2')) return <CertificateDesign2 themeColor={themeColor} {...props} />
  if (tmpl.includes('3')) return <CertificateDesign3 themeColor={themeColor} {...props} />
  if (tmpl.includes('4')) return <CertificateDesign4 themeColor={themeColor} {...props} />
  return <CertificateDesign1 themeColor={themeColor} {...props} />
}

// -------------------------------------------------------------
// CERTIFICATE MINI PREVIEW FOR SELECTION CARDS
// -------------------------------------------------------------
export interface CertificateMiniPreviewProps {
  template: 'Certificate Design 1' | 'Certificate Design 2' | 'Certificate Design 3' | 'Certificate Design 4' | string
  themeColor?: string
  schoolName?: string
  studentName?: string
  title?: string
  subtitle?: string
  date?: string
  isSelected?: boolean
}

export const CertificateMiniPreview: React.FC<CertificateMiniPreviewProps> = ({
  template,
  themeColor,
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  studentName = 'Aarav Sharma',
  title,
  subtitle,
  date = '15 Oct 2025',
  isSelected = false
}) => {
  const tmpl = (template || 'Certificate Design 1').toLowerCase()
  const isD2 = tmpl.includes('2') || tmpl.includes('merit') || tmpl.includes('vintage')
  const isD3 = tmpl.includes('3') || tmpl.includes('emerald') || tmpl.includes('sports')
  const isD4 = tmpl.includes('4') || tmpl.includes('completion') || tmpl.includes('academic') || tmpl.includes('corporate')
  const isD1 = !isD2 && !isD3 && !isD4

  const defaultBaseColor = isD2 ? '#b45309' : isD3 ? '#065f46' : isD4 ? '#1e293b' : '#1e3a8a'
  const primary = themeColor || defaultBaseColor
  const tintLight = hexToRgba(primary, 0.08)
  const borderTint = hexToRgba(primary, 0.3)

  return (
    <div
      className={`w-full h-36 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 relative flex flex-col justify-between text-slate-800 dark:text-slate-100 select-none ${
        isSelected
          ? 'shadow-md ring-2 ring-teal-500 scale-[1.01]'
          : 'shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderColor: isSelected ? primary : borderTint
      }}
    >
      {/* 1. CERTIFICATE DESIGN 1 MINI (ROYAL BLUE GEOMETRIC) */}
      {isD1 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden">
          {/* Diagonal Corner Accents */}
          <div
            className="absolute top-0 left-0 w-16 h-16 -translate-x-8 -translate-y-8 rotate-45 pointer-events-none shadow-xs"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute bottom-0 right-0 w-16 h-16 translate-x-8 translate-y-8 rotate-45 pointer-events-none shadow-xs"
            style={{ backgroundColor: primary }}
          />
          <div className="absolute top-0 left-0 w-10 h-10 -translate-x-5 -translate-y-5 rotate-45 bg-amber-400 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 translate-x-5 translate-y-5 rotate-45 bg-amber-400 pointer-events-none" />

          {/* Thin Inner Frame */}
          <div className="absolute inset-1.5 border border-amber-300/80 rounded-xs pointer-events-none" />
          <div className="absolute inset-2.5 border rounded-xs pointer-events-none" style={{ borderColor: borderTint }} />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="text-[6.5px] font-black uppercase tracking-wider truncate px-4" style={{ color: primary }}>
              {schoolName}
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF ACHIEVEMENT'}
            </div>
            <div className="text-[4.5px] font-bold uppercase tracking-widest text-slate-400">
              {subtitle || 'IN RECOGNITION OF ACADEMIC EXCELLENCE'}
            </div>
          </div>

          {/* Center Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">Presented Proudly To</span>
            <div
              className="inline-block text-[10px] font-serif font-black px-3 pb-0.5 border-b"
              style={{ color: primary, borderColor: '#f59e0b' }}
            >
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-500 font-medium px-4 line-clamp-1 mt-0.5">
              For exemplary dedication, outstanding performance & leadership.
            </p>
          </div>

          {/* Footer with Seal */}
          <div className="relative z-10 flex justify-between items-end px-2 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date</span>
            </div>

            {/* Mini Gold Seal */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-600/40 shadow-xs flex flex-col items-center justify-center p-0.5">
              <Award className="w-2.5 h-2.5 text-amber-950" />
              <span className="text-[3px] font-black text-amber-950 leading-none">SEAL</span>
            </div>

            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Principal</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Director</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CERTIFICATE DESIGN 2 MINI (VINTAGE ORNATE GOLD) */}
      {isD2 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-[#faf8f2] text-slate-900 relative overflow-hidden border-[4px] border-white shadow-2xs">
          {/* Ornate Gold Border & Corner Marks */}
          <div className="absolute inset-1 border-[1.5px] pointer-events-none" style={{ borderColor: primary }}>
            <span className="absolute -top-1.5 -left-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -top-1.5 -right-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -bottom-1.5 -left-1 text-[7px]" style={{ color: primary }}>⚜</span>
            <span className="absolute -bottom-1.5 -right-1 text-[7px]" style={{ color: primary }}>⚜</span>
          </div>

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5 font-serif">
            <div className="text-[6.5px] font-black uppercase tracking-wider truncate px-4" style={{ color: primary }}>
              {schoolName}
            </div>
            <div className="text-[7.5px] font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF MERIT'}
            </div>
            <div className="flex items-center justify-center gap-1 text-[4px] mt-0.5" style={{ color: primary }}>
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto font-serif">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-widest block font-sans">Honoring</span>
            <div className="text-[11px] font-serif font-black tracking-wide leading-tight" style={{ color: primary }}>
              {studentName}
            </div>
            <div className="w-16 h-px mx-auto my-0.5" style={{ backgroundColor: primary }} />
            <p className="text-[4.5px] text-slate-600 font-sans px-4 line-clamp-1">
              Conferred in recognition of exceptional scholarly merit & exemplary conduct.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600 font-sans">
            <div className="text-center w-12 border-t pt-0.5" style={{ borderColor: primary }}>
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date</span>
            </div>

            <div 
              className="w-6 h-6 rounded-full border border-dashed flex flex-col items-center justify-center text-[3.5px] bg-amber-50/60"
              style={{ borderColor: primary, color: primary }}
            >
              <span className="leading-none">MERIT</span>
              <span className="leading-none text-[3px]">AWARD</span>
            </div>

            <div className="text-center w-12 border-t pt-0.5" style={{ borderColor: primary }}>
              <span style={{ color: primary }} className="font-serif italic font-bold">Authorized</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Signature</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CERTIFICATE DESIGN 3 MINI (MODERN LUXURY EMERALD) */}
      {isD3 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden border-2" style={{ borderColor: primary }}>
          {/* Radial Glow Accents */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-400 to-amber-200 opacity-30 rounded-bl-full pointer-events-none" />
          <div 
            className="absolute bottom-0 left-0 w-12 h-12 opacity-20 rounded-tr-full pointer-events-none"
            style={{ background: `linear-gradient(to top right, ${primary}, #38bdf8)` }}
          />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Award className="w-2.5 h-2.5" style={{ color: primary }} />
              <span className="text-[6.5px] font-black uppercase tracking-wider truncate" style={{ color: primary }}>
                {schoolName}
              </span>
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase tracking-tight text-slate-900">
              {title || 'CERTIFICATE OF EXCELLENCE'}
            </div>
            <div 
              className="w-12 h-0.5 rounded-full mx-auto my-0.5"
              style={{ background: `linear-gradient(to right, ${primary}, #f59e0b)` }}
            />
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">This Distinction Is Bestowed Upon</span>
            <div className="text-[10px] font-serif font-black inline-block px-3 pb-0.5 border-b-2" style={{ color: primary, borderColor: primary }}>
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-600 font-medium px-4 line-clamp-1 mt-0.5">
              High honor for exceptional sportsmanship, energetic teamwork & dedication.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-200 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Date of Issue</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border flex items-center justify-center shadow-xs" style={{ borderColor: primary, backgroundColor: tintLight }}>
                <ShieldCheck className="w-3 h-3" style={{ color: primary }} />
              </div>
              <span className="text-[3px] font-black uppercase tracking-tighter mt-0.5" style={{ color: primary }}>Verified</span>
            </div>

            <div className="text-center w-12 border-t border-slate-200 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Director</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. CERTIFICATE DESIGN 4 MINI (CORPORATE COMPLETION) */}
      {isD4 && (
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white text-slate-900 relative overflow-hidden border" style={{ borderColor: primary }}>
          {/* Geometric Frames */}
          <div className="absolute inset-1.5 border pointer-events-none" style={{ borderColor: primary }} />
          <div className="absolute inset-2.5 border pointer-events-none" style={{ borderColor: hexToRgba(primary, 0.4) }} />

          {/* Header */}
          <div className="relative z-10 text-center pt-0.5">
            <div className="text-[6.5px] font-black uppercase tracking-wider truncate px-4" style={{ color: primary }}>
              {schoolName}
            </div>
            <div className="text-[7.5px] font-serif font-black uppercase text-slate-900 tracking-wide mt-0.5">
              {title || 'CERTIFICATE OF COMPLETION'}
            </div>
            <div className="w-10 h-0.5 mx-auto my-0.5" style={{ backgroundColor: primary }} />
          </div>

          {/* Awardee */}
          <div className="relative z-10 text-center my-auto">
            <span className="text-[4px] uppercase font-bold text-slate-400 tracking-wider block">This Document Confirms That</span>
            <div className="text-[10px] font-serif font-black inline-block px-3 pb-0.5 border-b" style={{ color: primary, borderColor: primary }}>
              {studentName}
            </div>
            <p className="text-[4.5px] text-slate-600 font-medium px-4 line-clamp-1 mt-0.5">
              Satisfactorily completed the prescribed academic curriculum and project goals.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-between items-end px-3 pb-0.5 text-[4.5px] font-bold text-slate-600">
            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span>{date}</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Issue Date</span>
            </div>

            {/* Mini Gold Seal */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-600 shadow-2xs flex flex-col items-center justify-center p-0.5">
              <Award className="w-2.5 h-2.5 text-amber-950" />
            </div>

            <div className="text-center w-12 border-t border-slate-300 pt-0.5">
              <span style={{ color: primary }} className="font-serif italic font-bold">Academic Dean</span>
              <span className="block text-[3.5px] text-slate-400 uppercase">Signature</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
