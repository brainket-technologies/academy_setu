'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Camera, Paperclip, Eye, EyeOff, Check, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'


const STATES = ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Delhi', 'Maharashtra', 'Bihar', 'Haryana', 'Rajasthan', 'Gujarat', 'Karnataka']
const DISTRICTS: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Agra', 'Noida', 'Prayagraj'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur'],
  'Haryana': ['Gurugram', 'Faridabad', 'Hisar', 'Rohtak'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
}

const STEPS = ['Personal Details', 'Address Details', 'Agreement & Commission', 'Account Details']

export default function CreateDistributorPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 1: Personal Details
  const [distId, setDistId] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [name, setName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [emailId, setEmailId] = useState('')
  const [gender, setGender] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2: Address Details
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [pincode, setPincode] = useState('')
  const [aadharNo, setAadharNo] = useState('')
  const [aadharFile, setAadharFile] = useState('')
  const [signatureFile, setSignatureFile] = useState('')

  // Step 3: Agreement & Commission
  const [agreementDoc, setAgreementDoc] = useState('')
  const [commissionIn, setCommissionIn] = useState('')
  const [typeValue, setTypeValue] = useState('')
  const [commissionType, setCommissionType] = useState('')
  const [assignArea, setAssignArea] = useState('')

  // Step 4: Account Details
  const [accountHolderName, setAccountHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [bankName, setBankName] = useState('')
  const [panNo, setPanNo] = useState('')
  const [upiId, setUpiId] = useState('')
  const [qrCode, setQrCode] = useState('')

  const validateStep1 = () => {
    if (!distId.trim()) { toast.error('ID No. is required'); return false }
    if (!joiningDate) { toast.error('Joining Date is required'); return false }
    if (!name.trim()) { toast.error('Name is required'); return false }
    if (!mobileNo.trim()) { toast.error('Mobile No. is required'); return false }
    if (!gender) { toast.error('Gender is required'); return false }
    if (!username.trim()) { toast.error('User Name is required'); return false }
    if (!password.trim()) { toast.error('Password is required'); return false }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!address.trim()) { toast.error('Address is required'); return false }
    if (!state) { toast.error('State is required'); return false }
    if (!district) { toast.error('District is required'); return false }
    if (!pincode.trim()) { toast.error('Pincode is required'); return false }
    if (!aadharNo.trim()) { toast.error('Aadhar No. is required'); return false }
    return true
  }

  const validateStep3 = () => {
    if (!commissionIn) { toast.error('Commission In is required'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return
    if (step === 1 && !validateStep2()) return
    if (step === 2 && !validateStep3()) return
    setStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dist_id: distId, joining_date: joiningDate, name, mobile_no: mobileNo,
          email: emailId, gender, username,
          address, state, district, pincode, aadhar_no: aadharNo,
          commission_in: commissionIn, commission_value: typeValue, commission_type: commissionType, assign_area: assignArea,
          account_holder_name: accountHolderName, account_number: accountNumber, ifsc_code: ifscCode, bank_name: bankName
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Distributor created successfully!')
        router.push('/admin/distributors')
      } else {
        toast.error(data.error || 'Failed to create distributor')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
  const selectCls = "w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 cursor-pointer"
  const labelCls = "block text-xs font-bold text-slate-650 dark:text-slate-400 mb-1.5"

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Create Distributers</h1>
        </div>

        {/* Step Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Step Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-700">
            {STEPS.map((label, idx) => (
              <button
                key={idx}
                onClick={() => idx < step && setStep(idx)}
                className={`py-3.5 px-2 text-xs font-bold text-center transition-all border-r last:border-r-0 border-slate-100 dark:border-slate-700 cursor-default ${
                  idx === step
                    ? 'bg-[#0F9E8F] text-white'
                    : idx < step
                    ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Step Dots Progress */}
          <div className="flex items-center justify-between px-16 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
            {STEPS.map((_, idx) => (
              <React.Fragment key={idx}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold flex-shrink-0 ${
                  idx < step
                    ? 'bg-[#0F9E8F] border-[#0F9E8F] text-white'
                    : idx === step
                    ? 'bg-[#0F9E8F] border-[#0F9E8F] text-white'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-500 text-slate-400'
                }`}>
                  {idx < step ? <Check className="w-3.5 h-3.5" /> : <span className="w-2.5 h-2.5 rounded-full bg-current" />}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${idx < step ? 'bg-[#0F9E8F]' : 'bg-slate-200 dark:bg-slate-600'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="p-8">
            {/* ─── STEP 1: Personal Details ─── */}
            {step === 0 && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Personal Details</h2>
                  <div className="grid grid-cols-3 gap-5 items-start">
                    {/* Left: ID No + Name + Email */}
                    <div className="col-span-2 grid grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>ID No.<span className="text-red-500 ml-0.5">*</span></label>
                        <input type="text" placeholder="Enter ID No." value={distId} onChange={e => setDistId(e.target.value)} className={inputCls} />
                      </div>
                      <div className="relative">
                        <label className={labelCls}>Joining Date<span className="text-red-500 ml-0.5">*</span></label>
                        <div className="relative">
                          <input type="date" placeholder="DD-MM-YYYY" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className={inputCls + ' pr-10'} />
                          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Name<span className="text-red-500 ml-0.5">*</span></label>
                        <input type="text" placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Mobile No.<span className="text-red-500 ml-0.5">*</span></label>
                        <input type="tel" placeholder="Enter Mobile No." value={mobileNo} onChange={e => setMobileNo(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Email Id</label>
                        <input type="email" placeholder="Enter Email ID" value={emailId} onChange={e => setEmailId(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Gender<span className="text-red-500 ml-0.5">*</span></label>
                        <div className="flex items-center gap-5 pt-2.5">
                          {['Male', 'Female', 'Others'].map(g => (
                            <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300 font-medium">
                              <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={gender === g}
                                onChange={() => setGender(g)}
                                className="accent-teal-600 w-4 h-4"
                              />
                              {g}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Photo Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full h-36 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600">
                        <Camera className="w-10 h-10 text-[#0F9E8F]" />
                      </div>
                      <button type="button" className="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login/Account Details */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Login/Account Details</h2>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>User Name<span className="text-red-500 ml-0.5">*</span></label>
                      <input type="text" placeholder="Enter User Name" value={username} onChange={e => setUsername(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Password<span className="text-red-500 ml-0.5">*</span></label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls + ' pr-10'} />
                        <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Confirm Password<span className="text-red-500 ml-0.5">*</span></label>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls + ' pr-10'} />
                        <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Address Details ─── */}
            {step === 1 && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Address Details</h2>
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className={labelCls}>Address<span className="text-red-500 ml-0.5">*</span></label>
                      <input type="text" placeholder="Enter Address" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <div>
                        <label className={labelCls}>State<span className="text-red-500 ml-0.5">*</span></label>
                        <select value={state} onChange={e => { setState(e.target.value); setDistrict('') }} className={selectCls}>
                          <option value="">Select State</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>District<span className="text-red-500 ml-0.5">*</span></label>
                        <select value={district} onChange={e => setDistrict(e.target.value)} className={selectCls} disabled={!state}>
                          <option value="">Select District</option>
                          {(DISTRICTS[state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Pincode<span className="text-red-500 ml-0.5">*</span></label>
                        <input type="text" placeholder="Enter Pincode" value={pincode} onChange={e => setPincode(e.target.value)} className={inputCls} maxLength={6} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aadhar & Signature */}
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Aadhar &amp; Signature</h2>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Aadhar No.<span className="text-red-500 ml-0.5">*</span></label>
                      <input type="text" placeholder="Enter Aadhar No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} className={inputCls} maxLength={12} />
                    </div>
                    <div>
                      <label className={labelCls}>Attach Aadhar</label>
                      <div className="relative">
                        <input type="text" readOnly placeholder="Upload Aadhar Photo" value={aadharFile} className={inputCls + ' pr-10 cursor-pointer'} onClick={() => toast.info('File upload not connected in demo')} />
                        <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Attach Signature</label>
                      <div className="relative">
                        <input type="text" readOnly placeholder="Upload Signature Photo" value={signatureFile} className={inputCls + ' pr-10 cursor-pointer'} onClick={() => toast.info('File upload not connected in demo')} />
                        <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Agreement & Commission ─── */}
            {step === 2 && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Agreement Details</h2>
                  <div className="flex items-end gap-4 max-w-sm">
                    <div className="flex-1">
                      <label className={labelCls}>Agreement Document</label>
                      <div className="relative">
                        <input type="text" readOnly placeholder="Upload Document" value={agreementDoc} className={inputCls + ' pr-10 cursor-pointer'} onClick={() => toast.info('File upload not connected in demo')} />
                        <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                      </div>
                    </div>
                    <button type="button" className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0">
                      Attach
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Commission Details</h2>
                  <div className="grid grid-cols-3 gap-5 items-start">
                    <div>
                      <label className={labelCls}>Commission in<span className="text-red-500 ml-0.5">*</span></label>
                      <select value={commissionIn} onChange={e => setCommissionIn(e.target.value)} className={selectCls}>
                        <option value="">Select an Option</option>
                        <option value="Amount">Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Type Value</label>
                      <input type="number" placeholder="Enter Amount" value={typeValue} onChange={e => setTypeValue(e.target.value)} className={inputCls} min="0" />
                    </div>
                    <div>
                      <label className={labelCls}>Commission Type</label>
                      <div className="flex items-center gap-6 pt-2.5">
                        {['Regular', 'One Time'].map(ct => (
                          <label key={ct} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <input
                              type="radio"
                              name="commissionType"
                              value={ct}
                              checked={commissionType === ct}
                              onChange={() => setCommissionType(ct)}
                              className="accent-teal-600 w-4 h-4"
                            />
                            {ct}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className={labelCls}>Assign Area</label>
                    <input type="text" placeholder="Enter Area" value={assignArea} onChange={e => setAssignArea(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 4: Account Details ─── */}
            {step === 3 && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Bank Details</h2>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Account Holder Name</label>
                      <input type="text" placeholder="Enter Account Holder Name" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Bank Account No.</label>
                      <input type="text" placeholder="Enter Bank Account No." value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>IFSC Code</label>
                      <input type="text" placeholder="Enter IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Bank Name</label>
                      <input type="text" placeholder="Enter Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>PAN No.</label>
                      <input type="text" placeholder="Enter PAN No." value={panNo} onChange={e => setPanNo(e.target.value.toUpperCase())} className={inputCls} maxLength={10} />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-5">Online Payment Details</h2>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>UPI ID</label>
                      <input type="text" placeholder="Enter UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>QR Code</label>
                      <div className="relative">
                        <input type="text" readOnly placeholder="Upload QR" value={qrCode} className={inputCls + ' pr-10 cursor-pointer'} onClick={() => toast.info('QR upload not connected in demo')} />
                        <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex items-center gap-3 mt-10 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(p => p - 1)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => router.push('/admin/distributors')}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                  >
                    Save &amp; Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-8 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Final Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
