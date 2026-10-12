import React from 'react'
import { QrCode, ShieldCheck, Award, Building2, Phone, Mail, MapPin, Calendar, User, HeartPulse } from 'lucide-react'

export interface IdCardCustomProps {
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  udiseCode?: string
  affiliationCode?: string
  title?: string
  tagline?: string
  session?: string
  showQr?: boolean
  showWatermark?: boolean
  showPrincipalSign?: boolean
  showBloodGroup?: boolean
  showTopHeaderTagline?: boolean
  showWatermarkStamp?: boolean
  bottomNotes?: string
  data?: any
}

// -------------------------------------------------------------
// STUDENT DESIGN 1: MODERN VERTICAL SMART CARD (PORTRAIT)
// -------------------------------------------------------------
export const StudentDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STUDENT IDENTITY CARD',
  tagline = 'Affiliated to CBSE, New Delhi',
  affiliationCode = 'CBSE-213089',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  data
}) => {
  const student = {
    name: data?.name || 'AARAV SHARMA',
    class: data?.class || 'Class 10 - A',
    rollNo: data?.rollNo || '24',
    admNo: data?.admNo || 'AS-2024-1048',
    fatherName: data?.fatherName || 'Rajesh Sharma',
    dob: data?.dob || '14/08/2010',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || '+91 98765 43210',
    photo: data?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* Decorative Top Wave Header */}
      <div className="relative bg-gradient-to-br from-[#0f2b5c] via-[#1b4382] to-[#0284c7] text-white pt-3 pb-7 px-3 text-center shadow-md">
        {/* Lanyard Hole Graphic Simulation */}
        <div className="w-12 h-2.5 bg-black/25 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-amber-400/90 text-[#0f2b5c] flex items-center justify-center font-black text-[10px] shadow-sm">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            {schoolName}
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-sky-100 font-medium tracking-wide">
            {tagline} {affiliationCode && `• Affil: ${affiliationCode}`}
          </p>
        )}
        <p className="text-[7.5px] text-sky-200/90 truncate">{schoolAddress}</p>

        {/* Role Pill */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-black text-[9px] px-3 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white/50">
          {title} • {session}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {/* Subtle Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <Building2 className="w-44 h-44 text-slate-900" />
          </div>
        )}

        {/* Student Photo */}
        <div className="relative mb-2 mt-1">
          <div className="w-24 h-24 rounded-xl border-[2.5px] border-[#0284c7] bg-slate-100 overflow-hidden shadow-md relative">
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar if image fails to load
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        {/* Student Name & Class */}
        <h3 className="font-black text-sm text-[#0f2b5c] tracking-wide text-center uppercase leading-snug">
          {student.name}
        </h3>
        <div className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-[#0284c7] font-bold text-[9px] px-2.5 py-0.5 rounded-md mt-0.5 mb-2">
          <span>{student.class}</span>
          <span>•</span>
          <span>Roll No: {student.rollNo}</span>
        </div>

        {/* Details Grid */}
        <div className="w-full text-[10px] space-y-1 bg-slate-50/80 p-2 rounded-lg border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Adm No:</span>
            <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Father's Name:</span>
            <span className="font-bold text-slate-800 truncate max-w-[120px]">{student.fatherName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">D.O.B:</span>
            <span className="font-bold text-slate-800">{student.dob}</span>
          </div>
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Blood Group:</span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{student.bloodGroup}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Emergency No:</span>
            <span className="font-bold text-slate-800">{student.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
            <QrCode className="w-8 h-8 text-slate-800" />
            <div className="text-[6.5px] text-slate-400 font-mono leading-none">
              <p>VERIFIED</p>
              <p>ID #{student.admNo.slice(-4)}</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            {/* Stamp simulation */}
            <div className="h-6 w-16 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-blue-900 text-[11px] rotate-[-5deg] tracking-tight">
                M.Sharma
              </span>
              <div className="absolute inset-0 border border-blue-600/30 rounded-full rotate-[-12deg] pointer-events-none"></div>
            </div>
            <p className="text-[7.5px] font-black text-slate-600 uppercase tracking-tighter">
              Principal Signature
            </p>
          </div>
        )}
      </div>

      {/* Contact line */}
      <div className="bg-[#0f2b5c] text-white text-[7px] py-1 px-2 text-center truncate">
        Helpline: {schoolPhone} • Valid for {session}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// STUDENT DESIGN 2: ACADEMIC HORIZONTAL SMART CARD (LANDSCAPE)
// -------------------------------------------------------------
export const StudentDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'GLOBAL HERITAGE ACADEMY',
  schoolAddress = 'Campus Road, Civil Lines, Jaipur',
  schoolPhone = '+91 141 2789123',
  session = '2025-26',
  title = 'STUDENT IDENTITY CARD',
  tagline = 'Excellence in Education',
  affiliationCode = 'CBSE AFFIL NO. 1730452',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const student = {
    name: data?.name || 'ANANYA VERMA',
    class: data?.class || 'Class VIII - Sec B',
    rollNo: data?.rollNo || '18',
    admNo: data?.admNo || 'GHA-2024-8842',
    fatherName: data?.fatherName || 'Vikram Verma',
    motherName: data?.motherName || 'Sunita Verma',
    dob: data?.dob || '22/11/2011',
    bloodGroup: data?.bloodGroup || 'B+',
    phone: data?.phone || '+91 98101 23456',
    photo: data?.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#047857] text-white px-4 py-2 flex items-center justify-between border-b-2 border-amber-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-[#064e3b] flex items-center justify-center font-black shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              {schoolName}
            </h2>
            <p className="text-[8px] text-emerald-100 font-medium">
              {tagline} • {affiliationCode}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-amber-400 text-emerald-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {session}
          </span>
          <p className="text-[7.5px] text-emerald-200 mt-0.5 truncate max-w-[130px]">{schoolAddress}</p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {/* Subtle Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-56 h-56 text-emerald-900" />
          </div>
        )}

        {/* Left: Photo & Identification */}
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div className="w-24 h-28 rounded-xl border-2 border-emerald-600 p-0.5 bg-white shadow-md relative">
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-amber-400 text-emerald-950 text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">
              STUDENT
            </div>
          </div>

          {showQr && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-md mt-2 w-full justify-center">
              <QrCode className="w-6 h-6 text-slate-800" />
              <div className="text-[6.5px] font-mono text-slate-500 leading-tight">
                <div>SCAN TO</div>
                <div className="font-bold text-slate-800">VERIFY</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data Columns */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-100 pb-1 mb-2">
              <div>
                <h3 className="font-black text-base text-emerald-950 uppercase tracking-tight">
                  {student.name}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {student.class}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 font-semibold">Roll No:</span>
                <span className="font-black text-sm text-emerald-900 ml-1">{student.rollNo}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">ADMISSION NO</span>
                <span className="font-bold text-slate-800 font-mono">{student.admNo}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">FATHER'S NAME</span>
                <span className="font-bold text-slate-800 truncate block">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">DATE OF BIRTH</span>
                <span className="font-bold text-slate-800">{student.dob}</span>
              </div>
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">BLOOD GROUP</span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{student.bloodGroup}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold block text-[8px]">EMERGENCY CONTACT</span>
                <span className="font-bold text-slate-800">{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              {/* Simulated Barcode */}
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[1,2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,1].map((w, idx) => (
                  <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.2}px` }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{student.admNo}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-emerald-900 text-xs rotate-[-4deg]">
                    K.Singhal
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  Principal Signature
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#064e3b] text-white text-[7.5px] py-1 px-4 flex items-center justify-between">
        <span>If found, return to school office • Tel: {schoolPhone}</span>
        <span className="font-semibold text-amber-300">{title}</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TEACHER DESIGN 1: EXECUTIVE VERTICAL FACULTY PASS (PORTRAIT)
// -------------------------------------------------------------
export const TeacherDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Faculty of Senior Academics',
  affiliationCode = 'FACULTY ID NO.',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  data
}) => {
  const teacher = {
    name: data?.name || 'DR. MEENAKSHI SUNDARAM',
    designation: data?.designation || 'Senior PGT Mathematics & HOD',
    department: data?.department || 'Science & Mathematics',
    empId: data?.empId || 'FAC-MATH-042',
    qualification: data?.qualification || 'M.Sc, M.Phil, Ph.D, B.Ed',
    doj: data?.doj || '12-07-2018',
    bloodGroup: data?.bloodGroup || 'AB+',
    phone: data?.phone || '+91 98112 34567',
    email: data?.email || 'meenakshi@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* Luxury Royal Burgundy Header */}
      <div className="relative bg-gradient-to-br from-[#581c87] via-[#701a75] to-[#831843] text-white pt-3 pb-8 px-3 text-center shadow-md">
        {/* Lanyard Hole Clip */}
        <div className="w-12 h-2.5 bg-black/25 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center font-black text-[10px] shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            {schoolName}
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-rose-200 font-semibold tracking-wider uppercase">
            {tagline}
          </p>
        )}
        <p className="text-[7.5px] text-rose-100/80 truncate">{schoolAddress}</p>

        {/* Badge Pill */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black text-[9px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white">
          {title}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-48 h-48 text-purple-950" />
          </div>
        )}

        {/* Faculty Photo */}
        <div className="relative mb-2 mt-1">
          <div className="w-24 h-24 rounded-full border-[3px] border-[#831843] bg-purple-50 p-0.5 shadow-md relative overflow-hidden">
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-amber-400 text-purple-950 text-[7px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm">
            FACULTY
          </div>
        </div>

        {/* Teacher Name & Designation */}
        <h3 className="font-black text-sm text-[#701a75] tracking-wide text-center uppercase leading-snug">
          {teacher.name}
        </h3>
        <p className="text-[9.5px] font-bold text-slate-700 text-center line-clamp-1 mt-0.5 mb-2">
          {teacher.designation}
        </p>

        {/* Teacher Credentials Table */}
        <div className="w-full text-[9.5px] space-y-1 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Faculty ID:</span>
            <span className="font-bold text-[#831843] font-mono">{teacher.empId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Department:</span>
            <span className="font-bold text-slate-800 truncate max-w-[125px]">{teacher.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Qualification:</span>
            <span className="font-bold text-slate-800 text-[8.5px] truncate max-w-[125px]">{teacher.qualification}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Date of Joining:</span>
            <span className="font-bold text-slate-800">{teacher.doj}</span>
          </div>
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Blood Group:</span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{teacher.bloodGroup}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Official Phone:</span>
            <span className="font-bold text-slate-800">{teacher.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
            <QrCode className="w-8 h-8 text-slate-800" />
            <div className="text-[6.5px] text-slate-400 font-mono leading-none">
              <p>BIOMETRIC</p>
              <p className="font-bold text-purple-900">VERIFIED</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            <div className="h-6 w-16 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-purple-950 text-[11px] rotate-[-5deg]">
                Director.A
              </span>
              <div className="absolute inset-0 border border-purple-600/30 rounded-full rotate-[8deg] pointer-events-none"></div>
            </div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
              Authorized Signatory
            </p>
          </div>
        )}
      </div>

      {/* Security strip */}
      <div className="bg-gradient-to-r from-[#581c87] to-[#831843] text-white text-[7px] py-1 px-3 flex items-center justify-between">
        <span>Academic Year: {session}</span>
        <span className="text-amber-300 font-mono font-bold">STATUS: REGULAR FACULTY</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TEACHER DESIGN 2: PRESTIGE HORIZONTAL FACULTY BADGE (LANDSCAPE)
// -------------------------------------------------------------
export const TeacherDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'FACULTY IDENTITY CARD',
  tagline = 'Affiliated to CBSE, New Delhi',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const teacher = {
    name: data?.name || 'PROF. RAJESH MALHOTRA',
    designation: data?.designation || 'HOD English & Linguistics',
    department: data?.department || 'Department of Languages',
    empId: data?.empId || 'FAC-ENG-108',
    qualification: data?.qualification || 'M.A., M.Phil., UGC-NET, B.Ed',
    experience: data?.experience || '12+ Years Experience',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 98450 11223',
    email: data?.email || 'r.malhotra@academy.edu',
    photo: data?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0d9488] text-white px-4 py-2 flex items-center justify-between border-b-2 border-teal-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center font-black shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              {schoolName}
            </h2>
            <p className="text-[8px] text-teal-200 font-medium">
              {tagline} • CAMPUS ID
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-teal-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            FACULTY • {session}
          </span>
          <p className="text-[7.5px] text-slate-300 mt-0.5 truncate max-w-[140px]">{schoolAddress}</p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Award className="w-56 h-56 text-slate-900" />
          </div>
        )}

        {/* Left Column: Photo & Badges */}
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div className="w-24 h-28 rounded-xl border-2 border-teal-600 p-0.5 bg-white shadow-md relative">
            <img 
              src={teacher.photo} 
              alt={teacher.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-teal-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">
              TEACHER
            </div>
          </div>

          {showQr && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-md mt-2 w-full justify-center">
              <QrCode className="w-6 h-6 text-slate-800" />
              <div className="text-[6.5px] font-mono text-slate-500 leading-tight">
                <div>STAFF PORTAL</div>
                <div className="font-bold text-teal-700">AUTH ID</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Faculty Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-teal-100 pb-1 mb-2">
              <div>
                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                  {teacher.name}
                </h3>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {teacher.designation}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 font-semibold block">FACULTY ID</span>
                <span className="font-black text-sm text-teal-900 font-mono">{teacher.empId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">DEPARTMENT</span>
                <span className="font-bold text-slate-800 truncate block">{teacher.department}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">QUALIFICATION</span>
                <span className="font-bold text-slate-800 truncate block">{teacher.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">EXPERIENCE</span>
                <span className="font-bold text-slate-800">{teacher.experience}</span>
              </div>
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">BLOOD GROUP</span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{teacher.bloodGroup}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">CONTACT</span>
                <span className="font-bold text-slate-800">{teacher.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">EMAIL</span>
                <span className="font-bold text-slate-800 truncate block">{teacher.email}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[2,1,2,3,1,1,2,3,1,2,1,3,2,1,1,2].map((w, idx) => (
                  <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.3}px` }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{teacher.empId}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-teal-900 text-xs rotate-[-4deg]">
                    Prof.R.Gupta
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  Authorized Signatory
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#0f172a] text-white text-[7.5px] py-1 px-4 flex items-center justify-between">
        <span>Campus Faculty Card • Return if found to {schoolAddress}</span>
        <span className="font-bold text-teal-300">VALID SESSION: {session}</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// EMPLOYEE DESIGN 1: CORPORATE VERTICAL STAFF PASS (PORTRAIT)
// -------------------------------------------------------------
export const EmployeeDesignVertical: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY CARD',
  tagline = 'Administrative & Support Staff',
  affiliationCode = 'STAFF CODE',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  showTopHeaderTagline = true,
  data
}) => {
  const staff = {
    name: data?.name || 'VIKRAM SINGH RATHORE',
    designation: data?.designation || 'Administrative Officer',
    department: data?.department || 'Administration & Accounts',
    empId: data?.empId || 'EMP-ADM-019',
    shift: data?.shift || 'Main Campus • Day Shift',
    doj: data?.doj || '05-02-2020',
    bloodGroup: data?.bloodGroup || 'A+',
    phone: data?.phone || '+91 97123 45678',
    emergencyContact: data?.emergencyContact || '+91 97123 99999',
    photo: data?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[280px] h-[450px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 text-slate-800 select-none">
      {/* High-Tech Slate & Indigo Header */}
      <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] text-white pt-3 pb-8 px-3 text-center shadow-md">
        {/* Realistic Lanyard Hole */}
        <div className="w-12 h-2.5 bg-black/30 rounded-full mx-auto mb-1 border border-white/20"></div>

        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-black text-[13px] tracking-tight uppercase leading-tight line-clamp-1 drop-shadow-sm">
            {schoolName}
          </h2>
        </div>

        {showTopHeaderTagline && (
          <p className="text-[8px] text-blue-200 font-semibold tracking-wider uppercase">
            {tagline}
          </p>
        )}
        <p className="text-[7.5px] text-slate-300 truncate">{schoolAddress}</p>

        {/* Badge Pill */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[9px] px-3.5 py-0.5 rounded-full shadow-md tracking-wider uppercase border border-white">
          {title}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center pt-5 px-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Building2 className="w-48 h-48 text-slate-950" />
          </div>
        )}

        {/* Staff Photo */}
        <div className="relative mb-2 mt-1">
          <div className="w-24 h-24 rounded-2xl border-[3px] border-[#2563eb] bg-slate-100 p-0.5 shadow-md relative overflow-hidden">
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            ACTIVE
          </div>
        </div>

        {/* Staff Name & Designation */}
        <h3 className="font-black text-sm text-slate-900 tracking-wide text-center uppercase leading-snug">
          {staff.name}
        </h3>
        <p className="text-[9.5px] font-bold text-blue-700 text-center line-clamp-1 mt-0.5 mb-2">
          {staff.designation}
        </p>

        {/* Staff Details Card */}
        <div className="w-full text-[9.5px] space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Staff ID:</span>
            <span className="font-bold text-[#2563eb] font-mono">{staff.empId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Department:</span>
            <span className="font-bold text-slate-800 truncate max-w-[125px]">{staff.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Campus Shift:</span>
            <span className="font-bold text-slate-800 text-[8.5px] truncate max-w-[125px]">{staff.shift}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Date of Joining:</span>
            <span className="font-bold text-slate-800">{staff.doj}</span>
          </div>
          {showBloodGroup && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Blood Group:</span>
              <span className="font-bold text-red-600 bg-red-50 px-1 rounded text-[9px]">{staff.bloodGroup}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Emergency No:</span>
            <span className="font-bold text-slate-800">{staff.emergencyContact}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-2 flex items-center justify-between mt-auto relative z-10">
        {showQr ? (
          <div className="bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
            <QrCode className="w-8 h-8 text-slate-800" />
            <div className="text-[6.5px] text-slate-500 font-mono leading-none">
              <p>ACCESS GATE</p>
              <p className="font-bold text-blue-700">AUTHORIZED</p>
            </div>
          </div>
        ) : <div />}

        {showPrincipalSign && (
          <div className="text-right flex flex-col items-end">
            <div className="h-6 w-16 relative flex items-center justify-center">
              <span className="font-serif italic font-black text-slate-900 text-[11px] rotate-[-5deg]">
                Admin.Dir
              </span>
              <div className="absolute inset-0 border border-blue-600/30 rounded-full rotate-[-5deg] pointer-events-none"></div>
            </div>
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
              Admin Signature
            </p>
          </div>
        )}
      </div>

      {/* Security strip */}
      <div className="bg-[#0f172a] text-white text-[7px] py-1 px-3 flex items-center justify-between">
        <span>Card Validity: {session}</span>
        <span className="text-emerald-400 font-mono font-bold">PERMANENT STAFF</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// EMPLOYEE DESIGN 2: MODERN HORIZONTAL STAFF PASS (LANDSCAPE)
// -------------------------------------------------------------
export const EmployeeDesignHorizontal: React.FC<IdCardCustomProps> = ({
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi',
  schoolPhone = '+91 11 2345 6789',
  session = '2025-26',
  title = 'STAFF IDENTITY CARD',
  tagline = 'Campus Operations & Staff',
  showQr = true,
  showWatermark = true,
  showPrincipalSign = true,
  showBloodGroup = true,
  data
}) => {
  const staff = {
    name: data?.name || 'SURESH KUMAR YADAV',
    designation: data?.designation || 'Senior Lab & Systems Incharge',
    department: data?.department || 'IT & Campus Infrastructure',
    empId: data?.empId || 'EMP-TECH-055',
    workStation: data?.workStation || 'Central Computer Lab - Block B',
    bloodGroup: data?.bloodGroup || 'O+',
    phone: data?.phone || '+91 96543 21098',
    emergencyContact: data?.emergencyContact || '+91 96543 21099',
    photo: data?.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  }

  return (
    <div className="w-[450px] h-[280px] bg-white rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white px-4 py-2 flex items-center justify-between border-b-2 border-indigo-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wide leading-tight drop-shadow-sm">
              {schoolName}
            </h2>
            <p className="text-[8px] text-indigo-200 font-medium">
              {tagline} • STAFF CREDENTIAL
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-indigo-300 text-indigo-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            STAFF PASS • {session}
          </span>
          <p className="text-[7.5px] text-indigo-200 mt-0.5 truncate max-w-[140px]">{schoolAddress}</p>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex px-4 py-2.5 gap-4 relative">
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <Building2 className="w-56 h-56 text-slate-900" />
          </div>
        )}

        {/* Left Column: Photo & Security QR */}
        <div className="w-28 flex flex-col items-center justify-between shrink-0">
          <div className="w-24 h-28 rounded-xl border-2 border-indigo-600 p-0.5 bg-white shadow-md relative">
            <img 
              src={staff.photo} 
              alt={staff.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 -z-10">
              <User className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-indigo-700 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm">
              EMPLOYEE
            </div>
          </div>

          {showQr && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-md mt-2 w-full justify-center">
              <QrCode className="w-6 h-6 text-slate-800" />
              <div className="text-[6.5px] font-mono text-slate-500 leading-tight">
                <div>SECURITY PASS</div>
                <div className="font-bold text-indigo-700">GATE 01-04</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Staff Information */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-indigo-100 pb-1 mb-2">
              <div>
                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                  {staff.name}
                </h3>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {staff.designation}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 font-semibold block">STAFF ID</span>
                <span className="font-black text-sm text-indigo-950 font-mono">{staff.empId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">DEPARTMENT</span>
                <span className="font-bold text-slate-800 truncate block">{staff.department}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">WORK STATION</span>
                <span className="font-bold text-slate-800 truncate block">{staff.workStation}</span>
              </div>
              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[8px]">BLOOD GROUP</span>
                  <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded text-[9px]">{staff.bloodGroup}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold block text-[8px]">OFFICIAL CONTACT</span>
                <span className="font-bold text-slate-800">{staff.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-semibold block text-[8px]">EMERGENCY CONTACT</span>
                <span className="font-bold text-slate-800">{staff.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              <div className="h-6 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
                {[1,3,1,2,2,1,3,1,2,1,1,3,2,1].map((w, idx) => (
                  <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.3}px` }}></div>
                ))}
              </div>
              <span className="text-[7.5px] font-mono text-slate-400">{staff.empId}</span>
            </div>

            {showPrincipalSign && (
              <div className="text-right">
                <div className="h-5 flex items-center justify-end">
                  <span className="font-serif italic font-black text-indigo-900 text-xs rotate-[-4deg]">
                    Registrar.S
                  </span>
                </div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                  Registrar / Principal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#1e1b4b] text-white text-[7.5px] py-1 px-4 flex items-center justify-between">
        <span>Campus Non-Teaching Staff Pass • Valid at all institutional gates</span>
        <span className="font-bold text-indigo-300">ACCESS: ALL BLOCKS</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// CARD BACK SIDE TEMPLATE (SUPPORTING BOTH PORTRAIT & LANDSCAPE)
// -------------------------------------------------------------
export const IdCardBackDesign: React.FC<{
  orientation?: 'portrait' | 'landscape'
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  bottomNotes?: string
}> = ({
  orientation = 'portrait',
  schoolName = 'COSMOPOLITAN INTER COLLEGE',
  schoolAddress = 'Knowledge Park, Sector 62, New Delhi - 110001',
  schoolPhone = '+91 11 2345 6789',
  schoolEmail = 'info@academy.edu',
  bottomNotes = 'This card is the property of the institute. If found, please return to the school administration office immediately.'
}) => {
  if (orientation === 'landscape') {
    return (
      <div className="w-[450px] h-[280px] bg-slate-50 rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-300 shrink-0 p-5 select-none text-slate-700">
        <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
          <span>Terms & Campus Guidelines</span>
          <span className="text-[8px] font-normal text-slate-500">BACK SIDE</span>
        </h4>

        <div className="grid grid-cols-2 gap-4 text-[9px] flex-1">
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li>Must be displayed visibly at all times within campus.</li>
            <li>Non-transferable; strict action for fraudulent use.</li>
            <li>Loss must be reported immediately to school authorities.</li>
            <li>Replacement charges applicable for re-issuance.</li>
          </ul>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-800 text-[9.5px]">Campus Return Address:</p>
              <p className="text-[8.5px] text-slate-500 leading-relaxed mt-0.5">{schoolName}, {schoolAddress}</p>
            </div>
            <div className="text-[8px] text-slate-600 space-y-0.5 mt-2">
              <p>📞 Helpline: {schoolPhone}</p>
              <p>✉️ Email: {schoolEmail}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[8px] text-slate-500">
          <p className="italic max-w-[320px]">{bottomNotes}</p>
          <div className="h-5 flex items-end gap-[1.5px] px-1 bg-white border border-slate-200 rounded">
            {[2,1,3,1,2,1,2,3,1,2,1].map((w, idx) => (
              <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w}px` }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[280px] h-[450px] bg-slate-50 rounded-2xl shadow-xl relative overflow-hidden flex flex-col font-sans border border-slate-300 shrink-0 p-4 select-none text-slate-700">
      <div className="w-12 h-2.5 bg-slate-200 rounded-full mx-auto mb-2 border border-slate-300"></div>

      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 text-center">
        Terms & Campus Guidelines
      </h4>

      <ul className="space-y-2 text-[9.5px] text-slate-600 list-disc list-inside px-1 flex-1">
        <li>This card is non-transferable and remains the property of the institute.</li>
        <li>Must be worn visibly during school/campus hours.</li>
        <li>Loss of this card should be reported to the office immediately.</li>
        <li>Damage or misuse of the card is strictly prohibited.</li>
        <li>Valid only for authorized campus access and library services.</li>
      </ul>

      <div className="bg-white p-3 rounded-xl border border-slate-200 mb-3 space-y-1">
        <p className="font-bold text-[9px] text-slate-800 uppercase tracking-wide">Campus Return Address</p>
        <p className="text-[8.5px] text-slate-600 font-medium">{schoolName}</p>
        <p className="text-[8px] text-slate-500 leading-tight">{schoolAddress}</p>
        <div className="text-[8px] text-slate-600 pt-1 space-y-0.5">
          <p>📞 Phone: {schoolPhone}</p>
          <p>✉️ Email: {schoolEmail}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2 text-center">
        <p className="text-[7.5px] text-slate-500 italic mb-1.5 leading-snug">
          {bottomNotes}
        </p>
        <div className="h-6 flex items-end justify-center gap-[1.5px] px-2 py-0.5 bg-white border border-slate-200 rounded mx-auto w-fit">
          {[2,1,3,1,2,1,2,3,1,2,1,3,2,1,2].map((w, idx) => (
            <div key={idx} className="bg-slate-800 h-full" style={{ width: `${w * 1.2}px` }}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// BACKWARDS-COMPATIBILITY EXPORTS
// -------------------------------------------------------------
export const IdCardDesignBlue = StudentDesignVertical
export const IdCardDesignPink = TeacherDesignVertical
export const IdCardDesignPurple = StudentDesignHorizontal
