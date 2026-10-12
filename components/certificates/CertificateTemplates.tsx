import React from 'react'
import { QrCode, Award, ShieldCheck, CheckCircle2 } from 'lucide-react'

export interface CertificateCustomProps {
  title?: string
  subtitle?: string
  schoolName?: string
  schoolAddress?: string
  studentName?: string
  className?: string
  content?: string
  date?: string
  awarder?: string
  showQr?: boolean
  showSeal?: boolean
  textColor?: string
  titleBgColor?: string
  hiddenFields?: string[]
}

// Common Gold Seal with Ribbons
const GoldSeal = ({ text = "ACADEMIC EXCELLENCE", className = "" }: { text?: string; className?: string }) => (
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
      className="absolute bottom-[-18px] left-[12px] w-6 h-12 bg-gradient-to-b from-[#1e3a8a] to-[#0f2b5c] -rotate-[30deg] z-0 shadow-sm" 
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
    ></div>
    <div 
      className="absolute bottom-[-18px] right-[12px] w-6 h-12 bg-gradient-to-b from-[#1e3a8a] to-[#0f2b5c] rotate-[30deg] z-0 shadow-sm" 
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
    ></div>
  </div>
)

// -------------------------------------------------------------
// DESIGN 1: BLUE & GOLD ROYAL GEOMETRIC (PORTRAIT/LANDSCAPE)
// -------------------------------------------------------------
export const CertificateDesign1: React.FC<CertificateCustomProps> = ({
  title = 'CERTIFICATE OF ACHIEVEMENT',
  subtitle = 'In Recognition of Academic Excellence',
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.',
  date = '15 October 2025',
  awarder = 'Principal & Director',
  showQr = true,
  showSeal = true,
  hiddenFields = []
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Decorative Gold & Blue Corners */}
      <div className="absolute top-0 left-0 w-64 h-64 -translate-x-32 -translate-y-32 rotate-45 flex flex-col z-10 shadow-md pointer-events-none">
        <div className="w-full h-8 bg-amber-400"></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-20 bg-[#1e3a8a]"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-32 translate-y-32 rotate-45 flex flex-col z-10 shadow-md pointer-events-none">
        <div className="w-full h-20 bg-[#1e3a8a]"></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-8 bg-amber-400"></div>
      </div>

      {/* Thin Gold Frame */}
      <div className="absolute inset-5 border-2 border-amber-300/80 z-0 rounded-sm pointer-events-none"></div>
      <div className="absolute inset-7 border border-[#1e3a8a]/20 z-0 rounded-xs pointer-events-none"></div>

      {/* Watermark */}
      {!isHidden('Water Mark') && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <Award className="w-96 h-96 text-[#1e3a8a]" />
        </div>
      )}

      {/* QR Code */}
      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-10 right-12 z-20 flex flex-col items-center bg-white p-1 rounded border border-slate-200 shadow-2xs">
          <QrCode className="w-12 h-12 text-slate-800" />
          <span className="text-[7px] font-mono text-slate-400 mt-0.5">VERIFIED</span>
        </div>
      )}

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center pt-10 px-24 text-center">
        {!isHidden('School Name') && (
          <h4 className="font-serif font-black text-sm tracking-widest text-[#1e3a8a] uppercase mb-0.5">
            {schoolName}
          </h4>
        )}
        {!isHidden('School Address') && (
          <p className="text-[10px] text-slate-500 font-medium mb-4">
            {schoolAddress}
          </p>
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-2">
            <h1 className="font-serif font-black text-4xl tracking-wider text-slate-900 uppercase drop-shadow-xs">
              {title}
            </h1>
            <p className="text-[#1e3a8a] font-bold text-xs tracking-[0.25em] uppercase mt-1">
              {subtitle}
            </p>
          </div>
        )}

        <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-3"></div>

        <p className="text-[11px] tracking-widest text-slate-500 font-semibold uppercase mb-2">
          This Certificate is Proudly Presented To
        </p>

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <div className="my-1">
            <h3 className="text-[#1e3a8a] font-serif font-black text-4xl tracking-wide border-b-2 border-amber-400/80 px-8 pb-1 inline-block">
              {studentName}
            </h3>
          </div>
        )}

        {/* Description / Content */}
        <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-xl mx-auto mt-4 px-6">
          {content}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end px-20 pb-10 mt-auto">
        {/* Date */}
        <div className="flex flex-col items-center w-40">
          {!isHidden('Certificate Date') && (
            <>
              <p className="font-bold text-xs text-slate-800 mb-1">{date}</p>
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Date of Issue</p>
            </>
          )}
        </div>

        {/* Seal */}
        {showSeal && !isHidden('Water Mark') && (
          <div className="mb-2">
            <GoldSeal />
          </div>
        )}

        {/* Awarder / Principal Signature */}
        <div className="flex flex-col items-center w-40">
          {!isHidden('Principal Sign') && (
            <>
              <p className="font-serif italic font-bold text-sm text-[#1e3a8a] mb-1">Dr. S. K. Sharma</p>
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{awarder}</p>
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
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certificate is conferred in recognition of exceptional scholarly merit, consistent diligence, and exemplary conduct shown throughout the academic term.',
  date = '15 October 2025',
  awarder = 'Principal / Head of Institution',
  showSeal = true,
  hiddenFields = []
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)

  return (
    <div className="w-[800px] h-[580px] bg-[#faf8f2] relative overflow-hidden flex flex-col font-serif shrink-0 border-[14px] border-white shadow-2xl select-none text-slate-800">
      {/* Ornate Gold Border */}
      <div className="absolute inset-3 border-[2.5px] border-[#b08d55] flex z-10 pointer-events-none">
        <div className="absolute -top-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-[#b08d55] text-2xl">⚜</div>
        <div className="absolute -top-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-[#b08d55] text-2xl">⚜</div>
        <div className="absolute -bottom-3.5 -left-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-[#b08d55] text-2xl">⚜</div>
        <div className="absolute -bottom-3.5 -right-3.5 w-10 h-10 bg-[#faf8f2] flex items-center justify-center text-[#b08d55] text-2xl">⚜</div>
      </div>

      <div className="relative z-20 flex flex-col items-center pt-8 px-20 flex-1 text-center">
        {!isHidden('School Name') && (
          <h4 className="font-serif font-black text-xs tracking-widest text-[#966b2e] uppercase mb-0.5">
            {schoolName}
          </h4>
        )}
        {!isHidden('School Address') && (
          <p className="text-[9.5px] text-slate-500 font-sans mb-3">
            {schoolAddress}
          </p>
        )}

        {/* Certificate Title */}
        {!isHidden('Title') && (
          <div className="mb-1">
            <h1 className="font-black text-4xl tracking-wider text-slate-900 uppercase">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-slate-600 mt-1">
              <div className="w-10 h-px bg-[#b08d55]"></div>
              <h2 className="tracking-[0.2em] font-medium text-xs text-[#966b2e] uppercase">{subtitle}</h2>
              <div className="w-10 h-px bg-[#b08d55]"></div>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 text-[#b08d55] my-2 text-xs">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>

        <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase mb-2 font-sans">
          This Honor is Bestowed Upon
        </p>

        {/* Student Name */}
        {!isHidden('Student Name') && (
          <h3 className="text-[#85571a] text-5xl mb-2 font-medium tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            {studentName}
          </h3>
        )}

        <div className="w-full max-w-xs mx-auto flex items-center gap-2 mb-3 text-[#b08d55]">
          <span className="text-xs">♦</span>
          <div className="flex-1 h-px bg-[#b08d55]"></div>
          <span className="text-xs">♦</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed max-w-xl px-6 font-sans">
          {content}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-20 flex justify-between items-end px-20 pb-8 mt-auto h-32">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <p className="text-xs text-slate-700 font-bold mb-1 font-sans">{date}</p>
              <div className="w-full h-px bg-[#b08d55]"></div>
              <p className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase font-sans mt-1">Date</p>
            </>
          )}
        </div>

        {showSeal && (
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#b08d55] flex items-center justify-center text-[#b08d55] flex-col relative shadow-inner bg-amber-50/50">
            <span className="text-[9px]">★★★</span>
            <span className="font-bold text-[10px] text-center leading-tight">MERIT<br/>AWARD</span>
            <span className="text-[9px]">★★★</span>
          </div>
        )}

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <p className="text-lg mb-0.5 text-[#966b2e]" style={{ fontFamily: 'cursive' }}>Authorized Sign</p>
              <div className="w-full h-px bg-[#b08d55]"></div>
              <p className="text-[8.5px] text-slate-400 font-bold tracking-widest uppercase font-sans mt-1">{awarder}</p>
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
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'Presented in high honor and appreciation for exceptional sportsmanship, energetic teamwork, and exemplary performance representing the institution with pride.',
  date = '15 October 2025',
  awarder = 'Principal & Sports Council',
  showQr = true,
  hiddenFields = []
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border-[10px] border-[#064e3b] shadow-2xl select-none text-slate-800">
      {/* Decorative Gold & Green Accent Bars */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-400 to-amber-200 opacity-20 rounded-bl-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-emerald-600 to-teal-400 opacity-15 rounded-tr-full pointer-events-none"></div>

      <div className="absolute inset-4 border border-emerald-800/20 pointer-events-none"></div>

      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-8 right-8 z-20 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 shadow-2xs">
          <QrCode className="w-12 h-12 text-emerald-950" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center pt-8 px-24 flex-1 text-center">
        {!isHidden('School Name') && (
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
              <Award className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-xs tracking-widest text-emerald-900 uppercase">
              {schoolName}
            </h4>
          </div>
        )}
        {!isHidden('School Address') && (
          <p className="text-[9.5px] text-slate-400 font-medium mb-3">
            {schoolAddress}
          </p>
        )}

        {!isHidden('Title') && (
          <div className="mb-2">
            <h1 className="font-serif font-black text-4xl tracking-wider text-emerald-950 uppercase">
              {title}
            </h1>
            <p className="text-amber-600 font-bold text-xs tracking-[0.25em] uppercase mt-1">
              {subtitle}
            </p>
          </div>
        )}

        <div className="w-24 h-1 bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full my-2"></div>

        <p className="text-[10px] tracking-widest text-slate-500 font-bold uppercase mb-2">
          This Distinction is Bestowed Upon
        </p>

        {!isHidden('Student Name') && (
          <h3 className="text-emerald-900 font-serif font-black text-4xl tracking-wide border-b-2 border-emerald-600/40 px-8 pb-1 inline-block my-1">
            {studentName}
          </h3>
        )}

        <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-xl mx-auto mt-4 px-6">
          {content}
        </p>
      </div>

      <div className="relative z-10 flex justify-between items-end px-20 pb-8 mt-auto">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <p className="font-bold text-xs text-slate-800 mb-1">{date}</p>
              <div className="w-full h-px bg-emerald-200 mb-1"></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">Date of Issue</p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-800 shadow-sm">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
          </div>
          <span className="text-[8px] font-bold text-emerald-900 uppercase tracking-wider mt-1">Verified Credential</span>
        </div>

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <p className="font-serif italic font-bold text-sm text-emerald-900 mb-1">Director.Admin</p>
              <div className="w-full h-px bg-emerald-200 mb-1"></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">{awarder}</p>
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
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  studentName = 'Student Name',
  content = 'This certifies the satisfactory completion of the prescribed curriculum and active participation in institutional projects with sincere effort and commendable diligence.',
  date = '15 October 2025',
  awarder = 'Principal & Academic Dean',
  showQr = true,
  showSeal = true,
  hiddenFields = []
}) => {
  const isHidden = (field: string) => hiddenFields.includes(field)

  return (
    <div className="w-[800px] h-[580px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-300 shadow-2xl select-none text-slate-800">
      {/* Sleek Blue Border Frames */}
      <div className="absolute inset-5 border-2 border-[#1e293b] pointer-events-none"></div>
      <div className="absolute inset-7 border border-[#3b82f6]/40 pointer-events-none"></div>

      {showQr && !isHidden('QR Code') && (
        <div className="absolute top-10 right-12 z-20 bg-slate-50 p-1 rounded border border-slate-200 shadow-2xs">
          <QrCode className="w-12 h-12 text-slate-800" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center pt-10 px-24 flex-1 text-center">
        {!isHidden('School Name') && (
          <h4 className="font-bold text-xs tracking-widest text-[#1e293b] uppercase mb-0.5">
            {schoolName}
          </h4>
        )}
        {!isHidden('School Address') && (
          <p className="text-[9.5px] text-slate-500 font-medium mb-3">
            {schoolAddress}
          </p>
        )}

        {!isHidden('Title') && (
          <div className="mb-2">
            <h1 className="font-serif font-black text-4xl tracking-wider text-slate-900 uppercase">
              {title}
            </h1>
            <p className="text-[#3b82f6] font-bold text-xs tracking-[0.25em] uppercase mt-1">
              {subtitle}
            </p>
          </div>
        )}

        <div className="w-28 h-0.5 bg-[#3b82f6] my-2"></div>

        <p className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase mb-2">
          This Document Confirms That
        </p>

        {!isHidden('Student Name') && (
          <h3 className="text-[#1e293b] font-serif font-black text-4xl tracking-wide border-b-2 border-[#3b82f6]/60 px-8 pb-1 inline-block my-1">
            {studentName}
          </h3>
        )}

        <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-xl mx-auto mt-4 px-6">
          {content}
        </p>
      </div>

      <div className="relative z-10 flex justify-between items-end px-20 pb-10 mt-auto">
        <div className="flex flex-col items-center w-36">
          {!isHidden('Certificate Date') && (
            <>
              <p className="font-bold text-xs text-slate-800 mb-1">{date}</p>
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">Date of Issue</p>
            </>
          )}
        </div>

        {showSeal && (
          <div className="mb-1">
            <GoldSeal text="CERTIFIED" />
          </div>
        )}

        <div className="flex flex-col items-center w-36">
          {!isHidden('Principal Sign') && (
            <>
              <p className="font-serif italic font-bold text-sm text-[#1e293b] mb-1">Dean.Academics</p>
              <div className="w-full h-px bg-slate-300 mb-1"></div>
              <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">{awarder}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
