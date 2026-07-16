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
        <InfoRow label="Academic Year" value={data?.academicYear || '2025-26'} />
        <InfoRow label="Admission No." value={data?.admissionNo || 'SCH123'} />
        <InfoRow label="Admission Date" value={data?.admissionDate || '03-03-2025'} />
        <InfoRow label="Class" value={data?.class || 'Class V'} />
        <InfoRow label="Section" value={data?.section || 'Section A'} />
        <InfoRow label="Medium" value={data?.medium || 'English'} />
        <InfoRow label="Stream" value={data?.stream || 'Science'} />
        <InfoRow label="House/Block" value={data?.houseBlock || 'Blue'} />
      </InfoGrid>
    </InfoCard>
  )
}

export function PreviousSchoolCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Previous School Details" icon={Building} onEdit={onEdit}>
      <InfoGrid cols={1}>
        <InfoRow label="School Name & Address" value={data?.prevSchoolName || 'abcd School, Location, City, State'} />
      </InfoGrid>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <InfoRow label="Attended Class" value={data?.prevAttendedClass || 'Class II'} />
        <InfoRow label="Last School Affiliated To" value={data?.prevSchoolAffiliatedTo || 'CBSE Board'} />
      </div>
    </InfoCard>
  )
}

export function MedicalDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Medical Details" icon={Heart} onEdit={onEdit}>
      <InfoGrid cols={3}>
        <InfoRow label="Blood Group" value={data?.bloodGroup || 'B+'} />
        <InfoRow label="Height" value={data?.height || '60 CM'} />
        <InfoRow label="Weight" value={data?.weight || '28 Kg.'} />
      </InfoGrid>
    </InfoCard>
  )
}

export function TCDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="TC Details" icon={FileText} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Transfer Certificate No." value={data?.tcNo || 'TC/123/2025'} />
        <InfoRow label="Date of Issue" value={data?.tcIssueDate || '03-04-2025'} />
        <div className="col-span-2">
          <InfoRow label="Transfer Certificate" value={<a href="#" className="text-teal-600 hover:underline">@ Certificate.jpg</a>} />
        </div>
      </InfoGrid>
    </InfoCard>
  )
}

export function EducationTableCard({ data, onEdit }: any) {
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
            <tr>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">Class I</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">2025</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">41</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">273</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">82%</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">Hindi, English, Math, Science</td>
              <td className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">abcd school</td>
            </tr>
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
             <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-end overflow-hidden border border-slate-200 relative">
                <div className="absolute bottom-1 right-1 p-0.5 bg-teal-600 rounded">
                   <User className="w-3 h-3 text-white" />
                </div>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                <InfoRow label="Name" value={data?.fatherName || 'Shubham Tiwari'} valueClass="text-sm font-bold" />
                <InfoRow label="Occupation" value={data?.fatherOccupation || 'Private Job'} />
                <InfoRow label="Contact" value={data?.fatherContact || '9999999999'} />
                <div />
                <InfoRow label="Annual Income" value={data?.fatherIncome || '5,00,000/-'} />
                <InfoRow label="Income Certificate No." value="Cer/123/456" />
             </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-700" />

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Mother Details</h4>
          <div className="flex items-start gap-4">
             <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-end overflow-hidden border border-slate-200 relative">
                <div className="absolute bottom-1 right-1 p-0.5 bg-teal-600 rounded">
                   <User className="w-3 h-3 text-white" />
                </div>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-4">
                <InfoRow label="Name" value={data?.motherName || 'Priya Tiwari'} valueClass="text-sm font-bold" />
                <InfoRow label="Occupation" value={data?.motherOccupation || 'House Wife'} />
                <InfoRow label="Contact" value={data?.motherContact || '9999999999'} />
                <div />
                <InfoRow label="Annual Income" value={data?.motherIncome || '-'} />
                <InfoRow label="Income Certificate No." value="-" />
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
        <InfoRow label="Address" value={data?.address || '123, Location, Street Name, Locality'} />
        <InfoGrid cols={2}>
          <InfoRow label="Pincode" value={data?.pincode || '221345'} />
          <InfoRow label="District" value={data?.district || 'Lucknow'} />
          <InfoRow label="State" value={data?.state || 'Uttar Prades'} />
          <InfoRow label="Domicile Certificate No." value={data?.domicileNo || '123456789'} />
        </InfoGrid>
        <InfoRow label="Domicile Certificate" value={<a href="#" className="text-teal-600 hover:underline">@ Certificate.jpg</a>} />
      </div>
    </InfoCard>
  )
}

export function GovtIdDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Govt. ID Details" icon={Fingerprint} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Aadhar Card No." value={data?.aadharNo || '12345678900'} />
        <InfoRow label="Aadhar Card" value={<a href="#" className="text-teal-600 hover:underline">@ Aadhar Card.jpg</a>} />
        <InfoRow label="Nationality" value={data?.nationality || 'Indian'} />
        <InfoRow label="Religion" value={data?.religion || 'Hindu'} />
        <InfoRow label="Category" value={data?.category || 'General'} />
        <InfoRow label="Category Certificate" value={<a href="#" className="text-teal-600 hover:underline">@ Certificate.jpg</a>} />
      </InfoGrid>
    </InfoCard>
  )
}

export function BirthCertificateCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Birth Certificate Details" icon={FileText} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Birth Certificate No." value={data?.birthCertNo || '123456789'} />
        <InfoRow label="Birth Certificate" value={<a href="#" className="text-teal-600 hover:underline">@ Certificate.jpg</a>} />
      </InfoGrid>
    </InfoCard>
  )
}

export function ScholarshipDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Scholarship Details" icon={Award} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Scholarship ID" value={data?.scholarshipId || '-'} />
        <InfoRow label="Scholarship Password" value={data?.scholarshipPwd || '-'} />
      </InfoGrid>
    </InfoCard>
  )
}

export function BplRteDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="BPL & RTE Details" icon={BookOpen} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="BPL Student" value={data?.bplStudent || 'Yes'} />
        <InfoRow label="RTE Student" value="Yes" />
      </InfoGrid>
    </InfoCard>
  )
}

export function GovtPortalDetailsCard({ data, onEdit }: any) {
  return (
    <InfoCard title="Govt. Portal Details" icon={Building} onEdit={onEdit}>
      <InfoGrid cols={2}>
        <InfoRow label="Govt. Portal Student ID" value={data?.govtStudentId || '-'} />
        <InfoRow label="Govt. Portal Family ID" value={data?.govtFamilyId || '-'} />
        <InfoRow label="Samagra ID" value={data?.samagraId || '-'} />
      </InfoGrid>
    </InfoCard>
  )
}
