'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { ArrowLeft, ArrowRight, Save, X, Calendar, User, Key, Building, Printer, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type StepType = 'Personal Details' | 'License Details' | 'Address Details' | 'Payroll & Leave' | 'Payment Details' | 'Final Preview'
const STEPS: StepType[] = ['Personal Details', 'License Details', 'Address Details', 'Payroll & Leave', 'Payment Details', 'Final Preview']

function AddDriverWizardForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  const [currentStep, setCurrentStep] = useState<StepType>('Personal Details')

  // ==================== STEP 1: PERSONAL DETAILS STATE ====================
  const [role, setRole] = useState('Driver')
  const [driverId, setDriverId] = useState('42')
  const [joiningDate, setJoiningDate] = useState('2026-01-01')
  const [firstName, setFirstName] = useState('Alok')
  const [lastName, setLastName] = useState('Tiwari')
  const [mobileNo, setMobileNo] = useState('9999999999')
  const [emailId, setEmailId] = useState('abc@gmail.com')
  const [gender, setGender] = useState('Male')
  const [dob, setDob] = useState('2018-01-14')
  const [fatherName, setFatherName] = useState('Ram Lal Tiwari')
  const [maritalStatus, setMaritalStatus] = useState('Married')
  const [nationality, setNationality] = useState('Indian')
  const [religion, setReligion] = useState('Hindu')
  const [category, setCategory] = useState('General')
  const [username, setUsername] = useState('aloktiwari2012326')
  const [password, setPassword] = useState('2012326AlokTiwari@')
  const [confirmPassword, setConfirmPassword] = useState('2012326AlokTiwari@')

  // ==================== STEP 2: LICENSE DETAILS STATE ====================
  const [licenseType, setLicenseType] = useState('LMV')
  const [licenseNumber, setLicenseNumber] = useState('LMV/123/456')
  const [licenseIssueDate, setLicenseIssueDate] = useState('2013-06-12')
  const [licenseValidTill, setLicenseValidTill] = useState('2028-06-11')

  // ==================== STEP 3: ADDRESS DETAILS STATE ====================
  const [address, setAddress] = useState('123, Location, Street Name, Locality')
  const [state, setState] = useState('Uttar Pradesh')
  const [district, setDistrict] = useState('Lucknow')
  const [pincode, setPincode] = useState('221545')
  const [aadharNo, setAadharNo] = useState('12345678900')
  const [aadharFileName, setAadharFileName] = useState('Aadhar Card.jpg')
  const [sigFileName, setSigFileName] = useState('Signature.png')

  // ==================== STEP 4: PAYROLL & LEAVE STATE ====================
  const [basicSalary, setBasicSalary] = useState('12500')
  const [hra, setHra] = useState('2000')
  const [conveyance, setConveyance] = useState('1500')
  const [specialAllowance, setSpecialAllowance] = useState('4000')
  const [grossSalary, setGrossSalary] = useState('20000')
  const [casualLeave, setCasualLeave] = useState('12')
  const [medicalLeave, setMedicalLeave] = useState('12')
  const [halfDayLeave, setHalfDayLeave] = useState('6')

  // ==================== STEP 5: PAYMENT DETAILS STATE ====================
  const [accountHolderName, setAccountHolderName] = useState('Alok Tiwari')
  const [accountNo, setAccountNo] = useState('1203214568')
  const [ifscCode, setIfscCode] = useState('BANK123456')
  const [bankName, setBankName] = useState('abcd Bank')
  const [panNo, setPanNo] = useState('PAN12345678')
  const [upiId, setUpiId] = useState('abcd@okindian')
  const [uanNo, setUanNo] = useState('123456789')
  const [pfNo, setPfNo] = useState('123456789')

  // Load for edit mode
  useEffect(() => {
    if (editId) {
      const saved = localStorage.getItem('transport_drivers')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          const found = list.find((d: any) => d.id === Number(editId))
          if (found) {
            setDriverId(found.driverId)
            setJoiningDate(found.joiningDate)
            setFirstName(found.driverName.split(' ')[0] || '')
            setLastName(found.driverName.split(' ')[1] || '')
            setMobileNo(found.contact)
            setUsername(found.username)
            setLicenseType(found.licenseType || 'LMV')
            setLicenseNumber(found.licenseNumber || '')
            setGender(found.gender || 'Male')
            setDob(found.dob || '')
            setFatherName(found.fatherName || '')
            setMaritalStatus(found.maritalStatus || 'Married')
            setAddress(found.address || '123, Location, Street Name')
            setDistrict(found.district || 'Lucknow')
            setState(found.state || 'Uttar Pradesh')
            setPincode(found.pincode || '221545')
            setAadharNo(found.aadharNo || '12345678900')
            setBasicSalary(found.basicSalary || '12500')
            setGrossSalary(found.grossSalary || '20000')
            setBankName(found.bankName || 'abcd Bank')
            setAccountNo(found.accountNo || '1203214568')
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [editId])

  const handleNext = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1])
    }
  }

  const handleBack = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1])
    }
  }

  const handleSaveDriver = () => {
    const savedActive = localStorage.getItem('transport_drivers')
    let current: any[] = []
    if (savedActive) {
      try {
        current = JSON.parse(savedActive)
      } catch (e) {
        console.error(e)
      }
    }

    const payload = {
      id: editId ? Number(editId) : Date.now(),
      username: username || `dri_${driverId}`,
      driverName: `${firstName} ${lastName}`.trim(),
      driverId,
      licenseNumber,
      licenseType,
      contact: mobileNo,
      status: 'Active' as const,
      joiningDate,
      gender,
      dob,
      fatherName,
      maritalStatus,
      email: emailId,
      religion,
      category,
      address,
      district,
      state,
      pincode,
      aadharNo,
      basicSalary,
      grossSalary,
      bankName,
      accountNo
    }

    let updated: any[] = []
    if (editId) {
      updated = current.map(item => item.id === Number(editId) ? payload : item)
    } else {
      updated = [payload, ...current]
    }

    localStorage.setItem('transport_drivers', JSON.stringify(updated))
    alert(editId ? 'Driver details updated successfully!' : 'New driver added successfully!')
    router.push('/institute/transport/driver')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/institute/transport/driver')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {currentStep === 'Final Preview' ? 'Final Preview' : editId ? 'Edit Driver' : 'Add Driver'}
            </h1>
            <p className="text-xs text-slate-400">Configure new driver profile and credentials</p>
          </div>
        </div>
        
        {currentStep === 'Final Preview' && (
          <button 
            type="button"
            onClick={() => window.print()}
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stepper Progress Bar (Screenshot 4) */}
      {currentStep !== 'Final Preview' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center max-w-4xl mx-auto relative px-4">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
            {STEPS.filter(s => s !== 'Final Preview').map((step, idx) => {
              const stepIdx = STEPS.indexOf(currentStep)
              const isActive = step === currentStep
              const isCompleted = STEPS.indexOf(step) < stepIdx
              return (
                <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    isActive ? 'bg-teal-600 border-teal-600 text-white shadow-md' :
                    isCompleted ? 'bg-teal-100 border-teal-500 text-teal-600 font-bold' :
                    'bg-white dark:bg-slate-900 border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isActive ? 'text-teal-600' : 'text-slate-400'
                  }`}>
                    {step.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form Wizard Core Box */}
      <div className="space-y-6">
        
        {/* ==================== STEP 1: PERSONAL DETAILS ==================== */}
        {currentStep === 'Personal Details' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            
            {/* Section 1: Joining Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider border-b pb-2">Joining Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Role *</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none bg-white font-semibold">
                    <option value="Driver">Driver</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Driver ID *</label>
                  <input type="text" placeholder="Enter Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Joining Date *</label>
                  <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* Section 2: Basic Info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider border-b pb-2">Basic Info</h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">First Name *</label><input type="text" placeholder="Enter First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Last Name</label><input type="text" placeholder="Enter Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Mobile No. *</label><input type="text" placeholder="Enter Mobile No." value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Email Id</label><input type="email" placeholder="Enter Email Id" value={emailId} onChange={e => setEmailId(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Gender *</label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs"><input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} /> Male</label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs"><input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} /> Female</label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs"><input type="radio" name="gender" checked={gender === 'Others'} onChange={() => setGender('Others')} /> Others</label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Date of Birth *</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Father/Husband Name *</label><input type="text" placeholder="Enter Name" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Marital Status *</label>
                    <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                </div>

                {/* Upload box */}
                <div className="w-48 h-48 border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center rounded-2xl gap-3 text-center shrink-0">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border text-2xl">🧔</div>
                  <button type="button" className="text-[10px] font-bold text-teal-600 border border-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 bg-white">Upload Photo</button>
                </div>
              </div>
            </div>

            {/* Section 3: Religion & Category */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider border-b pb-2">Religion & Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Nationality</label>
                  <select value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none">
                    <option value="Indian">Indian</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Religion *</label>
                  <select value={religion} onChange={e => setReligion(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none">
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none">
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Login Account Details */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider border-b pb-2">Login/Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">User Name *</label><input type="text" placeholder="Enter User Name" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Password *</label><input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Confirm Password *</label><input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== STEP 2: LICENSE DETAILS ==================== */}
        {currentStep === 'License Details' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">License Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">LicenseType *</label>
                <select value={licenseType} onChange={e => setLicenseType(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold outline-none">
                  <option value="LMV">LMV (Light Motor Vehicle)</option>
                  <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                  <option value="PSV">PSV (Public Service Vehicle)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">License Number *</label>
                <input type="text" placeholder="Enter License Number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Issue Date *</label>
                <input type="date" value={licenseIssueDate} onChange={e => setLicenseIssueDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid Till *</label>
                <input type="date" value={licenseValidTill} onChange={e => setLicenseValidTill(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: ADDRESS DETAILS ==================== */}
        {currentStep === 'Address Details' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Address Details</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Address *</label>
                <input type="text" placeholder="Enter Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">State *</label>
                  <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold">
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">District *</label>
                  <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs bg-white font-semibold">
                    <option value="Lucknow">Lucknow</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Pincode *</label>
                  <input type="text" placeholder="Enter Pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none text-center" />
                </div>
              </div>
            </div>

            {/* Aadhar & Sign sections (Screenshot 2) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Aadhar & Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Aadhar No. *</label>
                  <input type="text" placeholder="Enter Aadhar No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Attach Aadhar</label>
                  <div className="border border-slate-200 rounded-lg p-2 flex justify-between items-center text-xs bg-slate-50 cursor-pointer">
                    <span className="text-slate-500 font-semibold">{aadharFileName}</span>
                    <span className="text-[10px] text-teal-600 font-bold">📎 Upload</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Attach Signature</label>
                  <div className="border border-slate-200 rounded-lg p-2 flex justify-between items-center text-xs bg-slate-50 cursor-pointer">
                    <span className="text-slate-500 font-semibold">{sigFileName}</span>
                    <span className="text-[10px] text-teal-600 font-bold">📎 Upload</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== STEP 4: PAYROLL & LEAVE ==================== */}
        {currentStep === 'Payroll & Leave' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Payroll Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Basic Salary *</label><input type="text" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">HRA *</label><input type="text" value={hra} onChange={e => setHra(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Conveyance *</label><input type="text" value={conveyance} onChange={e => setConveyance(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Special Allowance *</label><input type="text" value={specialAllowance} onChange={e => setSpecialAllowance(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Gross Monthly Salary</label><input type="text" value={grossSalary} onChange={e => setGrossSalary(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 font-bold" /></div>
              </div>
            </div>

            {/* Leave parameters (Screenshot 3) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Paid Leave (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Casual Leave</label>
                    <input type="number" placeholder="Enter No. of Leave" value={casualLeave} onChange={e => setCasualLeave(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Medical Leave</label>
                    <input type="number" placeholder="Enter No. of Leave" value={medicalLeave} onChange={e => setMedicalLeave(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Half Day Leave</label>
                    <input type="number" placeholder="Enter No. of Leave" value={halfDayLeave} onChange={e => setHalfDayLeave(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Apply From</label><input type="date" className="w-full px-4 py-2 border rounded-lg text-xs" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Apply From</label><input type="date" className="w-full px-4 py-2 border rounded-lg text-xs" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Apply From</label><input type="date" className="w-full px-4 py-2 border rounded-lg text-xs" /></div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== STEP 5: PAYMENT DETAILS ==================== */}
        {currentStep === 'Payment Details' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            
            {/* Section 1: Bank */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Account Holder Name</label><input type="text" placeholder="Enter Account Holder Name" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Bank Account No.</label><input type="text" placeholder="Enter Bank Account No." value={accountNo} onChange={e => setAccountNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">IFSC Code</label><input type="text" placeholder="Enter IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Bank Name</label><input type="text" placeholder="Enter Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">PAN No.</label><input type="text" placeholder="Enter PAN No." value={panNo} onChange={e => setPanNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
              </div>
            </div>

            {/* Section 2: Online payments */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Online Payment Details</h3>
              <div className="flex flex-col gap-1.5 max-w-sm">
                <label className="text-xs font-bold text-slate-700">UPI ID</label>
                <input type="text" placeholder="Enter UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" />
              </div>
            </div>

            {/* Section 3: Other Details */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Other Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">Universal Account No. (UAN)</label><input type="text" placeholder="Enter Universal Account No." value={uanNo} onChange={e => setUanNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-700">PF Account No.</label><input type="text" placeholder="Enter PF Account No." value={pfNo} onChange={e => setPfNo(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-xs outline-none" /></div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== STEP 6: FINAL PREVIEW ==================== */}
        {currentStep === 'Final Preview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Grid Layout of summary cards (Screenshot 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs select-none">
              
              {/* Left Column blocks */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Info Card */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm relative">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Basic Info</span>
                    <button type="button" onClick={() => setCurrentStep('Personal Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                  </h3>
                  
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border text-4xl shadow-sm shrink-0">
                      🧔
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
                      <div><span className="text-slate-450 block text-[9px] uppercase font-bold">Driver Name</span><span className="font-extrabold text-sm text-slate-900">{firstName} {lastName}</span></div>
                      <div><span className="text-slate-450 block text-[9px] uppercase font-bold">Driver ID No.</span><span className="font-bold">{driverId}</span></div>
                      <div><span className="text-slate-450 block text-[9px] uppercase font-bold">Designation</span><span className="font-bold">Driver ({gender})</span></div>
                      <div><span className="text-slate-450 block text-[9px] uppercase font-bold">Joining Date</span><span className="font-bold">{joiningDate}</span></div>
                      
                      <div className="col-span-2 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100">
                        <div><span className="text-slate-400 block text-[8px] uppercase font-bold">Mobile No.</span><span className="font-bold">{mobileNo}</span></div>
                        <div><span className="text-slate-400 block text-[8px] uppercase font-bold">Email ID</span><span className="font-bold truncate max-w-[120px] block">{emailId}</span></div>
                        <div><span className="text-slate-400 block text-[8px] uppercase font-bold">Date of Birth</span><span className="font-bold">{dob}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Split: Aadhar / Religion / Address / Leave / License */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Aadhar Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                      <span>Aadhar Details</span>
                      <button type="button" onClick={() => setCurrentStep('Address Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Aadhar Card No.</span><span className="font-extrabold">{aadharNo}</span></div>
                      <div className="flex justify-between"><span>Aadhar Card</span><span className="font-bold text-teal-650 flex items-center gap-1">👁 {aadharFileName}</span></div>
                    </div>
                  </div>

                  {/* Religion & Category */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                      <span>Religion & Category</span>
                      <button type="button" onClick={() => setCurrentStep('Personal Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Nationality</span><span className="font-extrabold">{nationality}</span></div>
                      <div className="flex justify-between"><span>Religion</span><span className="font-extrabold">{religion}</span></div>
                      <div className="flex justify-between"><span>Category</span><span className="font-extrabold">{category}</span></div>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                      <span>Leave Details</span>
                      <button type="button" onClick={() => setCurrentStep('Payroll & Leave')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Casual Leave</span><span className="font-extrabold">{casualLeave}</span></div>
                      <div className="flex justify-between"><span>Medical Leave</span><span className="font-extrabold">{medicalLeave}</span></div>
                      <div className="flex justify-between"><span>Half Day Leave</span><span className="font-extrabold">{halfDayLeave}</span></div>
                    </div>
                  </div>

                  {/* License Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                      <span>License Details</span>
                      <button type="button" onClick={() => setCurrentStep('License Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>{licenseNumber}</span><span className="font-bold text-teal-650 flex items-center gap-1">👁 license.jpg</span></div>
                      <div className="flex justify-between"><span>Issue Date</span><span className="font-extrabold">{licenseIssueDate}</span></div>
                      <div className="flex justify-between"><span>Expiry Date</span><span className="font-extrabold">{licenseValidTill}</span></div>
                    </div>
                  </div>

                </div>

                {/* Payroll Details */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Payroll Details</span>
                    <button type="button" onClick={() => setCurrentStep('Payroll & Leave')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Basic Salary</span><span className="font-extrabold">{basicSalary}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">HRA</span><span className="font-extrabold">{hra}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Conveyance</span><span className="font-extrabold">{conveyance}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Special Allowance</span><span className="font-extrabold">{specialAllowance}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Gross Monthly Salary</span><span className="font-black text-[#1b3a60] dark:text-teal-400">{grossSalary}</span></div>
                  </div>
                </div>

              </div>

              {/* Right Column blocks */}
              <div className="space-y-6">
                
                {/* Login & Account Details */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Login & Account Details</span>
                    <button type="button" onClick={() => setCurrentStep('Personal Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                  </h3>
                  <div className="space-y-3 font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">User Name</span>
                      <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono mt-1 font-extrabold text-slate-800">{username}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Password</span>
                      <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono mt-1 flex justify-between items-center font-extrabold text-slate-800">
                        <span>•••••••••••••</span>
                        <span>👁</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Address Details</span>
                    <button type="button" onClick={() => setCurrentStep('Address Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                  </h3>
                  <table className="w-full text-left">
                    <tbody>
                      <tr className="border-b border-slate-100"><td className="py-2 text-slate-450 font-bold uppercase text-[9px]">Address</td><td className="py-2 text-right font-extrabold">{address}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 text-slate-450 font-bold uppercase text-[9px]">Pincode</td><td className="py-2 text-right font-extrabold">{pincode}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 text-slate-450 font-bold uppercase text-[9px]">District</td><td className="py-2 text-right font-extrabold">{district}</td></tr>
                      <tr><td className="py-2 text-slate-450 font-bold uppercase text-[9px]">State</td><td className="py-2 text-right font-extrabold">{state}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Marital Status */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Marital Status</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{maritalStatus}</span>
                  </div>
                  <button type="button" onClick={() => setCurrentStep('Personal Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                </div>

              </div>

            </div>

            {/* Bottom 2 rows of payment and extra details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              {/* Bank Details */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                  <span>Bank Details</span>
                  <button type="button" onClick={() => setCurrentStep('Payment Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Account Holder Name</span><span className="font-extrabold">{accountHolderName}</span></div>
                  <div className="flex justify-between"><span>Account No.</span><span className="font-extrabold">{accountNo}</span></div>
                  <div className="flex justify-between"><span>IFSC Code</span><span className="font-extrabold">{ifscCode}</span></div>
                  <div className="flex justify-between"><span>Bank Name</span><span className="font-extrabold">{bankName}</span></div>
                  <div className="flex justify-between"><span>Pan No.</span><span className="font-extrabold">{panNo}</span></div>
                </div>
              </div>

              {/* Online Payment Details */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Online Payment Details</span>
                    <button type="button" onClick={() => setCurrentStep('Payment Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                  </h3>
                  <div className="flex justify-between"><span>UPI ID</span><span className="font-extrabold text-[#1b3a60] dark:text-teal-400">{upiId}</span></div>
                </div>
              </div>

              {/* Other Details */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                  <span>Other Details</span>
                  <button type="button" onClick={() => setCurrentStep('Payment Details')} className="text-[10px] text-teal-600 font-bold">📝 Edit</button>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Universal Account No.</span><span className="font-extrabold">{uanNo}</span></div>
                  <div className="flex justify-between"><span>PF Account No.</span><span className="font-extrabold">{pfNo}</span></div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Stepper Navigation Footer */}
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button 
            type="button" 
            onClick={handleBack}
            className="px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-655 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>

          {currentStep === 'Payment Details' ? (
            <button 
              type="button"
              onClick={() => setCurrentStep('Final Preview')}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Final Preview
            </button>
          ) : currentStep === 'Final Preview' ? (
            <>
              <button 
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-750 hover:bg-slate-50 transition-colors"
              >
                Print
              </button>
              <button 
                type="button"
                onClick={handleSaveDriver}
                className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Final Submit
              </button>
            </>
          ) : (
            <button 
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Save & Next
            </button>
          )}
        </div>

      </div>

    </div>
  )
}

export default function CreateDriverWizardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-xs text-slate-400">Loading...</div>}>
      <AddDriverWizardForm />
    </Suspense>
  )
}
