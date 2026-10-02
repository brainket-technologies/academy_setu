'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Camera, Paperclip, FileEdit, Printer, EyeOff, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { INDIA_STATES_DISTRICTS } from '@/lib/india-data'

const STEPS = ['Personal Details', 'Qualification Details', 'Employment Details', 'Address Details']

export default function AddParentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // State & District from Main Admin Settings
  const [statesData, setStatesData] = useState<any[]>([])

  // Step 0: Personal Details & Account
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('Male')
  const [parentType, setParentType] = useState('Father')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  // Step 1: Qualification Details
  const [qualification, setQualification] = useState('')
  const [collegeName, setCollegeName] = useState('')

  // Step 2: Employment Details
  const [employmentType, setEmploymentType] = useState('Government Job')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [designation, setDesignation] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')

  // Step 3: Address Details & Aadhar
  const [address, setAddress] = useState('')
  const [stateName, setStateName] = useState('Uttar Pradesh')
  const [district, setDistrict] = useState('Lucknow')
  const [pincode, setPincode] = useState('')
  const [aadharNo, setAadharNo] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStatesData(data.data)
        } else {
          setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state_name: s.state, districts: s.districts })))
        }
      })
      .catch(err => {
        console.error('Failed to load states/cities', err)
        setStatesData(INDIA_STATES_DISTRICTS.map(s => ({ state_name: s.state, districts: s.districts })))
      })
  }, [])

  // Computed state list from Admin Settings
  const stateOptions = React.useMemo(() => {
    const list: string[] = statesData.length > 0 
      ? statesData.map((s: any) => s.state_name || s.name).filter(Boolean)
      : INDIA_STATES_DISTRICTS.map(s => s.state)
    return Array.from(new Set(list)).map(String).sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData])

  // Computed district list for selected state
  const districtOptions = React.useMemo(() => {
    if (!stateName) {
      if (statesData.length > 0) {
        const all = new Set<string>()
        statesData.forEach((s: any) => (s.districts || []).forEach((d: string) => all.add(d)))
        return Array.from(all).sort((a, b) => a.localeCompare(b))
      }
      return []
    }
    const foundState = statesData.find((s: any) => (s.state_name || s.name)?.toLowerCase() === stateName.toLowerCase())
    if (foundState && foundState.districts) {
      const dists = foundState.districts.map((d: any) => typeof d === 'string' ? d : (d.district_name || d.name || String(d)))
      return Array.from(new Set(dists)).map(String).sort((a: string, b: string) => a.localeCompare(b))
    }
    const fallback = INDIA_STATES_DISTRICTS.find(s => s.state.toLowerCase() === stateName.toLowerCase())
    if (fallback) {
      return fallback.districts.slice().sort((a, b) => a.localeCompare(b))
    }
    return []
  }, [statesData, stateName])

  const handleNextStep0 = () => {
    setFormError('')
    if (!firstName.trim()) {
      setFormError('First Name is required.')
      return
    }
    if (!mobileNo.trim()) {
      setFormError('Mobile Number is required.')
      return
    }
    if (!userName.trim()) {
      setFormError('User Name is required.')
      return
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    setCurrentStep(1)
  }

  const handleNextStep1 = () => {
    setCurrentStep(2)
  }

  const handleNextStep2 = () => {
    setCurrentStep(3)
  }

  const handleNextStep3 = () => {
    setFormError('')
    if (!address.trim()) {
      setFormError('Address is required.')
      return
    }
    setCurrentStep(4)
  }

  const handleFinalSubmit = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const now = new Date()

    const newParent = {
      id: Date.now(),
      username: userName.trim() || `Par${Math.floor(100 + Math.random() * 900)}`,
      name: fullName,
      contact: mobileNo.trim(),
      email: email.trim(),
      gender: gender,
      parentType: parentType,
      studentCount: 0,
      fees: '0/-',
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName || 'Parent')}`,
      followUpText: 'Registered new parent',
      followUpDate: now.toLocaleDateString('en-GB'),
      followUpTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      address: `${address.trim()}${district ? `, ${district}` : ''}${stateName ? `, ${stateName}` : ''}${pincode ? ` - ${pincode}` : ''}`,
      qualification: qualification,
      college: collegeName,
      employmentType: employmentType,
      companyName: companyName,
      designation: designation,
      annualIncome: annualIncome,
      aadharNo: aadharNo,
      joinDate: now.toLocaleDateString('en-GB'),
      deleted: false
    }

    const saved = localStorage.getItem('school_institute_parents')
    let list = []
    if (saved) {
      try {
        list = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }

    const updated = [newParent, ...list]
    localStorage.setItem('school_institute_parents', JSON.stringify(updated))
    toast.success('Parent added successfully!')
    router.push('/institute/parents')
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        {currentStep === 4 ? (
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentStep(3)} className="w-8 h-8 flex items-center justify-center rounded border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors">
              <span className="text-xl leading-none">&lsaquo;</span>
            </button>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Final Preview</h1>
          </div>
        ) : (
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Parent</h1>
        )}
        <Link href="/institute/parents" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200">
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Stepper Header (hidden on final preview) */}
        {currentStep < 4 && (
          <div className="p-6 pb-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center border border-teal-600 rounded-xl overflow-hidden mb-8 shadow-sm">
              {STEPS.map((step, idx) => (
                <div 
                  key={step} 
                  className={`flex-1 py-3 px-2 text-center text-xs font-bold border-r border-teal-600 last:border-0 transition-colors ${
                    idx === currentStep ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="flex justify-between relative max-w-4xl mx-auto px-10">
              <div className="absolute left-[50px] right-[50px] top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
              {STEPS.map((step, idx) => {
                const isPast = idx < currentStep
                const isCurrent = idx === currentStep
                return (
                  <div key={idx} className={`w-4 h-4 rounded-full border-2 z-10 bg-white ${
                    isPast ? 'border-teal-600 flex items-center justify-center' : 
                    isCurrent ? 'border-teal-600 bg-teal-600 relative after:content-[""] after:absolute after:w-1.5 after:h-1.5 after:bg-white after:rounded-full' : 
                    'border-slate-300'
                  }`}>
                    {isPast && <Check className="w-2.5 h-2.5 text-teal-600 absolute" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Personal Details */}
        {currentStep === 0 && (
          <div className="p-6 sm:p-10">
            {formError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>{formError}</span>
                <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Basic Info</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input type="text" placeholder="Enter Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Mobile No. <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Mobile No." value={mobileNo} onChange={e => setMobileNo(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Id</label>
                  <input type="email" placeholder="Enter Email Id" value={email} onChange={e => setEmail(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4 py-2.5">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="gender" checked={gender === 'Male'} onChange={() => setGender('Male')} /> Male</label>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="gender" checked={gender === 'Female'} onChange={() => setGender('Female')} /> Female</label>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="gender" checked={gender === 'Others'} onChange={() => setGender('Others')} /> Others</label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Parents Type <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4 py-2.5">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Mother'} onChange={() => setParentType('Mother')} /> Mother</label>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Father'} onChange={() => setParentType('Father')} /> Father</label>
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer"><input type="radio" name="parentType" checked={parentType === 'Guardian'} onChange={() => setParentType('Guardian')} /> Guardian</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-2xl bg-teal-50/50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center text-teal-600 mb-4 hover:bg-teal-50 cursor-pointer">
                  <Camera className="w-8 h-8 mb-2" />
                </div>
                <button type="button" className="w-40 py-2 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50">Upload Photo</button>
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Login/Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">User Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter User Name" value={userName} onChange={e => setUserName(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/institute/parents" className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Cancel</Link>
              <button type="button" onClick={handleNextStep0} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Qualification Details */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Qualification Details <span className="text-slate-400 lowercase font-medium tracking-normal">(Last Qualification)</span></h2>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-10">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">Qualification</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">College Name</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0">
                    <td className="p-4">
                      <input type="text" placeholder="Graduation / Post Graduation" value={qualification} onChange={e => setQualification(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                    </td>
                    <td className="p-4">
                      <input type="text" placeholder="College / University Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <input type="text" placeholder="Certificate file name" className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                        <Paperclip className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => setCurrentStep(0)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Back</button>
              <button type="button" onClick={handleNextStep1} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Employment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Employment Type <span className="text-red-500">*</span></label>
                <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold">
                  <option value="Government Job">Government Job</option>
                  <option value="Private Job">Private Job</option>
                  <option value="Business">Business</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Company/Business Name</label>
                <input type="text" placeholder="Enter Company/Business Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Company Address</label>
                <input type="text" placeholder="Enter Company Address" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Designation</label>
                <input type="text" placeholder="Enter Designation" value={designation} onChange={e => setDesignation(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Annual Income</label>
                <input type="text" placeholder="Enter Annual Income" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => setCurrentStep(1)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Back</button>
              <button type="button" onClick={handleNextStep2} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Address Details */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-10">
            {formError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>{formError}</span>
                <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            )}

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Address Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full address" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-semibold"></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                <select 
                  value={stateName} 
                  onChange={e => {
                    const selected = e.target.value
                    setStateName(selected)
                    const foundState = statesData.find((s: any) => (s.state_name || s.name)?.toLowerCase() === selected.toLowerCase())
                    if (foundState && foundState.districts && foundState.districts.length > 0) {
                      const firstDist = typeof foundState.districts[0] === 'string' ? foundState.districts[0] : (foundState.districts[0].district_name || foundState.districts[0].name)
                      setDistrict(firstDist || '')
                    } else {
                      const fallback = INDIA_STATES_DISTRICTS.find(s => s.state.toLowerCase() === selected.toLowerCase())
                      setDistrict(fallback?.districts?.[0] || '')
                    }
                  }} 
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="">Select State</option>
                  {stateOptions.map((st, idx) => (
                    <option key={idx} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">District <span className="text-red-500">*</span></label>
                <select 
                  value={district} 
                  onChange={e => setDistrict(e.target.value)} 
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="">Select District</option>
                  {districtOptions.map((dist, idx) => (
                    <option key={idx} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Pincode</label>
                <input type="text" placeholder="Enter Pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Aadhar & Signature</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Aadhar No.</label>
                <input type="text" placeholder="Enter Aadhar No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Attach Aadhar</label>
                <div className="relative">
                  <input type="text" placeholder="Upload Aadhar Photo" className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
                  <Paperclip className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => setCurrentStep(2)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Back</button>
              <button type="button" onClick={handleNextStep3} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Final Preview */}
        {currentStep === 4 && (
          <div className="p-6 bg-slate-50/50">
            <div className="flex justify-end mb-4">
              <button type="button" onClick={() => window.print()} className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 shadow-sm"><Printer className="w-4 h-4"/></button>
            </div>

            <div className="space-y-6">
              
              {/* Basic Info & Login Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                    <h3 className="text-sm font-black text-slate-800">Basic Info</h3>
                    <button type="button" onClick={() => setCurrentStep(0)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName || 'Parent')}`} className="w-32 h-32 rounded-xl border border-slate-200 object-cover bg-slate-50" />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center border-2 border-white"><Camera className="w-4 h-4"/></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-800 mb-1">{firstName} {lastName}</h4>
                      <p className="text-xs font-semibold text-slate-500 mb-6">{gender} ({parentType})</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-800">Mobile No.</span>
                          <span className="text-xs text-slate-600">{mobileNo}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-800">Email ID</span>
                          <span className="text-xs text-slate-600">{email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                    <h3 className="text-sm font-black text-slate-800">Login & Account Details</h3>
                    <button type="button" onClick={() => setCurrentStep(0)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-800">User Name</label>
                      <input type="text" value={userName} readOnly className="px-4 py-2 rounded border border-slate-200 text-sm bg-slate-50 text-slate-700 outline-none font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-800">Password</label>
                      <div className="relative">
                        <input type="password" value={password} readOnly className="w-full px-4 py-2 rounded border border-slate-200 text-sm bg-slate-50 text-slate-700 outline-none font-semibold" />
                        <EyeOff className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aadhar, Address, Employment Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Aadhar Details</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Aadhar Card No.</span>
                      <span className="text-xs text-slate-600">{aadharNo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Address Details</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Address</span>
                      <span className="text-xs text-slate-600 text-right">{address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Pincode</span>
                      <span className="text-xs text-slate-600">{pincode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">District</span>
                      <span className="text-xs text-slate-600">{district || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">State</span>
                      <span className="text-xs text-slate-600">{stateName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Employment Details</h3>
                    <button type="button" onClick={() => setCurrentStep(2)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Company/Business</span>
                      <span className="text-xs text-slate-600 text-right">{companyName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Designation</span>
                      <span className="text-xs text-slate-600">{designation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Annual Income</span>
                      <span className="text-xs text-slate-600">{annualIncome || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualification Row */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                  <h3 className="text-sm font-black text-slate-800">Qualification Details</h3>
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                    <FileEdit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-center">
                    <thead className="bg-slate-50 text-xs font-black text-slate-600">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Qualification</th>
                        <th className="px-4 py-3 border-b border-slate-200">College Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border-r border-slate-200">
                           <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">{qualification || 'N/A'}</div>
                        </td>
                        <td className="p-4 border-r border-slate-200">
                           <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">{collegeName || 'N/A'}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button type="button" onClick={() => setCurrentStep(3)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors bg-white">Back</button>
              <button type="button" onClick={handleFinalSubmit} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Final Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
