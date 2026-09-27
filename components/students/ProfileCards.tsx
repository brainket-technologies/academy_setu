import React from 'react'
import { Edit2, User, Building, Heart, FileText, GraduationCap, Users, MapPin, Award, BookOpen, Fingerprint } from 'lucide-react'

// -----------------------------------------
// BASE CARD COMPONENTS
// -----------------------------------------

export function InfoCard({ title, icon: Icon, children, onEdit, fullWidth = false }: any) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-teal-600" />}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export function InfoRow({ label, value, valueClass = '' }: any) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{label}</span>
      <span className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${valueClass}`}>{value || '-'}</span>
    </div>
  )
}

export function InfoGrid({ children, cols = 2 }: any) {
  return (
    <div className={`grid grid-cols-${cols} gap-x-4 gap-y-4`}>
      {children}
    </div>
  )
}

// -----------------------------------------
// SPECIFIC CARDS
// -----------------------------------------

export function PersonalDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Personal Details" icon={User} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Academic Year" value={data?.academicYear} />
        <InfoRow label="Admission No." value={data?.admissionNo} />
        <InfoRow label="Admission Date" value={data?.admissionDate} />
        <InfoRow label="Class" value={data?.class} />
        <InfoRow label="Section" value={data?.section} />
        <InfoRow label="Medium" value={data?.medium} />
        <InfoRow label="Stream" value={data?.stream} />
        <InfoRow label="House/Block" value={data?.houseBlock} />
      </InfoGrid>
    </InfoCard>
  )
}

export function PreviousSchoolCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Previous School/College Details" icon={Building} onEdit={onEdit}>
      <InfoGrid cols={1}>
        <InfoRow label="School/College Name & Address" value={data?.prevSchoolName} />
      </InfoGrid>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoRow label="Attended Class/Course" value={data?.prevAttendedClass} />
        <InfoRow label="Last School/College Affiliated To" value={data?.prevSchoolAffiliatedTo} />
      </div>
    </InfoCard>
  )
}

export function MedicalDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Medical Details" icon={Heart} onEdit={onEdit}>
      <InfoGrid cols={3}>
        <InfoRow label="Blood Group" value={data?.bloodGroup} />
        <InfoRow label="Height" value={data?.height} />
        <InfoRow label="Weight" value={data?.weight} />
      </InfoGrid>
    </InfoCard>
  )
}

export function TCDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="TC Details" icon={FileText} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Transfer Certificate No." value={data?.tcNo} />
        <InfoRow label="Date of Issue" value={data?.tcIssueDate} />
        {data?.tcFile && (
          <div className="col-span-2">
            <InfoRow label="Transfer Certificate" value={<a href={data.tcFile} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-semibold">@ Certificate</a>} />
          </div>
        )}
      </InfoGrid>
    </InfoCard>
  )
}

export function EducationTableCard({ data, onEdit }: any) {
  const list = Array.isArray(data?.otherQualifications) 
    ? data.otherQualifications.filter((q: any) => q && (q.qualification || q.schoolName || q.rollNo || q.passYear || q.percentage))
    : []

  return (
    <InfoCard title="Education Details" icon={GraduationCap} fullWidth onEdit={onEdit}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
              <th className="py-2 px-3">Qualification</th>
              <th className="py-2 px-3">Pass. Year</th>
              <th className="py-2 px-3">Roll No.</th>
              <th className="py-2 px-3">Obt. Marks</th>
              <th className="py-2 px-3">Percentage</th>
              <th className="py-2 px-3">Subject</th>
              <th className="py-2 px-3">School Name</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-3 px-3 text-center text-slate-400 font-medium">No other qualifications added</td>
              </tr>
            ) : (
              list.map((row: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.qualification || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.passYear || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.rollNo || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.obtMarks || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.percentage || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.subject || '-'}</td>
                  <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">{row.schoolName || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </InfoCard>
  )
}

export function ParentsDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Parents Details" icon={Users} onEdit={onEdit}>
      <div className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Father Details</h4>
          <div className="flex items-start gap-4">
             <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center overflow-hidden border border-slate-200 relative">
                <User className="w-8 h-8 text-slate-400" />
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                <InfoRow label="Name" value={data?.fatherName} valueClass="text-sm font-bold" />
                <InfoRow label="Occupation" value={data?.fatherOccupation} />
                <InfoRow label="Contact" value={data?.fatherContact} />
                <InfoRow label="Annual Income" value={data?.fatherIncome} />
             </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-700" />

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Mother Details</h4>
          <div className="flex items-start gap-4">
             <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center overflow-hidden border border-slate-200 relative">
                <User className="w-8 h-8 text-slate-400" />
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                <InfoRow label="Name" value={data?.motherName} valueClass="text-sm font-bold" />
                <InfoRow label="Occupation" value={data?.motherOccupation} />
                <InfoRow label="Contact" value={data?.motherContact} />
                <InfoRow label="Annual Income" value={data?.motherIncome} />
             </div>
          </div>
        </div>

      </div>
    </InfoCard>
  )
}

export function AddressDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Address Details" icon={MapPin} onEdit={onEdit}>
      <div className="flex flex-col gap-4">
        <InfoRow label="Address" value={data?.address} />
        <InfoGrid cols={2}>
          <InfoRow label="Pincode" value={data?.pincode} />
          <InfoRow label="District" value={data?.district} />
          <InfoRow label="State" value={data?.state} />
          <InfoRow label="Domicile Certificate No." value={data?.domicileNo} />
        </InfoGrid>
      </div>
    </InfoCard>
  )
}

export function GovtIdDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Govt. ID Details" icon={Fingerprint} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Aadhar Card No." value={data?.aadharNo} />
        <InfoRow label="Nationality" value={data?.nationality || 'Indian'} />
        <InfoRow label="Religion" value={data?.religion} />
        <InfoRow label="Category" value={data?.category} />
      </InfoGrid>
    </InfoCard>
  )
}

export function BirthCertificateCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Birth Certificate Details" icon={FileText} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Birth Certificate No." value={data?.birthCertNo} />
      </InfoGrid>
    </InfoCard>
  )
}

export function ScholarshipDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Scholarship Details" icon={Award} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Scholarship ID" value={data?.scholarshipId} />
        <InfoRow label="Scholarship Password" value={data?.scholarshipPwd} />
      </InfoGrid>
    </InfoCard>
  )
}

export function BplRteDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="BPL & RTE Details" icon={BookOpen} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="BPL Student" value={data?.bplStudent || 'No'} />
        <InfoRow label="RTE Student" value={data?.isRteStudent || 'No'} />
      </InfoGrid>
    </InfoCard>
  )
}

export function GovtPortalDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Govt. Portal Details" icon={Building} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Govt. Portal Student ID" value={data?.govtStudentId} />
        <InfoRow label="Govt. Portal Family ID" value={data?.govtFamilyId} />
        <InfoRow label="Samagra ID" value={data?.samagraId} />
      </InfoGrid>
    </InfoCard>
  )
}

export function FeeDetailsCard({ data, onEdit }: any) {
  const feeItems: { label: string, detail?: string, fee?: string }[] = []

  if (data?.regFee || data?.regFeeDuration) {
    feeItems.push({ label: 'Registration Fee', detail: data.regFeeDuration, fee: data.regFee })
  }
  if (data?.admFee || data?.admFeeDuration) {
    feeItems.push({ label: 'Admission Fee', detail: data.admFeeDuration, fee: data.admFee })
  }
  if (data?.classFee || data?.classFeeDuration) {
    feeItems.push({ label: 'Class Fee', detail: `${data.classFeeDuration || ''}${data.isRteStudent === 'Yes' ? ' (RTE Exemption)' : ''}`, fee: data.classFee })
  }
  if (data?.libFee || data?.libFeeDuration) {
    feeItems.push({ label: 'Library Fee', detail: data.libFeeDuration, fee: data.libFee })
  }
  if (data?.examFee || data?.examFeeDuration) {
    feeItems.push({ label: 'Exam Fee', detail: data.examFeeDuration, fee: data.examFee })
  }
  if (data?.hostelFee || data?.hostelType || data?.hostelFeeDuration) {
    feeItems.push({ label: 'Hostel Fee', detail: `${data.hostelType ? `${data.hostelType} • ` : ''}${data.hostelFeeDuration || ''}`, fee: data.hostelFee })
  }
  if (data?.extraFee || data?.extraActivityName) {
    feeItems.push({ label: 'Extra Curricular Fee', detail: data.extraActivityName, fee: data.extraFee })
  }
  if (data?.transFee || data?.transRoute || data?.transStoppage) {
    const routeInfo = [data.transRoute, data.transStoppage, data.transDistance, data.transFeeDuration].filter(Boolean).join(' • ')
    feeItems.push({ label: 'Transportation Fee', detail: routeInfo, fee: data.transFee })
  }

  return (
    <InfoCard title="Fee Structure Details" icon={Award} fullWidth onEdit={onEdit}>
      {feeItems.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2 font-medium">No fee items configured for this student</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeItems.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{item.label}</span>
                {item.detail && <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">{item.detail}</span>}
              </div>
              <span className="text-sm font-black text-teal-600 dark:text-teal-400 mt-2 block">{item.fee || 'Configured'}</span>
            </div>
          ))}
        </div>
      )}
    </InfoCard>
  )
}
