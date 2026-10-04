'use client'

import React, { useState, useEffect } from 'react'
import { createStudent } from '@/app/institute/students/actions'
import { X, Check, Paperclip, Plus, Camera, Percent, Search, Eye, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { 
  PersonalDetailsCard, PreviousSchoolCard, MedicalDetailsCard, TCDetailsCard, EducationTableCard,
  ParentsDetailsCard, AddressDetailsCard, BirthCertificateCard, ScholarshipDetailsCard, BplRteDetailsCard,
  GovtIdDetailsCard, GovtPortalDetailsCard, FeeDetailsCard, InfoCard, InfoRow
} from './ProfileCards'

// Steps
const STEPS = [
  'Personal Details',
  'Education Details',
  'Parents/Address Details',
  'Govt. ID Details',
  'Fee Details'
]

export default function AddStudentWizard({ 
  initialData, 
  initialStep = 1,
  onClose,
  onDraftSaved
}: { 
  initialData?: any, 
  initialStep?: number,
  onClose: () => void,
  onDraftSaved?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(initialData?.draftStep || initialStep || 1)
  
  const [formData, setFormData] = useState<any>(() => {
    const defaultData = {
      // Step 1
      academicYear: '', class: '', section: '', rollNo: '', admissionNo: '', admissionDate: '',
      stream: '', medium: '', houseBlock: '', firstName: '', lastName: '', mobileNo: '', emailId: '',
      dob: '', gender: 'Male', bloodGroup: '', height: '', weight: '', userName: '', password: '', confirmPassword: '', avatar: '',
      // Step 2
      prevSchoolName: '', prevAttendedClass: '', prevSchoolAffiliatedTo: '', tcNo: '', tcIssueDate: '',
      otherQualifications: [{ qualification: '', passYear: '', rollNo: '', obtMarks: '', percentage: '', subject: '', schoolName: '' }],
      // Step 3
      fatherName: '', fatherContact: '', fatherOccupation: '', fatherIncome: '', motherName: '', motherContact: '',
      motherOccupation: '', motherIncome: '', address: '', state: '', district: '', pincode: '', domicileNo: '',
      // Step 4
      aadharNo: '', nationality: 'Indian', religion: '', category: '', birthCertNo: '', scholarshipId: '', scholarshipPwd: '',
      govtStudentId: '', govtFamilyId: '', samagraId: '', bplStudent: 'No',
      // Step 5 toggles - default OFF if not added
      regFeeEnabled: false, admFeeEnabled: false, classFeeEnabled: false, libFeeEnabled: false,
      examFeeEnabled: false, hostelFeeEnabled: false, extraFeeEnabled: false, transFeeEnabled: false,
    }
    if (initialData) {
      const clsName = initialData.class_name || initialData.class || ''
      const matchedSec = clsName.match(/\(([^)]+)\)/)?.[1] || initialData.section || ''
      const cleanCls = clsName.replace(/\s*\([^)]*\)/, '').trim() || initialData.class || ''

      return {
        ...defaultData,
        ...initialData,
        firstName: initialData.first_name || initialData.firstName || '',
        lastName: initialData.last_name || initialData.lastName || '',
        mobileNo: initialData.contact || initialData.mobileNo || '',
        admissionNo: initialData.admission_no || initialData.admissionNo || '',
        rollNo: initialData.roll_no || initialData.rollNo || '',
        class: cleanCls,
        section: matchedSec,
      }
    }
    return defaultData
  })

  const [masters, setMasters] = useState<any>({
    academicYears: ['Select a Year'],
    classes: ['Select a Class'],
    sections: ['Select a Section'],
    streams: ['Select Stream'],
    mediums: ['Select Medium'],
    houses: ['Select House/Block'],
    categories: ['Select Category'],
    tags: ['Select Tag'],
    discounts: ['Select Discount Head'],
    parents: [] as any[]
  })

  React.useEffect(() => {
    const loadMaster = (key: string, defaultOpt: string, nameField: string) => {
       const data = localStorage.getItem(key)
       if (data) {
         try {
           const arr = JSON.parse(data)
           if (Array.isArray(arr) && arr.length > 0) {
             const active = arr.filter((item: any) => !item.deleted)
             if (active.length > 0) {
               return [defaultOpt, ...active.map((item: any) => item[nameField] || item.name || item.title || item.className || String(item))]
             }
           }
         } catch {}
       }
       return [defaultOpt]
    }

    const loadedAcademicYears = loadMaster('school_masters_academic_years', 'Select a Year', 'yearName')
    const loadedClasses = loadMaster('school_masters_classes', 'Select a Class', 'className')
    const loadedSections = loadMaster('school_masters_sections', 'Select a Section', 'sectionName')
    const loadedStreams = loadMaster('school_masters_streams', 'Select Stream', 'streamName')
    const loadedMediums = loadMaster('school_masters_mediums', 'Select Medium', 'mediumName')
    const loadedCategories = loadMaster('school_masters_categories', 'Select Category', 'categoryName')
    const loadedHouses = loadMaster('school_masters_houses', 'Select House/Block', 'houseName')
    const loadedTags = loadMaster('school_masters_tags', 'Select Tag', 'tagName')
    const loadedDiscounts = loadMaster('school_masters_discounts', 'Select Discount Head', 'headName')

    // Load registered parents from both localStorage keys
    let parentsList: any[] = []
    const savedInstParents = localStorage.getItem('school_institute_parents')
    const savedParents = localStorage.getItem('school_parents')
    
    let rawParents: any[] = []
    if (savedInstParents) {
      try {
        const p1 = JSON.parse(savedInstParents)
        if (Array.isArray(p1)) rawParents.push(...p1)
      } catch (e) {}
    }
    if (savedParents) {
      try {
        const p2 = JSON.parse(savedParents)
        if (Array.isArray(p2)) rawParents.push(...p2)
      } catch (e) {}
    }

    const parentMap = new Map()
    rawParents.forEach((p: any) => {
      if (!p.deleted) {
        const key = String(p.id || p.contact || p.mobileNo || p.name || p.firstName)
        if (key && !parentMap.has(key)) {
          parentMap.set(key, p)
        }
      }
    })
    parentsList = Array.from(parentMap.values())

    setMasters({
      academicYears: loadedAcademicYears,
      classes: loadedClasses,
      sections: loadedSections,
      streams: loadedStreams,
      mediums: loadedMediums,
      houses: loadedHouses,
      categories: loadedCategories,
      tags: loadedTags,
      discounts: loadedDiscounts,
      parents: parentsList
    })
  }, [])

  const [promoModalState, setPromoModalState] = useState<{ open: boolean, feeType?: string, targetKey?: string }>({ open: false })

  const handleOpenPromo = (targetKey: string, feeType?: string) => {
    setPromoModalState({ open: true, targetKey, feeType })
  }

  const handleApplyPromo = (promo: any) => {
    if (promoModalState.targetKey) {
      const codeStr = promo.promoCode || promo.code || promo.name || 'APPLIED'
      updateForm(`${promoModalState.targetKey}Promo`, codeStr)
    }
    setPromoModalState({ open: false })
  }

  const updateForm = (key: string, value: any) => setFormData((prev: any) => ({ ...prev, [key]: value }))

  // Save Draft Helper
  const saveDraftRecord = (step: number = currentStep, customData?: any, showToast: boolean = false) => {
    const dataToSave = customData || formData
    if (!dataToSave.firstName && !dataToSave.mobileNo && !dataToSave.class) {
      return null
    }

    const draftId = dataToSave.draftId || dataToSave.id || `DRAFT-${Date.now()}`
    const draftRecord = {
      ...dataToSave,
      draftId,
      id: draftId,
      draftStep: step,
      lastSaved: new Date().toISOString(),
      status: 'Draft',
      firstName: dataToSave.firstName || '',
      lastName: dataToSave.lastName || '',
      name: `${dataToSave.firstName || 'Draft'} ${dataToSave.lastName || ''}`.trim(),
      class_name: `${dataToSave.class || 'N/A'}${dataToSave.section ? ` (${dataToSave.section})` : ''}`,
      contact: dataToSave.mobileNo || '',
    }

    try {
      const raw = localStorage.getItem('school_draft_students')
      let list: any[] = []
      if (raw) list = JSON.parse(raw)
      const idx = list.findIndex((d: any) => String(d.draftId || d.id) === String(draftId))
      if (idx >= 0) {
        list[idx] = draftRecord
      } else {
        list.unshift(draftRecord)
      }
      localStorage.setItem('school_draft_students', JSON.stringify(list))
      if (showToast) {
        toast.success('Student saved to Drafts! You can resume anytime from Draft Students.')
      }
      if (onDraftSaved) onDraftSaved()
      return draftRecord
    } catch (e) {
      console.error('Error saving draft:', e)
      return null
    }
  }

  const handleSaveAndExit = () => {
    saveDraftRecord(currentStep, formData, true)
    onClose()
  }

  const handleClose = () => {
    if (formData.firstName || formData.mobileNo || formData.class) {
      saveDraftRecord(currentStep, formData, false)
    }
    onClose()
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const today = new Date().toISOString().split('T')[0]
      if (!formData.academicYear || formData.academicYear === 'Select a Year') {
        alert('Please select an Academic Year.')
        return false
      }
      if (!formData.class || formData.class === 'Select a Class') {
        alert('Please select a Class.')
        return false
      }
      if (!formData.section || formData.section === 'Select a Section' || formData.section === 'Select Class First') {
        alert('Please select a Section.')
        return false
      }
      if (!formData.admissionDate) {
        alert('Please select Admission Date.')
        return false
      }
      if (formData.admissionDate > today) {
        alert('Admission Date cannot be a future date.')
        return false
      }
      if (!formData.firstName || !formData.firstName.trim()) {
        alert('Please enter First Name.')
        return false
      }
      if (!formData.mobileNo || !formData.mobileNo.trim()) {
        alert('Please enter Mobile No.')
        return false
      }
      if (!formData.dob) {
        alert('Please select Date of Birth.')
        return false
      }
      if (formData.dob > today) {
        alert('Date of Birth cannot be a future date.')
        return false
      }
      if (!formData.gender) {
        alert('Please select Gender.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return
    }
    const nextStep = Math.min(currentStep + 1, 6)
    setCurrentStep(nextStep)
    // Auto-save draft on step progression
    saveDraftRecord(nextStep, formData, false)
  }
  
  const handleBack = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-[1050px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 my-auto">
      
      {/* Modal Header */}
      <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black uppercase tracking-wider text-teal-400">Add Student</h1>
            {initialData?.draftStep && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Draft (Step {initialData.draftStep}/5)
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-300 font-medium">Configure student profile, credentials, documents & fee structure</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleSaveAndExit}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Save your progress as Draft"
          >
            💾 Save as Draft
          </button>
          <button 
            type="button"
            onClick={handleClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stepper Bar Header */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {STEPS.map((stepLabel, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isActive = stepNumber === currentStep

            return (
              <button
                key={stepNumber}
                type="button"
                onClick={() => {
                  if (stepNumber < currentStep || (initialData && initialData.draftStep >= stepNumber)) {
                    setCurrentStep(stepNumber)
                  }
                }}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-[1.02]' 
                    : isCompleted 
                      ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300' 
                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive 
                    ? 'bg-white text-teal-600' 
                    : isCompleted 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepNumber}
                </span>
                <span>{stepLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal Scrollable Core */}
      <div className="p-8 overflow-y-auto flex-1 space-y-8">
        {currentStep === 1 && <Step1 formData={formData} masters={masters} updateForm={updateForm} onNext={handleNext} onCancel={handleClose} onSaveDraft={handleSaveAndExit} />}
        {currentStep === 2 && <Step2 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={handleClose} onSaveDraft={handleSaveAndExit} />}
        {currentStep === 3 && <Step3 formData={formData} masters={masters} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={handleClose} onSaveDraft={handleSaveAndExit} />}
        {currentStep === 4 && <Step4 formData={formData} masters={masters} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={handleClose} onSaveDraft={handleSaveAndExit} />}
        {currentStep === 5 && <Step5 formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} onCancel={handleClose} onOpenPromo={handleOpenPromo} onSaveDraft={handleSaveAndExit} />}
        {currentStep === 6 && <Step6 formData={formData} onBack={handleBack} onCancel={handleClose} onEditStep={(step: number) => setCurrentStep(step)} />}
      </div>

      {promoModalState.open && (
        <PromoCodeModal 
          feeType={promoModalState.feeType}
          targetKey={promoModalState.targetKey}
          onApply={handleApplyPromo}
          onClose={() => setPromoModalState({ open: false })} 
        />
      )}
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
         className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300 font-semibold"
         {...props} 
       />
    </div>
  )
}

function SelectField({ label, required, options, disabled, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label} {required && <span className="text-red-500">*</span>}
       </label>
       <select 
         disabled={disabled}
         className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-semibold ${
           disabled 
             ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-500' 
             : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer'
         }`}
         {...props}
       >
         {options.map((opt: string, idx: number) => <option key={idx} value={opt}>{opt}</option>)}
       </select>
    </div>
  )
}

function FileUploadField({ label, required, placeholder, value, onChange }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = React.useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (onChange) onChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const displayVal = fileName || (value ? (typeof value === 'string' && value.startsWith('data:') ? 'Attached File ✓' : value) : '')

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label} {required && <span className="text-red-500">*</span>}
       </label>
       <div 
         onClick={() => fileInputRef.current?.click()}
         className="relative w-full cursor-pointer group"
       >
         <input 
           type="text" 
           value={displayVal}
           placeholder={placeholder || 'Attach a Photo / File'} 
           readOnly 
           className={`w-full px-3 py-2 border rounded-lg text-sm transition-all cursor-pointer pr-10 font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${
             displayVal 
               ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300' 
               : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-teal-400'
           }`}
         />
         <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
         <input 
           ref={fileInputRef} 
           type="file" 
           accept="image/*,.pdf" 
           className="hidden" 
           onChange={handleFileChange} 
         />
       </div>
    </div>
  )
}

function PromoCodeField({ label, placeholder, value, onClear, onClick }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
       <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">
         {label}
       </label>
       <div className="relative w-full cursor-pointer group" onClick={onClick}>
         <input 
           type="text" 
           placeholder={placeholder || 'Select an Option'} 
           value={value ? `Promo: ${value}` : ''}
           readOnly 
           className={`w-full px-3 py-2 border rounded-lg text-sm cursor-pointer pr-10 pointer-events-none font-semibold transition-all ${
             value 
               ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300' 
               : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-teal-400'
           }`} 
         />
         {value ? (
           <button
             type="button"
             onClick={(e) => {
               e.stopPropagation()
               if (onClear) onClear()
             }}
             title="Remove Promo Code"
             className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 cursor-pointer pointer-events-auto transition-colors"
           >
             <X className="w-3.5 h-3.5" />
           </button>
         ) : (
           <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
         )}
       </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 1: PERSONAL DETAILS
// ---------------------------------------------------------
function Step1({ formData, masters, updateForm, onNext, onCancel, onSaveDraft }: any) {
  const todayStr = new Date().toISOString().split('T')[0]
  const isClassSelected = Boolean(formData.class && formData.class !== 'Select a Class')

  // Calculate sections for selected class or use loaded sections
  let availableSections = masters.sections
  if (isClassSelected) {
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const classArr = JSON.parse(savedClasses)
        const foundClass = classArr.find((c: any) => !c.deleted && (c.className === formData.class || c.name === formData.class))
        if (foundClass && Array.isArray(foundClass.sections) && foundClass.sections.length > 0) {
          availableSections = ['Select a Section', ...foundClass.sections]
        }
      } catch (e) {}
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Personal Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="Academic Year" required options={masters.academicYears} value={formData.academicYear} onChange={(e: any) => updateForm('academicYear', e.target.value)} />
           
           <SelectField 
             label="Class" 
             required 
             options={masters.classes} 
             value={formData.class} 
             onChange={(e: any) => {
               const val = e.target.value
               updateForm('class', val)
               updateForm('section', '')
             }} 
           />
           
           <SelectField 
             label="Section" 
             required 
             options={isClassSelected ? availableSections : ['Select Class First']} 
             value={isClassSelected ? formData.section : ''} 
             disabled={!isClassSelected}
             onChange={(e: any) => updateForm('section', e.target.value)} 
           />

           <InputField label="Roll No." placeholder="Enter Roll No. (Optional)" value={formData.rollNo} onChange={(e: any) => updateForm('rollNo', e.target.value)} />
           <InputField label="Admission No." placeholder="Enter Admission No. (Optional)" value={formData.admissionNo} onChange={(e: any) => updateForm('admissionNo', e.target.value)} />
           
           <InputField 
             label="Admission Date" 
             required 
             type="date" 
             max={todayStr}
             value={formData.admissionDate} 
             onChange={(e: any) => updateForm('admissionDate', e.target.value)} 
           />

           <SelectField label="Stream" options={masters.streams} value={formData.stream} onChange={(e: any) => updateForm('stream', e.target.value)} />
           <SelectField label="Medium" options={masters.mediums} value={formData.medium} onChange={(e: any) => updateForm('medium', e.target.value)} />
           <SelectField label="House/Block" options={masters.houses} value={formData.houseBlock} onChange={(e: any) => updateForm('houseBlock', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Basic Info" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
           <div className="col-span-2 grid grid-cols-2 gap-6">
             <InputField label="First Name" required placeholder="Enter Your First Name" value={formData.firstName} onChange={(e: any) => updateForm('firstName', e.target.value)} />
             <InputField label="Last Name" placeholder="Enter Your Last Name" value={formData.lastName} onChange={(e: any) => updateForm('lastName', e.target.value)} />
             <InputField label="Mobile No." required placeholder="Enter Your Mobile No" value={formData.mobileNo} onChange={(e: any) => updateForm('mobileNo', e.target.value)} />
             <InputField label="Email Id" placeholder="Enter Your Email Id" value={formData.emailId} onChange={(e: any) => updateForm('emailId', e.target.value)} />
             <InputField label="Date of Birth" required type="date" max={todayStr} value={formData.dob} onChange={(e: any) => updateForm('dob', e.target.value)} />
             
             <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Gender <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300"><input type="radio" name="gender" checked={formData.gender === 'Male'} onChange={() => updateForm('gender', 'Male')} className="text-teal-600 focus:ring-teal-500" /> Male</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300"><input type="radio" name="gender" checked={formData.gender === 'Female'} onChange={() => updateForm('gender', 'Female')} className="text-teal-600 focus:ring-teal-500" /> Female</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300"><input type="radio" name="gender" checked={formData.gender === 'Others'} onChange={() => updateForm('gender', 'Others')} className="text-teal-600 focus:ring-teal-500" /> Others</label>
                </div>
             </div>
           </div>
           
           {/* Avatar Upload */}
           <div className="col-span-1 flex flex-col items-center justify-center gap-4">
              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-teal-600" />
                )}
              </div>
              <label className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => updateForm('avatar', reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }} 
                />
              </label>
           </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Medical Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="Blood Group" options={['Select Your Blood Group', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={formData.bloodGroup} onChange={(e: any) => updateForm('bloodGroup', e.target.value)} />
           <InputField label="Height" placeholder="Enter Your Height" value={formData.height} onChange={(e: any) => updateForm('height', e.target.value)} />
           <InputField label="Weight" placeholder="Enter Your Weight" value={formData.weight} onChange={(e: any) => updateForm('weight', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Login/Account Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="User Name" placeholder="Enter User Name" value={formData.userName} onChange={(e: any) => updateForm('userName', e.target.value)} />
           <InputField label="Password" type="password" placeholder="Enter Password" value={formData.password} onChange={(e: any) => updateForm('password', e.target.value)} />
           <InputField label="Confirm Password" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e: any) => updateForm('confirmPassword', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button type="button" onClick={onCancel} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        {onSaveDraft && (
          <button type="button" onClick={onSaveDraft} className="px-8 py-2.5 bg-amber-50 border border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold rounded-xl hover:bg-amber-100 transition-all shadow-sm flex items-center gap-1.5">
            <span>💾</span> Save as Draft
          </button>
        )}
        <button type="button" onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>

    </div>
  )
}

// ---------------------------------------------------------
// STEP 2: EDUCATION DETAILS
// ---------------------------------------------------------
function Step2({ formData, updateForm, onNext, onBack, onCancel, onSaveDraft }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Previous School/College Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="School/College Name & Address" placeholder="Enter School/College Name & Address" value={formData.prevSchoolName} onChange={(e: any) => updateForm('prevSchoolName', e.target.value)} />
           <InputField label="Attended Class/Course" placeholder="Enter Attended Class/Course" value={formData.prevAttendedClass} onChange={(e: any) => updateForm('prevAttendedClass', e.target.value)} />
           <SelectField label="Last School/College Affiliated to" options={['Select an Option', 'CBSE', 'ICSE', 'State Board', 'University', 'Other']} value={formData.prevSchoolAffiliatedTo} onChange={(e: any) => updateForm('prevSchoolAffiliatedTo', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Transfer Certificate Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Transfer Certificate No." placeholder="Enter Certificate No." value={formData.tcNo} onChange={(e: any) => updateForm('tcNo', e.target.value)} />
           <InputField label="Date of issue" type="date" value={formData.tcIssueDate} onChange={(e: any) => updateForm('tcIssueDate', e.target.value)} />
           <FileUploadField label="Transfer Certificate" placeholder="Attach a Photo" value={formData.tcFile} onChange={(val: string) => updateForm('tcFile', val)} />
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
                <th className="py-3 px-2 font-semibold rounded-tr-xl">School/College Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                 <td className="py-2 px-2 text-center"><button className="text-slate-400 hover:text-red-500"><X className="w-4 h-4 mx-auto"/></button></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Qualification" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Pass Year" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Roll No" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Obt Marks" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Percentage" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="Subject" /></td>
                 <td className="py-2 px-2"><input className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs" placeholder="School/College Name" /></td>
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
        <button type="button" onClick={onBack} className="px-8 py-2.5 bg-white border border-slate-200 text-teal-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Back</button>
        <button type="button" onClick={onCancel} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
        {onSaveDraft && (
          <button type="button" onClick={onSaveDraft} className="px-8 py-2.5 bg-amber-50 border border-amber-300 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold rounded-xl hover:bg-amber-100 transition-all shadow-sm flex items-center gap-1.5">
            <span>💾</span> Save as Draft
          </button>
        )}
        <button type="button" onClick={onNext} className="px-10 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-sm">Save & Next</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// STEP 3: PARENTS DETAILS
// ---------------------------------------------------------
function Step3({ formData, masters, updateForm, onNext, onBack, onCancel }: any) {
  const [parentList, setParentList] = useState<any[]>([])
  const [selectedParentId, setSelectedParentId] = useState<string>('')

  const handleClearParent = () => {
    setSelectedParentId('')
    updateForm('fatherName', '')
    updateForm('fatherContact', '')
    updateForm('fatherOccupation', '')
    updateForm('fatherIncome', '')
    updateForm('fatherIncomeCert', '')
    updateForm('fatherPhoto', '')

    updateForm('motherName', '')
    updateForm('motherContact', '')
    updateForm('motherOccupation', '')
    updateForm('motherIncome', '')
    updateForm('motherIncomeCert', '')
    updateForm('motherPhoto', '')

    updateForm('address', '')
    updateForm('state', '')
    updateForm('district', '')
    updateForm('pincode', '')
  }

  useEffect(() => {
    let rawParents: any[] = []
    const savedInstParents = localStorage.getItem('school_institute_parents')
    const savedParents = localStorage.getItem('school_parents')
    
    if (savedInstParents) {
      try {
        const p1 = JSON.parse(savedInstParents)
        if (Array.isArray(p1)) rawParents.push(...p1)
      } catch (e) {}
    }
    if (savedParents) {
      try {
        const p2 = JSON.parse(savedParents)
        if (Array.isArray(p2)) rawParents.push(...p2)
      } catch (e) {}
    }
    if (masters.parents && Array.isArray(masters.parents)) {
      rawParents.push(...masters.parents)
    }

    const parentMap = new Map()
    rawParents.forEach((p: any) => {
      if (!p.deleted) {
        const key = String(p.id || p.contact || p.mobileNo || p.name || p.firstName)
        if (key && !parentMap.has(key)) {
          parentMap.set(key, p)
        }
      }
    })
    setParentList(Array.from(parentMap.values()))
  }, [masters.parents])

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <div className="flex items-center gap-4 mb-6">
           <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Parents Details</h3>
           <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
           <div className="flex items-center gap-2 shrink-0">
             <select 
               value={selectedParentId}
               className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-700 outline-none max-w-[260px] shrink-0 cursor-pointer"
               onChange={(e) => {
                 const selectedVal = e.target.value
                 setSelectedParentId(selectedVal)
                 if (!selectedVal) {
                   handleClearParent()
                   return
                 }
                 if (selectedVal && parentList.length > 0) {
                   const found = parentList.find((p: any) => 
                     String(p.id) === selectedVal || 
                     String(p.name) === selectedVal || 
                     String(p.fatherName) === selectedVal || 
                     String(p.motherName) === selectedVal || 
                     String(p.firstName) === selectedVal
                   )
                   if (found) {
                     const rawName = found.name || (found.firstName ? `${found.firstName} ${found.lastName || ''}`.trim() : '')
                     const contact = found.contact || found.mobileNo || found.fatherContact || found.motherContact || ''
                     const occupation = found.occupation || found.employmentType || found.fatherOccupation || found.motherOccupation || ''
                     const income = found.annualIncome || found.income || found.fatherIncome || found.motherIncome || ''

                     const pType = (found.parentType || '').toLowerCase()
                     const gender = (found.gender || '').toLowerCase()
                     const isMother = pType === 'mother' || (!pType && gender === 'female') || (found.motherName && !found.fatherName)

                     if (isMother) {
                       updateForm('motherName', found.motherName || rawName)
                       updateForm('motherContact', found.motherContact || contact)
                       updateForm('motherOccupation', found.motherOccupation || occupation)
                       updateForm('motherIncome', found.motherIncome || income)

                       updateForm('fatherName', found.fatherName || '')
                       updateForm('fatherContact', found.fatherContact || '')
                       updateForm('fatherOccupation', found.fatherOccupation || '')
                       updateForm('fatherIncome', found.fatherIncome || '')
                     } else {
                       updateForm('fatherName', found.fatherName || rawName)
                       updateForm('fatherContact', found.fatherContact || contact)
                       updateForm('fatherOccupation', found.fatherOccupation || occupation)
                       updateForm('fatherIncome', found.fatherIncome || income)

                       updateForm('motherName', found.motherName || '')
                       updateForm('motherContact', found.motherContact || '')
                       updateForm('motherOccupation', found.motherOccupation || '')
                       updateForm('motherIncome', found.motherIncome || '')
                     }

                     if (found.address) updateForm('address', found.address)
                     if (found.state || found.stateName) updateForm('state', found.state || found.stateName)
                     if (found.district) updateForm('district', found.district)
                     if (found.pincode) updateForm('pincode', found.pincode)
                   }
                 }
               }}
             >
               <option value="">Select Parent</option>
               {parentList && parentList.length > 0 ? (
                 parentList.map((p: any, idx: number) => {
                   const rawName = p.name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : '')
                   const pType = p.parentType || (p.gender === 'Female' ? 'Mother' : p.gender === 'Male' ? 'Father' : 'Parent')
                   const displayName = (pType.toLowerCase() === 'mother' ? (p.motherName || rawName) : (p.fatherName || rawName)) || `Parent #${p.id}`
                   const displayContact = p.contact || p.mobileNo || p.fatherContact || p.motherContact || 'N/A'
                   return (
                     <option key={idx} value={String(p.id || displayName)}>
                       {displayName} ({pType} - {displayContact})
                     </option>
                   )
                 })
               ) : (
                 <option value="" disabled>No Parents Registered</option>
               )}
             </select>

             {selectedParentId && (
               <button
                 type="button"
                 onClick={handleClearParent}
                 title="Deselect parent"
                 className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
               >
                 <X className="w-3.5 h-3.5" />
                 <span>Deselect</span>
               </button>
             )}
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <InputField label="Father Name" required placeholder="Enter Father Name" value={formData.fatherName} onChange={(e: any) => updateForm('fatherName', e.target.value)} />
           <InputField label="Father Contact No." required placeholder="Enter Contact No." value={formData.fatherContact} onChange={(e: any) => updateForm('fatherContact', e.target.value)} />
           <InputField label="Father Occupation" placeholder="Enter Occupation" value={formData.fatherOccupation} onChange={(e: any) => updateForm('fatherOccupation', e.target.value)} />
           <div /> {/* spacing */}

           <InputField label="Father Annual Income" placeholder="Enter Annual Income" value={formData.fatherIncome} onChange={(e: any) => updateForm('fatherIncome', e.target.value)} />
           <InputField label="Father Income Certificate" placeholder="Enter Income Certificate No." value={formData.fatherIncomeCert} onChange={(e: any) => updateForm('fatherIncomeCert', e.target.value)} />
           <FileUploadField label="Father Photo" placeholder="Upload Photo" value={formData.fatherPhoto} onChange={(val: string) => updateForm('fatherPhoto', val)} />
           <div /> {/* spacing */}

           <div className="col-span-full h-4" />

           <InputField label="Mother Name" placeholder="Enter Mother Name" value={formData.motherName} onChange={(e: any) => updateForm('motherName', e.target.value)} />
           <InputField label="Mother Contact No." placeholder="Enter Contact No." value={formData.motherContact} onChange={(e: any) => updateForm('motherContact', e.target.value)} />
           <InputField label="Mother Occupation" placeholder="Enter Occupation" value={formData.motherOccupation} onChange={(e: any) => updateForm('motherOccupation', e.target.value)} />
           <div /> {/* spacing */}

           <InputField label="Mother Annual Income" placeholder="Enter Annual Income" value={formData.motherIncome} onChange={(e: any) => updateForm('motherIncome', e.target.value)} />
           <InputField label="Mother Income Certificate" placeholder="Enter Income Certificate No." value={formData.motherIncomeCert} onChange={(e: any) => updateForm('motherIncomeCert', e.target.value)} />
           <FileUploadField label="Mother Photo" placeholder="Upload Photo" value={formData.motherPhoto} onChange={(val: string) => updateForm('motherPhoto', val)} />
           <div /> {/* spacing */}
        </div>
      </div>

      <div>
        <SectionHeader title="Address Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-full">
             <InputField label="Address" placeholder="Enter Address" value={formData.address} onChange={(e: any) => updateForm('address', e.target.value)} />
           </div>
           
           <SelectField label="State" options={['Select State', 'Delhi', 'Maharashtra', 'Uttar Pradesh']} value={formData.state} onChange={(e: any) => updateForm('state', e.target.value)} />
           <SelectField label="District" options={['Select District', 'New Delhi', 'Lucknow', 'Mumbai']} value={formData.district} onChange={(e: any) => updateForm('district', e.target.value)} />
           <InputField label="Pincode" placeholder="Enter Pincode" value={formData.pincode} onChange={(e: any) => updateForm('pincode', e.target.value)} />

           <InputField label="Domicile Certificate No." placeholder="Enter Domicile Certificate No." value={formData.domicileNo} onChange={(e: any) => updateForm('domicileNo', e.target.value)} />
           <FileUploadField label="Domicile Certificate" placeholder="Upload Certificate Photo" value={formData.domicileFile} onChange={(val: string) => updateForm('domicileFile', val)} />
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
function Step4({ formData, masters, updateForm, onNext, onBack, onCancel }: any) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div>
        <SectionHeader title="Govt. ID Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Aadhar Card No." placeholder="Enter Aadhar Card No." value={formData.aadharNo} onChange={(e: any) => updateForm('aadharNo', e.target.value)} />
           <FileUploadField label="Aadhar Card" placeholder="Upload a Photo" value={formData.aadharFile} onChange={(val: string) => updateForm('aadharFile', val)} />
           <SelectField label="Nationality" options={['Select Nationality', 'Indian', 'Other']} value={formData.nationality} onChange={(e: any) => updateForm('nationality', e.target.value)} />

           <SelectField label="Religion" options={['Select Religion', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Other']} value={formData.religion} onChange={(e: any) => updateForm('religion', e.target.value)} />
           <SelectField label="Category" options={masters.categories} value={formData.category} onChange={(e: any) => updateForm('category', e.target.value)} />
           <FileUploadField label="Category Certificate" placeholder="Upload Certificate Photo" value={formData.categoryFile} onChange={(val: string) => updateForm('categoryFile', val)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Birth Certificate Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Birth Certificate No." placeholder="Enter Birth Certificate No." value={formData.birthCertNo} onChange={(e: any) => updateForm('birthCertNo', e.target.value)} />
           <FileUploadField label="Birth Certificate" placeholder="Upload Certificate Photo" value={formData.birthCertFile} onChange={(val: string) => updateForm('birthCertFile', val)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Scholarship Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Scholarship ID" placeholder="Enter Scholarship ID" value={formData.scholarshipId} onChange={(e: any) => updateForm('scholarshipId', e.target.value)} />
           <InputField label="Scholarship Password" placeholder="Enter Password" value={formData.scholarshipPwd} onChange={(e: any) => updateForm('scholarshipPwd', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="Govt. Portal Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <InputField label="Govt. Student ID on Portal" placeholder="Enter ID No." value={formData.govtStudentId} onChange={(e: any) => updateForm('govtStudentId', e.target.value)} />
           <InputField label="Govt. Family ID on Portal" placeholder="Enter ID No." value={formData.govtFamilyId} onChange={(e: any) => updateForm('govtFamilyId', e.target.value)} />
           <InputField label="Samagra ID" placeholder="Enter ID No." value={formData.samagraId} onChange={(e: any) => updateForm('samagraId', e.target.value)} />
        </div>
      </div>

      <div>
        <SectionHeader title="BPL Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SelectField label="BPL Student" options={['Select an Option', 'Yes', 'No']} value={formData.bplStudent} onChange={(e: any) => updateForm('bplStudent', e.target.value)} />
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
// Helper to match fee setup configuration for a selected class
function getFeeConfigForClass(storageKey: string, studentClass: string) {
  if (!storageKey || !studentClass) return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const list = JSON.parse(raw)
    if (!Array.isArray(list) || list.length === 0) return null
    const target = studentClass.trim().toLowerCase()
    const targetNum = target.replace(/class\s*/i, '').trim()

    const romanMap: Record<string, string> = {
      '1': 'i', '2': 'ii', '3': 'iii', '4': 'iv', '5': 'v',
      '6': 'vi', '7': 'vii', '8': 'viii', '9': 'ix', '10': 'x',
      '11': 'xi', '12': 'xii'
    }
    const revRomanMap: Record<string, string> = {
      'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
      'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10',
      'xi': '11', 'xii': '12'
    }

    const found = list.find((item: any) => {
      if (!item.className) return false
      const c = item.className.toString().trim().toLowerCase()
      if (c === 'all' || c === target) return true
      const classesArr = c.split(',').map((s: string) => s.trim())
      return classesArr.some((clsStr: string) => {
        if (clsStr === target || clsStr === 'all') return true
        const cNum = clsStr.replace(/class\s*/i, '').trim()
        if (cNum === targetNum) return true
        if (romanMap[targetNum] === cNum || revRomanMap[targetNum] === cNum) return true
        return false
      })
    })

    if (found) return found
    return list[0]
  } catch (e) {
    return null
  }
}

function formatFeeVal(val: any): string {
  if (val === undefined || val === null || val === '') return ''
  const str = String(val).trim()
  if (str.endsWith('/-')) return str
  return `${str}/-`
}

// ---------------------------------------------------------
// STEP 5: FEE DETAILS
// ---------------------------------------------------------
function Step5({ formData, updateForm, onNext, onBack, onCancel, onOpenPromo }: any) {
  const [feeEnabled, setFeeEnabled] = useState(() => ({
    regFee: Boolean(formData.regFee || formData.regFeeDuration || formData.regFeeEnabled === true),
    admFee: Boolean(formData.admFee || formData.admFeeDuration || formData.admFeeEnabled === true),
    classFee: Boolean(formData.classFee || formData.classFeeDuration || formData.classFeeEnabled === true),
    libFee: Boolean(formData.libFee || formData.libFeeDuration || formData.libFeeEnabled === true),
    examFee: Boolean(formData.examFee || formData.examFeeDuration || formData.examFeeEnabled === true),
    hostelFee: Boolean(formData.hostelFee || formData.hostelFeeDuration || formData.hostelType || formData.hostelFeeEnabled === true),
    extraFee: Boolean(formData.extraFee || formData.extraActivityName || formData.extraFeeEnabled === true),
    transFee: Boolean(formData.transFee || formData.transRoute || formData.transStoppage || formData.transFeeEnabled === true),
  }))

  const toggleFee = (key: keyof typeof feeEnabled) => {
    setFeeEnabled(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Look up Class Fee configuration for student's class
  const classFeeChart = getFeeConfigForClass('school_class_fees', formData.class)

  // Options for Class Fee Duration based on configured chart
  let classDurationOptions = ['Select an Option']
  if (classFeeChart) {
    if (classFeeChart.oneTime && classFeeChart.oneTime !== '0' && classFeeChart.oneTime !== '0.0') classDurationOptions.push('One Time')
    if (classFeeChart.monthly && classFeeChart.monthly !== '0' && classFeeChart.monthly !== '0.0') classDurationOptions.push('Monthly')
    if (classFeeChart.quarterly && classFeeChart.quarterly !== '0' && classFeeChart.quarterly !== '0.0') classDurationOptions.push('Quarterly')
    if (classFeeChart.halfYearly && classFeeChart.halfYearly !== '0' && classFeeChart.halfYearly !== '0.0') classDurationOptions.push('Half Yearly')
    if (classFeeChart.yearly && classFeeChart.yearly !== '0' && classFeeChart.yearly !== '0.0') classDurationOptions.push('Yearly')
  }
  if (classDurationOptions.length === 1) {
    classDurationOptions = ['Select an Option', 'One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
  }

  const handleClassDurationChange = (dur: string) => {
    updateForm('classFeeDuration', dur)
    if (formData.isRteStudent === 'Yes') {
      updateForm('classFee', '0/-')
      return
    }
    if (classFeeChart) {
      if (dur === 'One Time' || dur === 'Onetime') updateForm('classFee', formatFeeVal(classFeeChart.oneTime || classFeeChart.monthly))
      else if (dur === 'Monthly') updateForm('classFee', formatFeeVal(classFeeChart.monthly))
      else if (dur === 'Quarterly') updateForm('classFee', formatFeeVal(classFeeChart.quarterly))
      else if (dur === 'Half Yearly' || dur === 'Quartly') updateForm('classFee', formatFeeVal(classFeeChart.halfYearly))
      else if (dur === 'Yearly' || dur === 'Annually' || dur === 'Annualy') updateForm('classFee', formatFeeVal(classFeeChart.yearly))
      else updateForm('classFee', '')
    } else {
      if (dur !== 'Select an Option') updateForm('classFee', '1000/-')
      else updateForm('classFee', '')
    }
  }

  const handleRteChange = (isRte: string) => {
    updateForm('isRteStudent', isRte)
    if (isRte === 'Yes') {
      updateForm('classFee', '0/-')
    } else {
      if (formData.classFeeDuration) {
        handleClassDurationChange(formData.classFeeDuration)
      }
    }
  }

  // Transport Data state
  const [transportData, setTransportData] = useState<{ routes: string[], stoppagesMap: Record<string, any[]> }>({
    routes: [],
    stoppagesMap: {}
  })

  useEffect(() => {
    let routesArr: string[] = []
    const stoppagesMap: Record<string, any[]> = {}

    // 1. Read transport_routes
    const savedRoutes = localStorage.getItem('transport_routes')
    if (savedRoutes) {
      try {
        const list = JSON.parse(savedRoutes)
        if (Array.isArray(list)) {
          list.forEach((r: any) => {
            const rName = r.routeName || r.name
            if (rName) {
              const label = r.vehicleName ? `${rName} (${r.vehicleName})` : rName
              if (!routesArr.includes(label)) routesArr.push(label)
              stoppagesMap[label] = []
              if (Array.isArray(r.stoppages)) {
                r.stoppages.forEach((st: any) => {
                  stoppagesMap[label].push({
                    location: st.location || st.name || st.stopName,
                    km: st.km || st.distance || '10',
                    fee: st.fee || st.amount || '500'
                  })
                })
              }
            }
          })
        }
      } catch (e) {}
    }

    // 2. Read transport_vehicles
    const savedVehicles = localStorage.getItem('transport_vehicles')
    if (savedVehicles) {
      try {
        const list = JSON.parse(savedVehicles)
        if (Array.isArray(list)) {
          list.forEach((v: any) => {
            if (v.route) {
              const label = `${v.route} (${v.vehicleName || 'Vehicle'})`
              if (!routesArr.includes(label)) routesArr.push(label)
              if (!stoppagesMap[label]) stoppagesMap[label] = []
            }
          })
        }
      } catch (e) {}
    }

    // 3. Read transportation_fees (configured under Fees Setup -> Transportation Fee)
    const savedFees = localStorage.getItem('transportation_fees')
    if (savedFees) {
      try {
        const list = JSON.parse(savedFees)
        if (Array.isArray(list)) {
          list.forEach((f: any) => {
            const rName = (f.route || f.routeName || '').trim()
            const pickup = (f.pickupLocation || f.location || f.stoppage || '').trim()
            const drop = (f.dropLocation || '').trim()
            const locLabel = pickup || (drop ? `Drop: ${drop}` : `Stop #${f.id}`)
            
            const stItem = {
              pickupLocation: pickup,
              dropLocation: drop,
              location: locLabel,
              km: String(f.km || f.distance || '10'),
              oneTime: f.oneTime && f.oneTime !== '-' ? f.oneTime : '',
              monthly: f.monthly && f.monthly !== '-' ? f.monthly : (f.amount ? `${f.amount}/-` : ''),
              quarterly: f.quarterly && f.quarterly !== '-' ? f.quarterly : '',
              halfYearly: f.halfYearly && f.halfYearly !== '-' ? f.halfYearly : '',
              yearly: f.yearly && f.yearly !== '-' ? f.yearly : '',
              fee: f.monthly || f.oneTime || (f.amount ? `${f.amount}/-` : '500/-')
            }

            if (rName) {
              const cleanR = rName.replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
              
              const matchedKey = routesArr.find(rKey => {
                const cleanKey = rKey.replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
                return cleanKey === cleanR || cleanKey.includes(cleanR) || cleanR.includes(cleanKey)
              })
              const targetRouteKey = matchedKey || (f.vehicle ? `${rName} (${f.vehicle})` : rName)
              if (!routesArr.includes(targetRouteKey)) {
                routesArr.push(targetRouteKey)
              }

              if (!stoppagesMap[targetRouteKey]) stoppagesMap[targetRouteKey] = []
              if (!stoppagesMap[targetRouteKey].some((s: any) => s.location === stItem.location)) {
                stoppagesMap[targetRouteKey].push(stItem)
              }
              if (!stoppagesMap[rName]) stoppagesMap[rName] = []
              if (!stoppagesMap[rName].some((s: any) => s.location === stItem.location)) {
                stoppagesMap[rName].push(stItem)
              }
            } else {
              routesArr.forEach(rKey => {
                if (!stoppagesMap[rKey]) stoppagesMap[rKey] = []
                if (!stoppagesMap[rKey].some((s: any) => s.location === stItem.location)) {
                  stoppagesMap[rKey].push(stItem)
                }
              })
            }
          })
        }
      } catch (e) {}
    }

    setTransportData({ routes: routesArr, stoppagesMap })
  }, [])

  const selectedRouteName = formData.transRoute || ''

  // Get all stoppages matching selected route label or base route name
  const getStoppagesForRoute = (selectedRoute: string) => {
    if (!selectedRoute || selectedRoute === 'Select an Option') return []
    if (transportData.stoppagesMap[selectedRoute] && transportData.stoppagesMap[selectedRoute].length > 0) {
      return transportData.stoppagesMap[selectedRoute]
    }
    
    const cleanSel = selectedRoute.replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
    let matches: any[] = []
    
    Object.keys(transportData.stoppagesMap).forEach(key => {
      const cleanKey = key.replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
      if (key === selectedRoute || cleanKey === cleanSel || cleanKey.includes(cleanSel) || cleanSel.includes(cleanKey)) {
        matches.push(...(transportData.stoppagesMap[key] || []))
      }
    })
    
    const map = new Map()
    matches.forEach(item => {
      if (item.location && !map.has(item.location)) {
        map.set(item.location, item)
      }
    })
    return Array.from(map.values())
  }

  const availableStoppages = getStoppagesForRoute(selectedRouteName)
  const routeOptions = ['Select an Option', ...transportData.routes]
  const stoppageOptions = ['Select an Option', ...availableStoppages.map(s => s.location)]

  const handleTransRouteChange = (routeVal: string) => {
    updateForm('transRoute', routeVal)
    updateForm('transStoppage', '')
    updateForm('transDistance', '')
    updateForm('transFee', '')
  }

  const calculateTransFeeForDuration = (found: any, dur: string) => {
    if (!found) return
    let feeStr = ''
    if (dur === 'One Time' || dur === 'Onetime') feeStr = found.oneTime || found.monthly || found.fee
    else if (dur === 'Monthly') feeStr = found.monthly || found.fee
    else if (dur === 'Quarterly') feeStr = found.quarterly || found.monthly || found.fee
    else if (dur === 'Half Yearly' || dur === 'Quartly') feeStr = found.halfYearly || found.monthly || found.fee
    else if (dur === 'Yearly' || dur === 'Annually') feeStr = found.yearly || found.monthly || found.fee
    else feeStr = found.monthly || found.fee || ''

    if (feeStr) updateForm('transFee', formatFeeVal(feeStr))
  }

  // Sync transport distance and fee whenever stoppage, route, duration, or availableStoppages change
  useEffect(() => {
    if (formData.transStoppage && availableStoppages.length > 0) {
      const found = availableStoppages.find(s => s.location === formData.transStoppage)
      if (found) {
        if (found.km && formData.transDistance !== `${found.km} Km`) {
          updateForm('transDistance', `${found.km} Km`)
        }
        const dur = formData.transFeeDuration || 'Monthly'
        let feeStr = ''
        if (dur === 'One Time' || dur === 'Onetime') feeStr = found.oneTime || found.monthly || found.fee
        else if (dur === 'Monthly') feeStr = found.monthly || found.fee
        else if (dur === 'Quarterly') feeStr = found.quarterly || found.monthly || found.fee
        else if (dur === 'Half Yearly' || dur === 'Quartly') feeStr = found.halfYearly || found.monthly || found.fee
        else if (dur === 'Yearly' || dur === 'Annually') feeStr = found.yearly || found.monthly || found.fee
        else feeStr = found.monthly || found.fee

        const formatted = formatFeeVal(feeStr)
        if (formatted && formData.transFee !== formatted) {
          updateForm('transFee', formatted)
        }
      }
    }
  }, [formData.transStoppage, formData.transRoute, formData.transFeeDuration, availableStoppages])

  const handleTransStoppageChange = (stopVal: string) => {
    updateForm('transStoppage', stopVal)
    const found = availableStoppages.find(s => s.location === stopVal)
    if (found) {
      updateForm('transDistance', found.km ? `${found.km} Km` : '')
      const dur = formData.transFeeDuration || 'Monthly'
      if (!formData.transFeeDuration) updateForm('transFeeDuration', 'Monthly')
      calculateTransFeeForDuration(found, dur)
    } else {
      updateForm('transDistance', '')
      updateForm('transFee', '')
    }
  }

  const handleTransFeeDurationChange = (dur: string) => {
    updateForm('transFeeDuration', dur)
    const found = availableStoppages.find(s => s.location === formData.transStoppage)
    if (found) {
      calculateTransFeeForDuration(found, dur)
    }
  }

  // Extra Curricular Activities list loaded from school_extra_curricular_fees
  const [extraActivities, setExtraActivities] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('school_extra_curricular_fees')
    if (raw) {
      try {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const target = (formData.class || '').trim().toLowerCase()
          const targetNum = target.replace(/class\s*/i, '').trim()
          
          const filtered = list.filter((item: any) => {
            if (!item.className) return true
            const c = item.className.toString().trim().toLowerCase()
            if (c === 'all' || c === target) return true
            const cNum = c.replace(/class\s*/i, '').trim()
            return cNum === targetNum
          })

          setExtraActivities(filtered.length > 0 ? filtered : list)
        }
      } catch (e) {}
    }
  }, [formData.class])

  const extraActivityNames = Array.from(new Set(extraActivities.map(a => a.activityName).filter(Boolean)))
  const extraCurricularActivityOptions = ['Select an Option', ...extraActivityNames]

  const handleExtraActivityChange = (actName: string) => {
    updateForm('extraActivityName', actName)
    const found = extraActivities.find(a => a.activityName === actName)
    if (found && found.amount) {
      updateForm('extraFee', formatFeeVal(found.amount))
      if (!formData.extraFeeDuration) {
        updateForm('extraFeeDuration', 'One Time')
      }
    }
  }

  // Hostel Types list loaded from school_hostel_fees
  const [hostelItems, setHostelItems] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('school_hostel_fees')
    if (raw) {
      try {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const target = (formData.class || '').trim().toLowerCase()
          const targetNum = target.replace(/class\s*/i, '').trim()
          
          const filtered = list.filter((item: any) => {
            if (!item.className) return true
            const c = item.className.toString().trim().toLowerCase()
            if (c === 'all' || c === target) return true
            const cNum = c.replace(/class\s*/i, '').trim()
            return cNum === targetNum
          })

          setHostelItems(filtered.length > 0 ? filtered : list)
        }
      } catch (e) {}
    }
  }, [formData.class])

  const hostelTypeNames = Array.from(new Set(hostelItems.map(h => h.hostelType || h.name).filter(Boolean)))
  const hostelTypeOptions = ['Select an Option', ...hostelTypeNames]

  const handleHostelTypeChange = (hType: string) => {
    updateForm('hostelType', hType)
    const found = hostelItems.find(h => (h.hostelType || h.name) === hType)
    if (found) {
      const dur = formData.hostelFeeDuration || 'Monthly'
      updateForm('hostelFeeDuration', dur)
      if ((dur === 'One Time' || dur === 'Onetime') && found.oneTime) updateForm('hostelFee', formatFeeVal(found.oneTime))
      else if (dur === 'Monthly' && found.monthly) updateForm('hostelFee', formatFeeVal(found.monthly))
      else if (dur === 'Quarterly' && found.quarterly) updateForm('hostelFee', formatFeeVal(found.quarterly))
      else if ((dur === 'Half Yearly' || dur === 'Quartly') && found.halfYearly) updateForm('hostelFee', formatFeeVal(found.halfYearly))
      else if ((dur === 'Yearly' || dur === 'Annually') && found.yearly) updateForm('hostelFee', formatFeeVal(found.yearly))
      else if (found.oneTime || found.monthly || found.amount) updateForm('hostelFee', formatFeeVal(found.oneTime || found.monthly || found.amount))
    }
  }

  const handleHostelDurationChange = (dur: string) => {
    updateForm('hostelFeeDuration', dur)
    const found = hostelItems.find(h => (h.hostelType || h.name) === formData.hostelType)
    if (found) {
      if ((dur === 'One Time' || dur === 'Onetime') && found.oneTime) updateForm('hostelFee', formatFeeVal(found.oneTime))
      else if (dur === 'Monthly' && found.monthly) updateForm('hostelFee', formatFeeVal(found.monthly))
      else if (dur === 'Quarterly' && found.quarterly) updateForm('hostelFee', formatFeeVal(found.quarterly))
      else if ((dur === 'Half Yearly' || dur === 'Quartly') && found.halfYearly) updateForm('hostelFee', formatFeeVal(found.halfYearly))
      else if ((dur === 'Yearly' || dur === 'Annually') && found.yearly) updateForm('hostelFee', formatFeeVal(found.yearly))
    }
  }

  // Calculate Summary for all active fees
  let totalGrossBase = 0
  let totalDiscountAll = 0
  let totalNetAll = 0

  const accumulateFee = (enabled: boolean, baseStr: any, promo?: string) => {
    if (!enabled) return
    const res = calculateFinalFee(baseStr, promo)
    totalGrossBase += res.baseFee
    totalDiscountAll += res.discount
    totalNetAll += res.finalFee
  }

  accumulateFee(feeEnabled.regFee, formData.regFee, formData.regFeePromo)
  accumulateFee(feeEnabled.admFee, formData.admFee, formData.admFeePromo)
  accumulateFee(feeEnabled.classFee, formData.isRteStudent === 'Yes' ? '0' : formData.classFee, formData.classFeePromo)
  accumulateFee(feeEnabled.libFee, formData.libFee, formData.libFeePromo)
  accumulateFee(feeEnabled.examFee, formData.examFee, formData.examFeePromo)
  accumulateFee(feeEnabled.hostelFee, formData.hostelFee, formData.hostelFeePromo)
  accumulateFee(feeEnabled.extraFee, formData.extraFee, formData.extraFeePromo)
  accumulateFee(feeEnabled.transFee, formData.transFee, formData.transFeePromo)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <FeeSection 
        title="Registration Fee" 
        enabled={feeEnabled.regFee} 
        onToggle={() => toggleFee('regFee')} 
        onOpenPromo={() => onOpenPromo('regFee', 'Registration Fee')} 
        promoValue={formData.regFeePromo}
        onClearPromo={() => updateForm('regFeePromo', '')}
        storageKey="school_registration_fees"
        studentClass={formData.class}
        durationValue={formData.regFeeDuration}
        feeValue={formData.regFee}
        onDurationChange={(dur, fee) => {
          updateForm('regFeeDuration', dur)
          updateForm('regFee', fee)
        }}
      />

      <FeeSection 
        title="Admission Fee" 
        enabled={feeEnabled.admFee} 
        onToggle={() => toggleFee('admFee')} 
        onOpenPromo={() => onOpenPromo('admFee', 'Admission Fee')} 
        promoValue={formData.admFeePromo}
        onClearPromo={() => updateForm('admFeePromo', '')}
        storageKey="school_admission_fees"
        studentClass={formData.class}
        durationValue={formData.admFeeDuration}
        feeValue={formData.admFee}
        onDurationChange={(dur, fee) => {
          updateForm('admFeeDuration', dur)
          updateForm('admFee', fee)
        }}
      />
      
      <FeeSection 
        title="Class Fee Details" 
        required 
        enabled={feeEnabled.classFee} 
        onToggle={() => toggleFee('classFee')} 
        onOpenPromo={() => onOpenPromo('classFee', 'Class Fee')}
        promoValue={formData.classFeePromo}
        onClearPromo={() => updateForm('classFeePromo', '')}
      >
        {(() => {
          const classBaseFee = formData.isRteStudent === 'Yes' ? '0/-' : formData.classFee
          const calculatedClass = calculateFinalFee(classBaseFee, formData.classFeePromo)

          return (
            <div className="flex flex-col gap-4">
               <div className="mb-1">
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">RTE Student <span className="text-red-500">*</span></label>
                  <p className="text-[10px] text-slate-400">Class Fee is not applicable for RTE Student according to Government.</p>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                      <input type="radio" name="rte" checked={formData.isRteStudent === 'Yes'} onChange={() => handleRteChange('Yes')} className="text-teal-600 focus:ring-teal-500" /> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                      <input type="radio" name="rte" checked={formData.isRteStudent !== 'Yes'} onChange={() => handleRteChange('No')} className="text-teal-600 focus:ring-teal-500" /> No
                    </label>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <SelectField 
                   label="Fee Duration" 
                   required 
                   options={classDurationOptions} 
                   value={formData.classFeeDuration || ''} 
                   onChange={(e: any) => handleClassDurationChange(e.target.value)} 
                 />
                 
                 <div className="flex flex-col gap-1.5 w-full">
                   <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
                   <input 
                     value={formData.classFee || (formData.isRteStudent === 'Yes' ? '0/-' : '')} 
                     readOnly 
                     placeholder="Select Fee Duration"
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none font-semibold" 
                   />
                 </div>

                 <PromoCodeField 
                   label="Promo Code" 
                   placeholder="Select an Option" 
                   value={formData.classFeePromo}
                   onClear={() => updateForm('classFeePromo', '')}
                   onClick={() => onOpenPromo('classFee', 'Class Fee')} 
                 />

                 <div className="flex flex-col gap-1.5 w-full">
                   <div className="flex items-center justify-between">
                     <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Final Amount</label>
                     {calculatedClass.discount > 0 && (
                       <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                         {calculatedClass.discountTag}
                       </span>
                     )}
                   </div>
                   <input 
                     value={formData.classFee || formData.isRteStudent === 'Yes' ? (calculatedClass.finalFeeStr || formData.classFee || '0/-') : ''} 
                     readOnly 
                     placeholder="Amount after Promo"
                     className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                       calculatedClass.discount > 0 
                         ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                         : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                     }`} 
                   />
                 </div>
               </div>
            </div>
          )
        })()}
      </FeeSection>

      <FeeSection 
        title="Library Fee" 
        enabled={feeEnabled.libFee} 
        onToggle={() => toggleFee('libFee')} 
        onOpenPromo={() => onOpenPromo('libFee', 'Library Fee')} 
        promoValue={formData.libFeePromo}
        onClearPromo={() => updateForm('libFeePromo', '')}
        storageKey="school_library_fees"
        studentClass={formData.class}
        durationValue={formData.libFeeDuration}
        feeValue={formData.libFee}
        onDurationChange={(dur, fee) => {
          updateForm('libFeeDuration', dur)
          updateForm('libFee', fee)
        }}
      />
      
      <FeeSection 
        title="Exam Fee" 
        enabled={feeEnabled.examFee} 
        onToggle={() => toggleFee('examFee')} 
        onOpenPromo={() => onOpenPromo('examFee', 'Exam Fee')} 
        promoValue={formData.examFeePromo}
        onClearPromo={() => updateForm('examFeePromo', '')}
        storageKey="school_exam_fees"
        studentClass={formData.class}
        durationValue={formData.examFeeDuration}
        feeValue={formData.examFee}
        onDurationChange={(dur, fee) => {
          updateForm('examFeeDuration', dur)
          updateForm('examFee', fee)
        }}
      />
      
      <FeeSection 
        title="Hostel Fee" 
        enabled={feeEnabled.hostelFee} 
        onToggle={() => toggleFee('hostelFee')} 
        onOpenPromo={() => onOpenPromo('hostelFee', 'Hostel Fee')}
        promoValue={formData.hostelFeePromo}
        onClearPromo={() => updateForm('hostelFeePromo', '')}
      >
        {(() => {
          const calculatedHostel = calculateFinalFee(formData.hostelFee, formData.hostelFeePromo)

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <SelectField 
                   label="Select Hostel Type" 
                   required 
                   options={hostelTypeOptions} 
                   value={formData.hostelType || ''}
                   onChange={(e: any) => handleHostelTypeChange(e.target.value)}
                 />
                 <SelectField 
                   label="Fee Duration" 
                   required 
                   options={['Select an Option', 'One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly']} 
                   value={formData.hostelFeeDuration || ''}
                   onChange={(e: any) => handleHostelDurationChange(e.target.value)}
                 />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="flex flex-col gap-1.5 w-full">
                   <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
                   <input 
                     value={formData.hostelFee || ''} 
                     onChange={(e: any) => updateForm('hostelFee', e.target.value)}
                     placeholder="Ex : 1,000/-" 
                     className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300 font-semibold" 
                   />
                 </div>
                 <PromoCodeField 
                   label="Promo Code" 
                   placeholder="Select an Option" 
                   value={formData.hostelFeePromo}
                   onClear={() => updateForm('hostelFeePromo', '')}
                   onClick={() => onOpenPromo('hostelFee', 'Hostel Fee')} 
                 />
                 <div className="flex flex-col gap-1.5 w-full">
                   <div className="flex items-center justify-between">
                     <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Final Amount</label>
                     {calculatedHostel.discount > 0 && (
                       <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                         {calculatedHostel.discountTag}
                       </span>
                     )}
                   </div>
                   <input 
                     value={formData.hostelFee ? (calculatedHostel.finalFeeStr || formData.hostelFee) : ''} 
                     readOnly 
                     placeholder="Amount after Promo"
                     className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                       calculatedHostel.discount > 0 
                         ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                         : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                     }`} 
                   />
                 </div>
              </div>
            </div>
          )
        })()}
      </FeeSection>
      
      <FeeSection 
        title="Extra Curricular Fee" 
        enabled={feeEnabled.extraFee} 
        onToggle={() => toggleFee('extraFee')} 
        onOpenPromo={() => onOpenPromo('extraFee', 'Extra Curricular Fee')}
        promoValue={formData.extraFeePromo}
        onClearPromo={() => updateForm('extraFeePromo', '')}
      >
        {(() => {
          const calculatedExtra = calculateFinalFee(formData.extraFee, formData.extraFeePromo)
          return (
            <div className="flex flex-col gap-5">
              <ExtraCurricularMultiSelect 
                formData={formData} 
                updateForm={updateForm} 
                masterActivities={extraActivities}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                 <PromoCodeField 
                   label="Extra Curricular Promo Code" 
                   placeholder="Select an Option" 
                   value={formData.extraFeePromo}
                   onClear={() => updateForm('extraFeePromo', '')}
                   onClick={() => onOpenPromo('extraFee', 'Extra Curricular Fee')} 
                 />
                 <div className="flex flex-col gap-1.5 w-full">
                   <div className="flex items-center justify-between">
                     <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Final Amount</label>
                     {calculatedExtra.discount > 0 && (
                       <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                         {calculatedExtra.discountTag}
                       </span>
                     )}
                   </div>
                   <input 
                     value={formData.extraFee ? (calculatedExtra.finalFeeStr || formData.extraFee) : ''} 
                     readOnly 
                     placeholder="Amount after Promo"
                     className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                       calculatedExtra.discount > 0 
                         ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                         : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                     }`} 
                   />
                 </div>
              </div>
            </div>
          )
        })()}
      </FeeSection>

      <FeeSection 
        title="Transportation Service Fee" 
        enabled={feeEnabled.transFee} 
        onToggle={() => toggleFee('transFee')} 
        onOpenPromo={() => onOpenPromo('transFee', 'Transportation Fee')}
        promoValue={formData.transFeePromo}
        onClearPromo={() => updateForm('transFeePromo', '')}
      >
        {(() => {
          const calculatedTrans = calculateFinalFee(formData.transFee, formData.transFeePromo)

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <SelectField 
                   label="Select Route" 
                   required 
                   options={routeOptions} 
                   value={formData.transRoute || ''}
                   onChange={(e: any) => handleTransRouteChange(e.target.value)}
                 />
                 <SelectField 
                   label="Select Pickup/Stoppage Location" 
                   required 
                   options={stoppageOptions} 
                   value={formData.transStoppage || ''}
                   onChange={(e: any) => handleTransStoppageChange(e.target.value)}
                 />
                 <div className="flex flex-col gap-1.5 w-full">
                   <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Distance (Approx.)</label>
                   <input 
                     value={formData.transDistance || ''} 
                     placeholder="Ex: 20 Km"
                     readOnly 
                     className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none font-semibold" 
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <SelectField 
                   label="Fee Duration" 
                   required 
                   options={['Select an Option', 'One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly']} 
                   value={formData.transFeeDuration || ''}
                   onChange={(e: any) => handleTransFeeDurationChange(e.target.value)}
                 />
                 <div className="flex flex-col gap-1.5 w-full">
                   <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
                   <input 
                     value={formData.transFee || ''} 
                     onChange={(e: any) => updateForm('transFee', e.target.value)}
                     placeholder="Ex : 1,000/-" 
                     className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-600 dark:text-slate-300 font-semibold" 
                   />
                 </div>
                 <PromoCodeField 
                   label="Promo Code" 
                   placeholder="Select an Option" 
                   value={formData.transFeePromo}
                   onClear={() => updateForm('transFeePromo', '')}
                   onClick={() => onOpenPromo('transFee', 'Transportation Fee')} 
                 />
                 <div className="flex flex-col gap-1.5 w-full">
                   <div className="flex items-center justify-between">
                     <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Final Amount</label>
                     {calculatedTrans.discount > 0 && (
                       <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                         {calculatedTrans.discountTag}
                       </span>
                     )}
                   </div>
                   <input 
                     value={formData.transFee ? (calculatedTrans.finalFeeStr || formData.transFee) : ''} 
                     readOnly 
                     placeholder="Amount after Promo"
                     className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                       calculatedTrans.discount > 0 
                         ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                         : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                     }`} 
                   />
                 </div>
              </div>
            </div>
          )
        })()}
      </FeeSection>

      {/* Interactive Total Fee Summary Bar */}
      <div className="p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 rounded-2xl border-2 border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6 sm:gap-10">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Total Base Fees</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">₹{totalGrossBase.toLocaleString()}/-</span>
          </div>
          {totalDiscountAll > 0 && (
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">Total Promo Discount</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">- ₹{totalDiscountAll.toLocaleString()}/-</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-widest block">Final Total Net Amount</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">₹{totalNetAll.toLocaleString()}/-</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
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
function Step6({ formData, onBack, onCancel, onEditStep }: any) {
  const [submitting, setSubmitting] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    // 1. Try DB creation/update
    await createStudent(formData)
    
    // 2. Save to localStorage for instant local reflection
    const saved = localStorage.getItem('school_students')
    let currentList: any[] = []
    if (saved) {
      try { currentList = JSON.parse(saved) } catch (e) { console.error(e) }
    }

    const existingIdx = formData.id ? currentList.findIndex((s: any) => String(s.id) === String(formData.id)) : -1

    const studentRecord = {
      id: formData.id || Date.now(),
      admission_no: formData.admissionNo || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      roll_no: formData.rollNo || `${currentList.length + 1}`,
      first_name: formData.firstName,
      last_name: formData.lastName || '',
      class_name: `${formData.class || ''}${formData.section ? ` (${formData.section})` : ''}`,
      contact: formData.mobileNo || '',
      fees_status: formData.fees_status || 'Pending',
      status: formData.status || 'Active',
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.firstName}`,
      ...formData
    }

    let updatedList: any[] = []
    if (existingIdx >= 0) {
      updatedList = [...currentList]
      updatedList[existingIdx] = studentRecord
    } else {
      updatedList = [studentRecord, ...currentList]
    }

    localStorage.setItem('school_students', JSON.stringify(updatedList))

    // 3. Sync into school_all_fees for All Fee setup directory
    const parseAmt = (val: any) => parseFloat(String(val || '').replace(/[^0-9.]/g, '')) || 0
    const regAmt = parseAmt(formData.regFee)
    const admAmt = parseAmt(formData.admFee)
    const classAmt = formData.isRteStudent === 'Yes' ? 0 : parseAmt(formData.classFee)
    const libAmt = parseAmt(formData.libFee)
    const examAmt = parseAmt(formData.examFee)
    const hostelAmt = parseAmt(formData.hostelFee)
    const transAmt = parseAmt(formData.transFee)
    const extraAmt = parseAmt(formData.extraFee)
    const fineAmt = parseAmt(formData.fine)

    const totalAmt = regAmt + admAmt + classAmt + libAmt + examAmt + hostelAmt + transAmt + extraAmt + fineAmt
    const totalStr = `${totalAmt.toLocaleString()}/-`
    const isPaid = (formData.fees_status || 'Pending') === 'Paid'

    const feeRecordItem = {
      id: studentRecord.id,
      class: formData.class || '',
      section: formData.section || '',
      name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      reg: regAmt > 0 ? `${regAmt}/-` : '0/-',
      adm: admAmt > 0 ? `${admAmt}/-` : '0/-',
      classFee: classAmt > 0 ? `${classAmt}/-` : '0/-',
      lib: libAmt > 0 ? `${libAmt}/-` : '0/-',
      exam: examAmt > 0 ? `${examAmt}/-` : '0/-',
      hostel: hostelAmt > 0 ? `${hostelAmt}/-` : '0/-',
      trans: transAmt > 0 ? `${transAmt}/-` : '0/-',
      extra: extraAmt > 0 ? `${extraAmt}/-` : '0/-',
      fine: fineAmt > 0 ? `${fineAmt}/-` : '0/-',
      pending: isPaid ? '0/-' : totalStr,
      total: totalStr,
      status: isPaid ? 'Paid' : 'Unpaid',
      ...studentRecord
    }

    const savedFees = localStorage.getItem('school_all_fees')
    let allFeesList: any[] = []
    if (savedFees) {
      try { allFeesList = JSON.parse(savedFees) } catch (e) {}
    }
    const feeIdx = allFeesList.findIndex((f: any) => String(f.id) === String(studentRecord.id))
    if (feeIdx >= 0) {
      allFeesList[feeIdx] = { ...allFeesList[feeIdx], ...feeRecordItem }
    } else {
      allFeesList = [feeRecordItem, ...allFeesList]
    }
    // 4. Clear from drafts list if it was saved as a draft
    try {
      const draftKey = formData.draftId || formData.id
      const rawDrafts = localStorage.getItem('school_draft_students')
      if (rawDrafts) {
        const dList = JSON.parse(rawDrafts)
        const filtered = dList.filter((d: any) => String(d.draftId || d.id) !== String(draftKey))
        localStorage.setItem('school_draft_students', JSON.stringify(filtered))
      }
    } catch (e) {}

    toast.success(formData.id ? 'Student details updated successfully!' : 'Student successfully registered!')
    onCancel()
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top 2 Cards: Basic Info & Login */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Basic Info" icon={Eye} onEdit={() => onEditStep && onEditStep(1)}>
           <div className="flex items-start gap-4">
              <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                 {formData.avatar ? (
                   <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-3xl">👤</span>
                 )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-y-4">
                 <div className="col-span-full flex justify-between">
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm">{formData.firstName || 'Student'} {formData.lastName || ''}</h4>
                       <p className="text-xs text-slate-500">Student, {formData.gender || 'Male'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] text-slate-500">Roll No. : {formData.rollNo || 'N/A'}</p>
                       <p className="text-[11px] text-slate-500">Admission Date : {formData.admissionDate || 'N/A'}</p>
                    </div>
                 </div>
                 <InfoRow label="Mobile No." value={formData.mobileNo || 'N/A'} />
                 <InfoRow label="Email Id" value={formData.emailId || 'N/A'} />
                 <InfoRow label="Date of Birth" value={formData.dob || 'N/A'} />
              </div>
           </div>
        </InfoCard>

        <InfoCard title="Login & Account Details" icon={Edit2} onEdit={() => onEditStep && onEditStep(1)}>
           <div className="flex flex-col gap-4 h-full justify-center">
              <InfoRow label="User Name" value={formData.userName || `stu_${formData.firstName?.toLowerCase() || '101'}`} valueClass="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md mt-1 font-mono font-bold" />
              <InfoRow label="Password" value="••••••••••" valueClass="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md mt-1 font-mono" />
           </div>
        </InfoCard>
      </div>

      {/* Fee Structure Summary Card */}
      <FeeDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(5)} />

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
         <div className="flex flex-col gap-6">
            <PersonalDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(1)} />
            <EducationTableCard data={formData} onEdit={() => onEditStep && onEditStep(2)} />
            <ParentsDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(3)} />
            <BirthCertificateCard data={formData} onEdit={() => onEditStep && onEditStep(4)} />
            <BplRteDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(4)} />
         </div>

         <div className="flex flex-col gap-6">
            <PreviousSchoolCard data={formData} onEdit={() => onEditStep && onEditStep(2)} />
            <div className="grid grid-cols-2 gap-6">
               <MedicalDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(1)} />
               <TCDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(2)} />
            </div>
            <AddressDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(3)} />
            <GovtIdDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(4)} />
            <ScholarshipDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(4)} />
            <GovtPortalDetailsCard data={formData} onEdit={() => onEditStep && onEditStep(4)} />
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

export function calculateFinalFee(baseFeeStr: string | number | undefined, promoCode?: string) {
  const base = parseFloat(String(baseFeeStr || '').replace(/[^0-9.]/g, '')) || 0
  if (!promoCode || base <= 0) {
    return {
      baseFee: base,
      discount: 0,
      discountTag: '',
      finalFee: base,
      finalFeeStr: base > 0 ? `${base}/-` : (baseFeeStr ? String(baseFeeStr) : '')
    }
  }

  let discount = 0
  let discountTag = ''
  let foundMaster: any = null

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('school_masters_discounts') : null
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list)) {
        foundMaster = list.find((d: any) => 
          (d.promoCode && d.promoCode.trim().toLowerCase() === promoCode.trim().toLowerCase()) ||
          (d.name && d.name.trim().toLowerCase() === promoCode.trim().toLowerCase())
        )
      }
    }
  } catch (e) {}

  if (foundMaster) {
    if (foundMaster.valueType === 'Percentage' || (!foundMaster.valueType && foundMaster.percentage && foundMaster.percentage !== '0')) {
      const p = parseFloat(foundMaster.percentage) || 0
      discount = Math.round((base * p) / 100)
      discountTag = `${p}% Off (-₹${discount})`
    } else {
      const amt = parseFloat(foundMaster.amount) || 0
      discount = Math.min(base, amt)
      discountTag = `₹${amt} Off (-₹${discount})`
    }
  } else {
    // Check if promo code has percentage or amount patterns like NEW20, ADM10, 500OFF, 20%, etc.
    const clean = promoCode.toUpperCase()
    let isPercent = clean.includes('%')
    let pVal = 0

    const numMatch = clean.match(/\d+/)
    if (numMatch) {
      const extracted = parseFloat(numMatch[0])
      if (clean.includes('%') || extracted <= 100) {
        isPercent = true
        pVal = extracted
      } else {
        isPercent = false
        pVal = extracted
      }
    }

    if (isPercent) {
      discount = Math.round((base * (pVal || 0)) / 100)
      discountTag = `${pVal}% Off (-₹${discount})`
    } else {
      discount = Math.min(base, Math.round(pVal || 0))
      discountTag = `₹${pVal} Off (-₹${discount})`
    }
  }

  const finalAmt = Math.max(0, base - discount)
  return {
    baseFee: base,
    discount,
    discountTag,
    finalFee: finalAmt,
    finalFeeStr: `${finalAmt}/-`
  }
}

function FeeSection({ 
  title, 
  required, 
  enabled, 
  onToggle, 
  onOpenPromo, 
  promoValue,
  onClearPromo,
  storageKey,
  studentClass,
  durationValue,
  feeValue,
  onDurationChange,
  children 
}: { 
  title: string, 
  required?: boolean, 
  enabled: boolean, 
  onToggle: () => void, 
  onOpenPromo: () => void, 
  promoValue?: string,
  onClearPromo?: () => void,
  storageKey?: string,
  studentClass?: string,
  durationValue?: string,
  feeValue?: string,
  onDurationChange?: (duration: string, fee: string) => void,
  children?: React.ReactNode 
}) {
  const chart = storageKey && studentClass ? getFeeConfigForClass(storageKey, studentClass) : null

  let durationOptions = ['Select an Option']
  if (chart) {
    if (chart.oneTime && chart.oneTime !== '0' && chart.oneTime !== '-') durationOptions.push('One Time')
    if (chart.monthly && chart.monthly !== '0' && chart.monthly !== '-') durationOptions.push('Monthly')
    if (chart.quarterly && chart.quarterly !== '0' && chart.quarterly !== '-') durationOptions.push('Quarterly')
    if (chart.halfYearly && chart.halfYearly !== '0' && chart.halfYearly !== '-') durationOptions.push('Half Yearly')
    if (chart.yearly && chart.yearly !== '0' && chart.yearly !== '-') durationOptions.push('Yearly')
  }
  if (durationOptions.length === 1) {
    durationOptions = ['Select an Option', 'One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
  }

  const handleSelectDuration = (dur: string) => {
    let feeStr = ''
    if (chart) {
      if (dur === 'One Time' || dur === 'Onetime') feeStr = formatFeeVal(chart.oneTime)
      else if (dur === 'Monthly') feeStr = formatFeeVal(chart.monthly)
      else if (dur === 'Quarterly') feeStr = formatFeeVal(chart.quarterly)
      else if (dur === 'Half Yearly' || dur === 'Quartly') feeStr = formatFeeVal(chart.halfYearly)
      else if (dur === 'Yearly' || dur === 'Annually' || dur === 'Annualy') feeStr = formatFeeVal(chart.yearly)
    } else {
      if (dur !== 'Select an Option') feeStr = '1000/-'
    }
    if (onDurationChange) {
      onDurationChange(dur, feeStr)
    }
  }

  const calculated = calculateFinalFee(feeValue, promoValue)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-white dark:bg-slate-800 shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
           <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
             {title} {required && <span className="text-red-500">*</span>}
           </h3>
           <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-700" />
        </div>
        
        {/* Interactive Toggle Switch */}
        <div 
          onClick={onToggle} 
          className={`ml-4 w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors shrink-0 shadow-inner ${
            enabled ? 'bg-teal-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
          }`}
        >
           <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all transform" />
        </div>
      </div>

      {/* Expandable Content Container */}
      {enabled && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in duration-200">
           {children || (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SelectField 
                  label="Fee Duration" 
                  required 
                  options={durationOptions} 
                  value={durationValue || ''}
                  onChange={(e: any) => handleSelectDuration(e.target.value)}
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Fee</label>
                  <input 
                    value={feeValue || ''} 
                    readOnly 
                    placeholder="Select Fee Duration"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none font-semibold" 
                  />
                </div>
                <PromoCodeField 
                  label="Promo Code" 
                  placeholder="Select an Option" 
                  value={promoValue}
                  onClear={onClearPromo}
                  onClick={onOpenPromo} 
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 ml-1">Final Amount</label>
                    {calculated.discount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {calculated.discountTag}
                      </span>
                    )}
                  </div>
                  <input 
                    value={feeValue ? (calculated.finalFeeStr || feeValue) : ''} 
                    readOnly 
                    placeholder="Amount after Promo"
                    className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                      calculated.discount > 0 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`} 
                  />
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// PROMO CODE MODAL
// ---------------------------------------------------------
function PromoCodeModal({ 
  feeType, 
  targetKey,
  onApply, 
  onClose 
}: { 
  feeType?: string, 
  targetKey?: string,
  onApply: (promo: any) => void, 
  onClose: () => void 
}) {
  const [tab, setTab] = useState<'AMOUNT' | 'PERCENTAGE'>('AMOUNT')
  const [discountsList, setDiscountsList] = useState<any[]>([])

  useEffect(() => {
    let list: any[] = []
    const savedMasters = localStorage.getItem('school_masters_discounts')
    if (savedMasters) {
      try {
        const parsed = JSON.parse(savedMasters)
        if (Array.isArray(parsed)) list.push(...parsed.filter((d: any) => !d.deleted))
      } catch (e) {}
    }

    if (list.length === 0) {
      const defaultMasters = [
        { id: 1, name: 'Welcome Admission Discount', promoCode: 'ADM10', applicableType: 'Admission Time', applicableFee: 'All Fee', valueType: 'Fixed amount', amount: '1000', percentage: '10', continuity: 'One Time' },
        { id: 2, name: 'Class Fee Concession', promoCode: 'CLASS500', applicableType: 'Fee Collection Time', applicableFee: 'Class Fee', valueType: 'Fixed amount', amount: '500', percentage: '5', continuity: 'Every Month' },
        { id: 3, name: 'Early Bird Admission', promoCode: 'EARLY15', applicableType: 'Admission Time', applicableFee: 'Admission Fee', valueType: 'Percentage', amount: '1500', percentage: '15', continuity: 'One Time' },
        { id: 4, name: 'Transport Subsidy', promoCode: 'TRANS10', applicableType: 'Fee Collection Time', applicableFee: 'Transportation Fee', valueType: 'Percentage', amount: '300', percentage: '10', continuity: 'Every Month' },
        { id: 5, name: 'Registration Special', promoCode: 'REG200', applicableType: 'Admission Time', applicableFee: 'Registration Fee', valueType: 'Fixed amount', amount: '200', percentage: '20', continuity: 'One Time' },
        { id: 6, name: 'Sibling Fee Discount', promoCode: 'SIBLING1000', applicableType: 'Fee Collection Time', applicableFee: 'All Fee', valueType: 'Fixed amount', amount: '1000', percentage: '10', continuity: 'Every Month' }
      ]
      list = defaultMasters
    }

    setDiscountsList(list)
  }, [])

  const amountPromos = discountsList.filter(d => d.valueType === 'Fixed amount' || (!d.valueType && d.amount && d.amount !== '0'))
  const percentagePromos = discountsList.filter(d => d.valueType === 'Percentage' || (!d.valueType && d.percentage && d.percentage !== '0'))

  const currentPromos = tab === 'AMOUNT' ? amountPromos : percentagePromos

  const colors = ['bg-teal-700', 'bg-blue-700', 'bg-violet-700', 'bg-emerald-700', 'bg-amber-700', 'bg-rose-700', 'bg-fuchsia-700', 'bg-indigo-700']

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="relative p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center gap-3">
          {feeType && (
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              Applying to: {feeType}
            </span>
          )}

          {/* Tabs */}
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white shadow-sm">
             <button 
               type="button"
               onClick={() => setTab('AMOUNT')}
               className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer ${tab === 'AMOUNT' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               Amount Discount <span className={`rounded-md px-1.5 py-0.5 text-xs ${tab === 'AMOUNT' ? 'bg-white text-teal-600' : 'bg-slate-100 text-slate-700'}`}>{String(amountPromos.length).padStart(2, '0')}</span>
             </button>
             <button 
               type="button"
               onClick={() => setTab('PERCENTAGE')}
               className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors border-l border-slate-200 cursor-pointer ${tab === 'PERCENTAGE' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               Percentage Discount <span className={`rounded-md px-1.5 py-0.5 text-xs ${tab === 'PERCENTAGE' ? 'bg-white text-teal-600' : 'bg-slate-100 text-slate-700'}`}>{String(percentagePromos.length).padStart(2, '0')}</span>
             </button>
          </div>

          <button onClick={onClose} className="absolute right-6 top-6 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-400 cursor-pointer">
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
           {currentPromos.length === 0 ? (
             <div className="py-12 text-center text-slate-400">
               <Percent className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal-500" />
               <p className="font-bold text-slate-600 dark:text-slate-300">No {tab === 'AMOUNT' ? 'Amount' : 'Percentage'} discount promo codes configured.</p>
               <p className="text-xs text-slate-400 mt-1">Configure discount heads under Masters &rarr; Discount Heads.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPromos.map((promo, idx) => {
                   const colorClass = colors[idx % colors.length]
                   const code = promo.promoCode || promo.code || promo.name || 'PROMO'
                   const title = promo.name || promo.applicableType || 'Discount Promo'
                   const context = promo.applicableFee ? `(${promo.applicableFee})` : '(All Fee)'
                   const discountDisplay = tab === 'AMOUNT' 
                     ? `Amount ₹${promo.amount ? promo.amount.replace('/-', '').replace('₹', '') : '0'}/- Off` 
                     : `${promo.percentage || '0'}% Off`

                   return (
                     <div key={idx} className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className={`${colorClass} w-1/3 flex items-center justify-center`}>
                           <Percent className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="w-2/3 p-4 flex flex-col justify-between bg-white dark:bg-slate-800">
                           <div>
                             <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{title}</span>
                             <span className={`text-sm font-black mt-0.5 block ${colorClass.replace('bg-', 'text-')}`}>{code}</span>
                             <span className="text-[11px] text-slate-500 mb-2 block">{context}</span>
                           </div>
                           
                           <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                               {discountDisplay}
                             </span>
                             <button 
                               type="button"
                               onClick={() => onApply(promo)} 
                               className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded transition-colors"
                             >
                               Apply &rarr;
                             </button>
                           </div>
                        </div>
                     </div>
                   )
                })}
             </div>
           )}
        </div>

      </div>
    </div>
  )
}

function ExtraCurricularMultiSelect({ formData, updateForm, masterActivities }: any) {
  const defaultSuggestions = [
    { name: 'Boxing', defaultFee: '1000' },
    { name: 'Fan Fee', defaultFee: '500' },
    { name: 'Water Fee', defaultFee: '300' },
    { name: 'Sports & Games', defaultFee: '800' },
    { name: 'Computer Lab Fee', defaultFee: '600' },
    { name: 'Music & Dance', defaultFee: '700' }
  ]

  const availableMap = new Map<string, string>()
  defaultSuggestions.forEach(s => availableMap.set(s.name, s.defaultFee))
  if (Array.isArray(masterActivities)) {
    masterActivities.forEach((a: any) => {
      const name = a.activityName || a.name
      const fee = String(a.amount || a.fee || '500').replace(/[^0-9.]/g, '')
      if (name) availableMap.set(name, fee)
    })
  }

  const allAvailableNames = Array.from(availableMap.keys())

  const [items, setItems] = useState<{ name: string, fee: string }[]>(() => {
    if (Array.isArray(formData.extraActivities) && formData.extraActivities.length > 0) {
      return formData.extraActivities.map((it: any) => ({
        name: it.name || it.activityName || '',
        fee: it.fee || it.amount || ''
      }))
    }
    if (formData.extraActivityName) {
      const names = formData.extraActivityName.split(',').map((s: string) => s.trim()).filter(Boolean)
      if (names.length > 1) {
        return names.map((n: string) => ({
          name: n,
          fee: availableMap.get(n) ? `${availableMap.get(n)}/-` : '500/-'
        }))
      } else if (names.length === 1) {
        return [{ name: names[0], fee: formData.extraFee || (availableMap.get(names[0]) ? `${availableMap.get(names[0])}/-` : '1000/-') }]
      }
    }
    return [{ name: 'Boxing', fee: '1000/-' }]
  })

  const syncToForm = (updatedItems: { name: string, fee: string }[]) => {
    setItems(updatedItems)
    const validItems = updatedItems.filter(it => it.name.trim() !== '')
    const joinedNames = validItems.map(it => it.name.trim()).join(', ')

    let totalSum = 0
    validItems.forEach(it => {
      const num = parseFloat(String(it.fee || '').replace(/[^0-9.]/g, '')) || 0
      totalSum += num
    })

    const totalFeeStr = totalSum > 0 ? `${totalSum.toLocaleString()}/-` : ''

    updateForm('extraActivities', validItems)
    updateForm('extraActivityName', joinedNames)
    updateForm('extraFee', totalFeeStr)
  }

  const handleItemChange = (index: number, field: 'name' | 'fee', val: string) => {
    const updated = [...items]
    if (field === 'name') {
      updated[index].name = val
      if (availableMap.has(val) && (!updated[index].fee || updated[index].fee === '')) {
        const defFee = availableMap.get(val)
        updated[index].fee = defFee ? `${defFee}/-` : ''
      }
    } else {
      updated[index].fee = val.endsWith('/-') || !val ? val : `${val}/-`
    }
    syncToForm(updated)
  }

  const handleAddItem = () => {
    const usedNames = new Set(items.map(i => i.name))
    const unused = allAvailableNames.find(n => !usedNames.has(n)) || ''
    const defaultFee = unused && availableMap.get(unused) ? `${availableMap.get(unused)}/-` : ''
    syncToForm([...items, { name: unused, fee: defaultFee }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      syncToForm([{ name: '', fee: '' }])
    } else {
      syncToForm(items.filter((_, i) => i !== index))
    }
  }

  const handleToggleChip = (name: string) => {
    const existingIdx = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase())
    if (existingIdx >= 0) {
      handleRemoveItem(existingIdx)
    } else {
      const defFee = availableMap.get(name) ? `${availableMap.get(name)}/-` : '500/-'
      const firstBlankIdx = items.findIndex(i => !i.name.trim())
      if (firstBlankIdx >= 0) {
        const updated = [...items]
        updated[firstBlankIdx] = { name, fee: defFee }
        syncToForm(updated)
      } else {
        syncToForm([...items, { name, fee: defFee }])
      }
    }
  }

  const totalCalculated = items.reduce((sum, item) => {
    const num = parseFloat(String(item.fee || '').replace(/[^0-9.]/g, '')) || 0
    return sum + num
  }, 0)

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      
      {/* Quick Selection Chips */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Quick Select Extra Curricular / Amenities:</label>
        <div className="flex flex-wrap gap-2">
          {allAvailableNames.map(name => {
            const isSelected = items.some(i => i.name.toLowerCase() === name.toLowerCase())
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleToggleChip(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{isSelected ? '✓' : '+'}</span>
                <span>{name}</span>
                {availableMap.get(name) && <span className="opacity-75 text-[10px]">({availableMap.get(name)}/-)</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Items List */}
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
             
             {/* Activity Name */}
             <div className="md:col-span-6 flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Activity / Amenity Name #{idx + 1}</label>
                <div className="relative">
                  <input 
                    type="text"
                    list={`activity-options-${idx}`}
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Boxing, Fan Fee, Water Fee"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <datalist id={`activity-options-${idx}`}>
                    {allAvailableNames.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
             </div>

             {/* Fee */}
             <div className="md:col-span-4 flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Fee Amount</label>
                <input 
                  type="text"
                  value={item.fee}
                  onChange={(e) => handleItemChange(idx, 'fee', e.target.value)}
                  placeholder="e.g. 1000/-"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 focus:ring-2 focus:ring-teal-500 outline-none"
                />
             </div>

             {/* Action Delete */}
             <div className="md:col-span-2 flex items-center justify-end pb-0.5">
                <button 
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center transition-colors border border-rose-200/60"
                  title="Remove Activity"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
             </div>

          </div>
        ))}
      </div>

      {/* Footer Bar with Add Button & Total */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
         <button 
           type="button"
           onClick={handleAddItem}
           className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 hover:bg-teal-100 text-xs font-bold transition-all border border-teal-200 dark:border-teal-800"
         >
           <Plus className="w-4 h-4 stroke-[3]" /> Add Another Activity / Fee
         </button>

         <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Total Extra Curricular Fee:</span>
            <span className="text-base font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
               {totalCalculated.toLocaleString()}/-
            </span>
         </div>
      </div>

    </div>
  )
}

