'use client'

import React, { useState } from 'react'
import { createStudent } from '@/app/institute/students/actions'
import { X, Check, Paperclip, Plus, Camera, Percent, Search, Eye, Edit2 } from 'lucide-react'
import { 
  PersonalDetailsCard, PreviousSchoolCard, MedicalDetailsCard, TCDetailsCard, EducationTableCard,
  ParentsDetailsCard, AddressDetailsCard, BirthCertificateCard, ScholarshipDetailsCard, BplRteDetailsCard,
  GovtIdDetailsCard, GovtPortalDetailsCard, InfoCard, InfoRow
} from './ProfileCards'

// Steps
const STEPS = [
  'Personal Details',
  'Education Details',
  'Parents/Address Details',
  'Govt. ID Details',
  'Fee Details'
]

export default function AddStudentWizard({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // A large unified state object for all fields. 
  // In a real app, you'd use a form library like react-hook-form here.
  const [formData, setFormData] = useState<any>({
    // Step 1
    academicYear: '', class: '', section: '', rollNo: '', admissionNo: '', admissionDate: '',
    stream: '', medium: '', houseBlock: '', firstName: '', lastName: '', mobileNo: '', emailId: '',
    dob: '', gender: '', bloodGroup: '', height: '', weight: '', userName: '', password: '', confirmPassword: '',
    // Step 2
    prevSchoolName: '', prevAttendedClass: '', prevSchoolAffiliatedTo: '', tcNo: '', tcIssueDate: '',
    otherQualifications: [{ qualification: '', passYear: '', rollNo: '', obtMarks: '', percentage: '', subject: '', schoolName: '' }],
    // Step 3
    fatherName: '', fatherContact: '', fatherOccupation: '', fatherIncome: '', motherName: '', motherContact: '',
    motherOccupation: '', motherIncome: '', address: '', state: '', district: '', pincode: '', domicileNo: '',
    // Step 4
    aadharNo: '', nationality: '', religion: '', category: '', birthCertNo: '', scholarshipId: '', scholarshipPwd: '',
    govtStudentId: '', govtFamilyId: '', samagraId: '', bplStudent: '',
    // Step 5 toggles
    regFeeEnabled: true, admFeeEnabled: true, classFeeEnabled: true, libFeeEnabled: true,
    examFeeEnabled: true, hostelFeeEnabled: true, extraFeeEnabled: true, transFeeEnabled: true,
  })

  const [masters, setMasters] = useState({
    classes: ['Select a Class'],
    sections: ['Select a Section'],
    streams: ['Select Stream'],
    tags: ['Select Tag'],
    discounts: ['Select Discount Head']
  })

  React.useEffect(() => {
    const loadMaster = (key: string, defaultOpt: string, nameField: string) => {
       const data = localStorage.getItem(key)
       if (data) {
         try {
           const arr = JSON.parse(data)
           return [defaultOpt, ...arr.map((item: any) => item[nameField] || item.name)]
         } catch {}
       }
       return [defaultOpt]
    }

    setMasters({
      classes: loadMaster('school_masters_classes', 'Select a Class', 'className'),
      sections: loadMaster('school_masters_sections', 'Select a Section', 'sectionName'),
      streams: loadMaster('school_masters_streams', 'Select Stream', 'streamName'),
      tags: loadMaster('school_masters_tags', 'Select Tag', 'tagName'),
      discounts: loadMaster('school_masters_discounts', 'Select Discount Head', 'headName')
    })
  }, [])

  const [showPromoModal, setShowPromoModal] = useState(false)

  const updateForm = (key: string, value: any) => setFormData((prev: any) => ({ ...prev, [key]: value }))

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-6 px-4">
      {/* Container */}
      <div className="w-full max-w-[1000px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Student</h1>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-8">
          
          {/* Stepper */}
          <div className="relative">
            {/* The background track line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            
            {/* The active track line */}
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-teal-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative z-10 flex justify-between">
               {STEPS.map((stepLabel, index) => {
                 const stepNumber = index + 1
                 const isCompleted = stepNumber < currentStep
                 const isActive = stepNumber === currentStep

                 return (
                   <div key={stepNumber} className="flex flex-col items-center gap-3 w-32 relative">
                      {/* Step Pill/Label */}
                      <div className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm whitespace-nowrap -mt-6 transition-colors ${
                        isActive ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                         {stepLabel}
                      </div>
                      
                      {/* Circle Indicator */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${
                        isCompleted ? 'border-teal-500 text-teal-500' :
                        isActive ? 'border-teal-500 border-4' : 'border-slate-300'
                      }`}>
                         {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                   </div>
                 )
               })}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="mt-4">
             {currentStep === 1 && <Step1 formData={formData} masters={masters} updateForm={updateForm} onNext={handleNext} onCancel={onClose} />}
             {currentStep === 2 && <Step2 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={onClose} />}
             {currentStep === 3 && <Step3 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={onClose} />}
             {currentStep === 4 && <Step4 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={onClose} />}
             {currentStep === 5 && <Step5 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={onClose} onOpenPromo={() => setShowPromoModal(true)} />}
             {currentStep === 6 && <Step6 formData={formData} onBack={handleBack} onCancel={onClose} />}
          </div>

        </div>
      </div>
      
      {showPromoModal && <PromoCodeModal onClose={() => setShowPromoModal(false)} />}
    </div>
  )
}

// ---------------------------------------------------------
// REUSABLE COMPONENTS
// ---------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
       <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{title}</h3>
       <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

function InputField({ label, required, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label} {required && <span className="text-red-500">*</span>}
       </label>
       <input 
         className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300"
         {...props} 
       />
    </div>
  )
}

function SelectField({ label, required, options, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label} {required && <span className="text-red-500">*</span>}
       </label>
       <select 
         className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300"
         {...props}
       >
         {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
       </select>
    </div>
  )
}

function FileUploadField({ label, required, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label} {required && <span className="text-red-500">*</span>}
       </label>
       <div className="relative w-full">
         <input type="text" placeholder={placeholder} readOnly className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 cursor-pointer pr-10" />
         <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
       </div>
    </div>
  )
}

function PromoCodeField({ label, placeholder, onClick }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label}
       </label>
       <div className="relative w-full cursor-pointer" onClick={onClick}>
         <input type="text" placeholder={placeholder} readOnly className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 cursor-pointer pr-10 pointer-events-none" />
         <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
       </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 1: PERSONAL DETAILS
// ---------------------------------------------------------
function Step1({ formData, masters, updateForm, onNext, onCancel }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Personal Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="Academic Year" required options={['Select a Year', '2023-24', '2024-25', '2025-26']} value={formData.academicYear} onChange={(e: any) => updateForm('academicYear', e.target.value)} />
           <SelectField label="Class" required options={masters.classes} value={formData.class} onChange={(e: any) => updateForm('class', e.target.value)} />
           <SelectField label="Section" required options={masters.sections} value={formData.section} onChange={(e: any) => updateForm('section', e.target.value)} />
           <InputField label="Roll No." required placeholder="Enter Roll No." value={formData.rollNo} onChange={(e: any) => updateForm('rollNo', e.target.value)} />
           <InputField label="Admission No." placeholder="Enter Admission No." value={formData.admissionNo} onChange={(e: any) => updateForm('admissionNo', e.target.value)} />
           <InputField label="Admission Date" required type="date" value={formData.admissionDate} onChange={(e: any) => updateForm('admissionDate', e.target.value)} />
           <SelectField label="Stream" options={masters.streams} value={formData.stream} onChange={(e: any) => updateForm('stream', e.target.value)} />
           <SelectField label="Medium" options={['Select Medium', 'English', 'Hindi']} value={formData.medium} onChange={(e: any) => updateForm('medium', e.target.value)} />
           <SelectField label="House/Block" options={['Select House/Block', 'Red', 'Blue', 'Green', 'Yellow']} value={formData.houseBlock} onChange={(e: any) => updateForm('houseBlock', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Basic Info" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
           <div className="col-span-2 grid grid-cols-2 gap-6">
             <InputField label="First Name" required placeholder="Enter Your First Name" />
             <InputField label="Last Name" placeholder="Enter Your Last Name" />
             <InputField label="Mobile No." required placeholder="Enter Your Mobile No" />
             <InputField label="Email Id" placeholder="Enter Your Email Id" />
             <InputField label="Date of Birth" required type="date" />
             
             <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Gender <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="radio" name="gender" className="text-teal-600 focus:ring-teal-500" /> Male</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="radio" name="gender" className="text-teal-600 focus:ring-teal-500" /> Female</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="radio" name="gender" className="text-teal-600 focus:ring-teal-500" /> Others</label>
                </div>
             </div>
           </div>
           
           {/* Avatar Upload */}
           <div className="col-span-1 flex flex-col items-center justify-center gap-4">
              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Camera className="w-8 h-8 text-teal-600" />
              </div>
              <button className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Upload Photo</button>
           </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Medical Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="Blood Group" options={['Select Your Blood Group', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
           <InputField label="Height" placeholder="Enter Your Height" />
           <InputField label="Weight" placeholder="Enter Your Weight" />
        </div>
      </div>

      <div>
        <SectionHeader title="Login/Account Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="User Name" required placeholder="Enter User Name" />
           <InputField label="Password" required type="password" placeholder="Enter Password" />
           <InputField label="Confirm Password" required type="password" placeholder="Confirm Password" />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button onClick={onCancel} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        <button onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>

    </div>
  )
}

// ---------------------------------------------------------
// STEP 2: EDUCATION DETAILS
// ---------------------------------------------------------
function Step2({ formData, updateForm, onNext, onBack, onCancel }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Previous School Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="School Name & Address" placeholder="Enter School name & Address" />
           <SelectField label="Attended Class" options={['Select an Option', 'Class I', 'Class II']} />
           <SelectField label="Last School Affiliated to" options={['Select an Option', 'CBSE', 'ICSE', 'State Board']} />
        </div>
      </div>

      <div>
        <SectionHeader title="Transfer Certificate Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Transfer Certificate No." placeholder="Enter Certificate No." />
           <InputField label="Date of issue" type="date" />
           <FileUploadField label="Transfer Certificate" placeholder="Attach a Photo" />
        </div>
      </div>

      <div>
        <SectionHeader title="Other Qualification Details" />
        
        <div className="w-full overflow-x-auto mt-2">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-teal-50/50 dark:bg-teal-900/10 text-slate-500">
                <th className="py-3 px-2 text-center rounded-tl-xl w-10"></th>
                <th className="py-3 px-2 font-semibold">Qualification</th>
                <th className="py-3 px-2 font-semibold">Pass. Year</th>
                <th className="py-3 px-2 font-semibold">Roll No.</th>
                <th className="py-3 px-2 font-semibold">Obt. Marks</th>
                <th className="py-3 px-2 font-semibold">Percentage</th>
                <th className="py-3 px-2 font-semibold">Subject</th>
                <th className="py-3 px-2 font-semibold rounded-tr-xl">School Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                 <td className="py-2 px-2 text-center"><button className="text-slate-400 hover:text-red-500"><X className="w-4 h-4 mx-auto"/></button></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-center mt-4">
           <button className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm hover:bg-teal-700 transition-colors">
              <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button onClick={onBack} className="px-10 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button onClick={onCancel} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        <button onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 3: PARENTS DETAILS
// ---------------------------------------------------------
function Step3({ formData, updateForm, onNext, onBack, onCancel }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <div className="flex items-center gap-4 mb-6">
           <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Parents Details</h3>
           <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
           <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 outline-none w-40 shrink-0"><option>Select Parent</option></select>
           <button className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-teal-700 transition-colors"><Plus className="w-5 h-5" /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <InputField label="Father Name" required placeholder="Enter Father Name" />
           <InputField label="Father Contact No." required placeholder="Enter Contact No." />
           <InputField label="Father Occupation" required placeholder="Enter Occupation" />
           <div /> {/* spacing */}

           <InputField label="Father Annual Income" placeholder="Enter Annual Income" />
           <InputField label="Father Income Certificate" placeholder="Enter Income Certificate No." />
           <FileUploadField label="Father Photo" placeholder="Upload Photo" />
           <div /> {/* spacing */}

           <div className="col-span-full h-4" />

           <InputField label="Mother Name" required placeholder="Enter Mother Name" />
           <InputField label="Mother Contact No." placeholder="Enter Contact No." />
           <InputField label="Mother Occupation" required placeholder="Enter Occupation" />
           <div /> {/* spacing */}

           <InputField label="Mother Annual Income" placeholder="Enter Annual Income" />
           <InputField label="Mother Income Certificate" placeholder="Enter Income Certificate No." />
           <FileUploadField label="Mother Photo" placeholder="Upload Photo" />
           <div /> {/* spacing */}
        </div>
      </div>

      <div>
        <SectionHeader title="Address Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-full">
             <InputField label="Address" required placeholder="Enter Address" />
           </div>
           
           <SelectField label="State" required options={['Select State', 'Delhi', 'Maharashtra']} />
           <SelectField label="District" required options={['Select District', 'New Delhi', 'Mumbai']} />
           <SelectField label="Pincode" options={['Enter Pincode', '110001', '400001']} />

           <InputField label="Domicile Certificate No." placeholder="Enter Domicile Certificate No." />
           <FileUploadField label="Domicile Certificate" placeholder="Upload Certificate Photo" />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button onClick={onBack} className="px-10 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button onClick={onCancel} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        <button onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 4: GOVT. ID DETAILS
// ---------------------------------------------------------
function Step4({ formData, updateForm, onNext, onBack, onCancel }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Govt. ID Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Aadhar Card No." required placeholder="Enter Aadhar Card No." />
           <FileUploadField label="Aadhar Card" placeholder="Upload a Photo" />
           <SelectField label="Nationality" options={['Select Nationality', 'Indian', 'Other']} />

           <SelectField label="Religion" required options={['Select Religion', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Other']} />
           <SelectField label="Category" required options={['Select Category', 'General', 'OBC', 'SC', 'ST']} />
           <FileUploadField label="Category Certificate" placeholder="Upload Certificate Photo" />
        </div>
      </div>

      <div>
        <SectionHeader title="Birth Certificate Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Birth Certificate No." placeholder="Enter Birth Certificate No." />
           <FileUploadField label="Birth Certificate" placeholder="Upload Certificate Photo" />
        </div>
      </div>

      <div>
        <SectionHeader title="Scholarship Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Scholarship ID" placeholder="Enter Scholarship ID" />
           <InputField label="Scholarship Password" placeholder="Enter Password" />
        </div>
      </div>

      <div>
        <SectionHeader title="Govt. Portal Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Govt. Student ID on Portal" placeholder="Enter ID No." />
           <InputField label="Govt. Family ID on Portal" placeholder="Enter ID No." />
           <InputField label="Samagra ID" placeholder="Enter ID No." />
        </div>
      </div>

      <div>
        <SectionHeader title="BPL Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="BPL Student" options={['Select an Option', 'Yes', 'No']} />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button onClick={onBack} className="px-10 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button onClick={onCancel} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        <button onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 5: FEE DETAILS
// ---------------------------------------------------------
function Step5({ formData, updateForm, onNext, onBack, onCancel, onOpenPromo }: any) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <FeeSection title="Registration Fee" onOpenPromo={onOpenPromo} />
      <FeeSection title="Admission Fee" onOpenPromo={onOpenPromo} />
      
      <div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-4 flex-1">
             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Class Fee Details <span className="text-red-500">*</span></h3>
             <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-full mb-2">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">RTE Student <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-slate-400">Class Fee is not applicable for RTE Student according to Government.</p>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="radio" name="rte" className="text-teal-600 focus:ring-teal-500" /> Yes</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"><input type="radio" name="rte" defaultChecked className="text-teal-600 focus:ring-teal-500" /> No</label>
              </div>
           </div>
           
           <SelectField label="Fee Duration" required options={['Select an Option', 'One Time', 'Monthly', 'Quartly', 'Annualy']} />
           <div className="flex flex-col gap-1.5 w-full">
             <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
             <input value="1000/-" readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
           </div>
           <PromoCodeField label="Promo Code" placeholder="Select an Option" onClick={onOpenPromo} />
        </div>
      </div>

      <FeeSection title="Library Fee" onOpenPromo={onOpenPromo} />
      <FeeSection title="Exam Fee" onOpenPromo={onOpenPromo} />
      <FeeSection title="Hostel Fee" onOpenPromo={onOpenPromo} />
      <FeeSection title="Extra Curricular Fee" onOpenPromo={onOpenPromo} />

      <div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-4 flex-1">
             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Transportation Service Fee <span className="text-slate-400 text-xs font-normal">(Optional)</span></h3>
             <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="ml-4 w-10 h-6 bg-teal-500 rounded-full flex items-center px-1 cursor-pointer justify-end shadow-inner shrink-0">
             <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="Select Route" required options={['Select an Option', 'Route 1', 'Route 2']} />
           <SelectField label="Select Pickup/Stoppage Location" required options={['Select an Option', 'Stop A', 'Stop B']} />
           <div className="flex flex-col gap-1.5 w-full">
             <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Distance (Approx.)</label>
             <input value="Ex: 20 Km" readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
           </div>

           <SelectField label="Fee Duration" required options={['Select an Option', 'One Time', 'Monthly', 'Quartly', 'Annualy']} />
           <div className="flex flex-col gap-1.5 w-full">
             <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
             <input placeholder="Ex : 1,000/-" className="w-full px-3 py-2 bg-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300" />
           </div>
           <PromoCodeField label="Promo Code" placeholder="Select an Option" onClick={onOpenPromo} />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-8">
        <button onClick={onBack} className="px-10 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Final Preview</button>
        <button onClick={onCancel} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 6: FINAL PREVIEW
// ---------------------------------------------------------
function Step6({ formData, onBack, onCancel }: any) {
  
  const [submitting, setSubmitting] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const res = await createStudent(formData)
    if (res.success) {
      alert('Student successfully added!')
      onCancel()
    } else {
      alert('Failed to add student: ' + res.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top 2 Cards: Basic Info & Login */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Basic Info" icon={Eye} onEdit={() => {}}>
           <div className="flex items-start gap-4">
              <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                 {/* Placeholder for uploaded photo */}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-y-4">
                 <div className="col-span-full flex justify-between">
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm">{formData.firstName || 'Saurabh'}</h4>
                       <p className="text-xs text-slate-500">Student, Male</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] text-slate-500">Roll No. : {formData.rollNo || '42'}</p>
                       <p className="text-[11px] text-slate-500">Admission Date : {formData.admissionDate || '01/01/2025'}</p>
                    </div>
                 </div>
                 <InfoRow label="Mobile No." value={formData.mobileNo || '9999999999'} />
                 <InfoRow label="Email Id" value={formData.emailId || 'saurabh@gmail.com'} />
                 <InfoRow label="Date of Birth" value={formData.dob || '10-08-2015'} />
              </div>
           </div>
        </InfoCard>

        <InfoCard title="Login & Account Details" icon={Edit2} onEdit={() => {}}>
           <div className="flex flex-col gap-4 h-full justify-center">
              <InfoRow label="User Name" value={formData.userName || 'abcdtiwari2012025'} valueClass="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md mt-1" />
              <InfoRow label="Password" value="••••••••••" valueClass="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md mt-1" />
           </div>
        </InfoCard>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
         <div className="flex flex-col gap-6">
            <PersonalDetailsCard data={formData} onEdit={() => {}} />
            <EducationTableCard data={formData} onEdit={() => {}} />
            <ParentsDetailsCard data={formData} onEdit={() => {}} />
            <BirthCertificateCard data={formData} onEdit={() => {}} />
            <BplRteDetailsCard data={formData} onEdit={() => {}} />
         </div>

         <div className="flex flex-col gap-6">
            <PreviousSchoolCard data={formData} onEdit={() => {}} />
            <div className="grid grid-cols-2 gap-6">
               <MedicalDetailsCard data={formData} onEdit={() => {}} />
               <TCDetailsCard data={formData} onEdit={() => {}} />
            </div>
            <AddressDetailsCard data={formData} onEdit={() => {}} />
            <GovtIdDetailsCard data={formData} onEdit={() => {}} />
            <ScholarshipDetailsCard data={formData} onEdit={() => {}} />
            <GovtPortalDetailsCard data={formData} onEdit={() => {}} />
         </div>
      </div>

      <div className="flex justify-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-700">
        <button onClick={onBack} disabled={submitting} className="px-10 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button onClick={handleSubmit} disabled={submitting} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm flex items-center gap-2">
          {submitting ? 'Submitting...' : <><Check className="w-4 h-4" /> Final Submit</>}
        </button>
        <button onClick={handlePrint} disabled={submitting} className="px-10 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Print / Save as PDF</button>
      </div>

    </div>
  )
}

function FeeSection({ title, onOpenPromo }: { title: string, onOpenPromo: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-4 flex-1">
           <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{title}</h3>
           <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="ml-4 w-10 h-6 bg-teal-500 rounded-full flex items-center px-1 cursor-pointer justify-end shadow-inner shrink-0">
           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SelectField label="Fee Duration" required options={['Select an Option', 'One Time', 'Monthly', 'Quartly', 'Annualy']} />
         <div className="flex flex-col gap-1.5 w-full">
           <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
           <input value="1000/-" readOnly className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 outline-none" />
         </div>
         <PromoCodeField label="Promo Code" placeholder="Select an Option" onClick={onOpenPromo} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// PROMO CODE MODAL
// ---------------------------------------------------------
function PromoCodeModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'AMOUNT' | 'PERCENTAGE'>('AMOUNT')
  
  const promos = [
    { title: 'Admission Time', code: 'Promo Code Name', context: '(All Fee)', amount: '1000/-', percent: '10%', color: 'bg-green-600' },
    { title: 'Fee Collection Time', code: 'Promo Code Name', context: '(Class Fee)', amount: '1000/-', percent: '10%', color: 'bg-fuchsia-700' },
    { title: 'Admission Time', code: 'Promo Code Name', context: '(Admission Fee)', amount: '1000/-', percent: '10%', color: 'bg-violet-700' },
    { title: 'Fee Collection Time', code: 'Promo Code Name', context: '(Extra Curriculam Fee)', amount: '1000/-', percent: '10%', color: 'bg-red-700' },
    { title: 'Fee Collection Time', code: 'Promo Code Name', context: '(Transportation Fee)', amount: '1000/-', percent: '10%', color: 'bg-teal-800' },
    { title: 'Admission Time', code: 'Promo Code Name', context: '(Registration Fee)', amount: '1000/-', percent: '10%', color: 'bg-lime-600' }
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="relative p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
          
          {/* Tabs */}
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white shadow-sm">
             <button 
               onClick={() => setTab('AMOUNT')}
               className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors ${tab === 'AMOUNT' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               Amount Discount <span className="bg-white text-teal-600 rounded-md px-1.5 py-0.5 text-xs">06</span>
             </button>
             <button 
               onClick={() => setTab('PERCENTAGE')}
               className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors border-l border-slate-200 ${tab === 'PERCENTAGE' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               Percentage Discount <span className="border border-fuchsia-300 text-fuchsia-500 rounded-md px-1.5 py-0.5 text-xs">04</span>
             </button>
          </div>

          <button onClick={onClose} className="absolute right-6 top-6 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map((promo, idx) => (
                 <div key={idx} className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className={`${promo.color} w-1/3 flex items-center justify-center`}>
                       <Percent className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-2/3 p-4 flex flex-col bg-white dark:bg-slate-800">
                       <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{promo.title}</span>
                       <span className={`text-sm font-black mt-0.5 ${promo.color.replace('bg-', 'text-')}`}>{promo.code}</span>
                       <span className="text-[11px] text-slate-500 mb-2">{promo.context}</span>
                       
                       <div className="mt-auto flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                           {tab === 'AMOUNT' ? `Amount ${promo.amount} Off` : `${promo.percent} Off`}
                         </span>
                         <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                           Apply &rarr;
                         </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
