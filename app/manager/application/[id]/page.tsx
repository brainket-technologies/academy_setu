'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, Eye, ArrowLeft, Loader2, Percent, Check, Building, CreditCard, Smartphone, QrCode, Wallet, ShieldCheck, Tag, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { SearchableDropdown } from '@/components/ui/SearchableDropdown'

interface ApplicationDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ManagerApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const id = unwrappedParams.id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fields state
  const [applicationNo, setApplicationNo] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [affiliatedTo, setAffiliatedTo] = useState('')
  const [affiliationCode, setAffiliationCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [emailId, setEmailId] = useState('')
  const [address, setAddress] = useState('')
  const [stateName, setStateName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [pincode, setPincode] = useState('')
  
  const [principalName, setPrincipalName] = useState('')
  const [principalGender, setPrincipalGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [principalSign, setPrincipalSign] = useState('')
  const [principalPhoto, setPrincipalPhoto] = useState<string | null>(null)

  const [directorName, setDirectorName] = useState('')
  const [directorGender, setDirectorGender] = useState<'Male' | 'Female' | 'Others'>('Male')
  const [directorSign, setDirectorSign] = useState('')
  const [directorPhoto, setDirectorPhoto] = useState<string | null>(null)

  const [status, setStatus] = useState<'Applied' | 'Pending' | 'Paid' | 'Unpaid' | 'Active' | 'Inactive' | string>('Applied')
  const [enquiryStatus, setEnquiryStatus] = useState<string>('Applied')
  const [plan, setPlan] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [paymentMode, setPaymentMode] = useState('Payment Gateway')
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFilename, setScreenshotFilename] = useState('')
  const [screenshotDataUrl, setScreenshotDataUrl] = useState('')
  const [plans, setPlans] = useState<any[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [statesData, setStatesData] = useState<any[]>([])

  const PAYMENT_METHOD_OPTIONS = [
    { id: 'Payment Gateway', label: 'Payment Gateway', sub: 'Cards / Netbanking / UPI', icon: CreditCard },
    { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'Direct NEFT / IMPS', icon: Building },
    { id: 'UPI ID', label: 'UPI ID', sub: 'Instant VPA Transfer', icon: Smartphone },
    { id: 'QR Code', label: 'QR Code', sub: 'Scan & Pay via QR', icon: QrCode },
    { id: 'Cash', label: 'Cash / Cheque', sub: 'Offline Payment', icon: Wallet },
  ]

  useEffect(() => {
    fetch('/api/admin/settings/state-city')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatesData(data.data)
        }
      })
      .catch(err => console.error('Failed to load states/cities', err))
  }, [])

  const allStatesList = React.useMemo(() => {
    return statesData
      .map((s: any) => s.state_name)
      .filter(Boolean)
      .sort((a: string, b: string) => a.localeCompare(b))
  }, [statesData])

  const getDistrictsForState = (stName: string): string[] => {
    if (!stName) {
      const allDistricts = new Set<string>()
      statesData.forEach((s: any) => (s.districts || []).forEach((d: string) => allDistricts.add(d)))
      return Array.from(allDistricts).sort((a, b) => a.localeCompare(b))
    }
    const stateObj = statesData.find((s: any) => s.state_name?.toLowerCase() === stName.toLowerCase())
    return (stateObj?.districts || []).slice().sort((a: string, b: string) => a.localeCompare(b))
  }

  const handleStateChange = (stateVal: string) => {
    setStateName(stateVal)
    setDistrictName('')
  }

  useEffect(() => {
    const fetchPlansAndPromo = async () => {
      try {
        const [planRes, promoRes] = await Promise.all([
          fetch('/api/admin/plan?pageSize=100'),
          fetch('/api/admin/promo-code?pageSize=100')
        ])
        const planData = await planRes.json()
        const promoData = await promoRes.json()
        if (planData.success) setPlans(planData.data)
        if (promoData.success) setPromoCodes(promoData.data)
      } catch (err) {
        console.error('Failed to load plans or promo codes', err)
      }
    }
    fetchPlansAndPromo()
  }, [])

  // Load application details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/application/${id}`)
        const resData = await response.json()
        if (resData.success) {
          const app = resData.data
          setApplicationNo(app.application_no || '')
          setSchoolName(app.school_name || '')
          setSchoolCode(app.school_code || '')
          setAffiliatedTo(app.affiliated_to || '')
          setAffiliationCode(app.affiliation_code || '')
          setContactPerson(app.contact_person || '')
          setMobileNo(app.mobile_no || '')
          setEmailId(app.email_id || '')
          setAddress(app.address || '')
          setStateName(app.state || '')
          setDistrictName(app.district || '')
          setPincode(app.pincode || '')
          setPrincipalName(app.principal_name || '')
          setPrincipalGender(app.principal_gender || 'Male')
          setPrincipalSign(app.principal_sign || '')
          setPrincipalPhoto(app.principal_photo || null)
          setDirectorName(app.director_name || '')
          setDirectorGender(app.director_gender || 'Male')
          setDirectorSign(app.director_sign || '')
          setDirectorPhoto(app.director_photo || null)
          setStatus(app.status || 'Applied')
          setEnquiryStatus(app.enquiry_status || 'Applied')
          setPlan(app.plan_id || '')
          setPromoCode(app.promo_code || '')
          setPaymentMode(app.payment_mode || 'Payment Gateway')
        } else {
          toast.error('Failed to load application details')
        }
      } catch (error) {
        console.error('Fetch detail error:', error)
        toast.error('Something went wrong loading details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDetails()
    }
  }, [id])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'principal' | 'director') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (target === 'principal') {
        setPrincipalPhoto(reader.result as string)
      } else {
        setDirectorPhoto(reader.result as string)
      }
      toast.success('Photo uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const handleSignUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'principal' | 'director') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (target === 'principal') {
        setPrincipalSign(reader.result as string)
      } else {
        setDirectorSign(reader.result as string)
      }
      toast.success('Signature uploaded successfully')
    }
    reader.readAsDataURL(file)
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolName.trim()) { toast.error('School Name is required'); return; }
    if (!contactPerson.trim()) { toast.error('Contact Person is required'); return; }
    if (!mobileNo.trim()) { toast.error('Mobile Number is required'); return; }

    const selectedPlanObj = plans.find(p => p.id === plan || p.plan_name === plan)
    let basePrice = 0
    if (selectedPlanObj) {
      const itemsSum = (selectedPlanObj.first_billing_items || []).reduce((sum: number, item: any) => {
        const itemTotal = Number(item.tax_price) > 0 
          ? Number(item.tax_price) 
          : (Number(item.price || 0) + (Number(item.price || 0) * Number(item.tax_percentage || 0) / 100))
        return sum + itemTotal
      }, 0)
      basePrice = itemsSum > 0 ? itemsSum : Number((selectedPlanObj as any).price || 0)
    }

    const promoObj = promoCodes.find(pc => pc.code === promoCode)
    let discountAmount = 0
    if (basePrice > 0) {
      if (promoObj) {
        const val = Number(promoObj.discount_value || 0)
        if (promoObj.discount_type === 'Fixed' || promoObj.discount_type === 'Amount') {
          discountAmount = Math.min(val, basePrice)
        } else {
          discountAmount = (basePrice * val) / 100
        }
      } else if (promoCode) {
        discountAmount = 500
      }
    }
    const finalNet = plan ? Math.max(0, basePrice - discountAmount) : null

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/application/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_name: schoolName.trim(),
          school_code: schoolCode.trim(),
          affiliated_to: affiliatedTo.trim(),
          affiliation_code: affiliationCode.trim(),
          contact_person: contactPerson.trim(),
          mobile_no: mobileNo.trim(),
          email_id: emailId.trim(),
          address: address.trim(),
          state: stateName.trim(),
          district: districtName.trim(),
          pincode: pincode.trim(),
          principal_name: principalName.trim(),
          principal_gender: principalGender,
          principal_sign: principalSign.trim(),
          principal_photo: principalPhoto,
          director_name: directorName.trim(),
          director_gender: directorGender,
          director_sign: directorSign.trim(),
          director_photo: directorPhoto,
          status,
          enquiry_status: enquiryStatus,
          plan,
          promo_code: promoCode,
          amount: finalNet,
          payment_mode: paymentMode,
          transaction_id: transactionId,
          screenshot_url: screenshotDataUrl
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success(resData.message || 'Application updated successfully!')
        router.push('/manager/application')
      } else {
        toast.error(resData.error || 'Failed to update application.')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Price calculations
  const selectedPlanObj = plans.find(p => p.id === plan || p.plan_name === plan)
  let basePrice = 0
  if (selectedPlanObj) {
    const itemsSum = (selectedPlanObj.first_billing_items || []).reduce((sum: number, item: any) => {
      const itemTotal = Number(item.tax_price) > 0 
        ? Number(item.tax_price) 
        : (Number(item.price || 0) + (Number(item.price || 0) * Number(item.tax_percentage || 0) / 100))
      return sum + itemTotal
    }, 0)
    basePrice = itemsSum > 0 ? itemsSum : Number((selectedPlanObj as any).price || 0)
  }

  const promoObj = promoCodes.find(pc => pc.code === promoCode)
  let discountAmount = 0
  if (basePrice > 0) {
    if (promoObj) {
      const val = Number(promoObj.discount_value || 0)
      if (promoObj.discount_type === 'Fixed' || promoObj.discount_type === 'Amount') {
        discountAmount = Math.min(val, basePrice)
      } else {
        discountAmount = (basePrice * val) / 100
      }
    } else if (promoCode) {
      discountAmount = 500
    }
  }
  const finalNet = plan ? Math.max(0, basePrice - discountAmount) : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm font-semibold text-slate-400">Loading application details...</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-16">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/manager/application')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Application: <span className="text-blue-600">{applicationNo || `#${id.slice(0, 8)}`}</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Edit school information, authorities, plan & payment status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/manager/application')}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Main Content Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* 1. School Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">1</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">School & Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                  placeholder="Enter School Name"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Code</label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  placeholder="Enter School Code"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Affiliated To</label>
                <input
                  type="text"
                  value={affiliatedTo}
                  onChange={(e) => setAffiliatedTo(e.target.value)}
                  placeholder="CBSE, ICSE, State Board"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Affiliation Code</label>
                <input
                  type="text"
                  value={affiliationCode}
                  onChange={(e) => setAffiliationCode(e.target.value)}
                  placeholder="Enter Affiliation Code"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Person <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                  placeholder="Enter Contact Person"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No. <span className="text-red-500">*</span></label>
                <div className="flex">
                  <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-200 dark:border-slate-600 rounded-l-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="text"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    required
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email ID</label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="school@example.com"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                <SearchableDropdown
                  options={allStatesList}
                  value={stateName}
                  onChange={handleStateChange}
                  placeholder="Select State"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                <SearchableDropdown
                  options={getDistrictsForState(stateName)}
                  value={districtName}
                  onChange={(val) => setDistrictName(val)}
                  placeholder="Select District"
                  disabled={!stateName}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit Pincode"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete Address"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

            </div>
          </div>

          {/* 2. Principal & Director Details Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Principal & Director Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Principal Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Principal Details</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Principal Name</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="Enter Principal Name"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</label>
                  <div className="flex gap-4 pt-1">
                    {(['Male', 'Female', 'Others'] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="principal_gender"
                          value={g}
                          checked={principalGender === g}
                          onChange={(e) => setPrincipalGender(e.target.value as any)}
                          className="w-4 h-4 text-blue-600 border-slate-300"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500">Principal Photo</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                      {principalPhoto ? (
                        <img src={principalPhoto} alt="Principal" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <label className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'principal')} className="hidden" />
                    </label>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500">Principal Sign</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                      {principalSign ? (
                        <img src={principalSign} alt="Principal Sign" className="w-full h-full object-contain" />
                      ) : (
                        <Paperclip className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <label className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleSignUpload(e, 'principal')} className="hidden" />
                    </label>
                  </div>
                </div>

              </div>

              {/* Director Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Director Details</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Director Name</label>
                  <input
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    placeholder="Enter Director Name"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</label>
                  <div className="flex gap-4 pt-1">
                    {(['Male', 'Female', 'Others'] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="director_gender"
                          value={g}
                          checked={directorGender === g}
                          onChange={(e) => setDirectorGender(e.target.value as any)}
                          className="w-4 h-4 text-blue-600 border-slate-300"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500">Director Photo</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                      {directorPhoto ? (
                        <img src={directorPhoto} alt="Director" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <label className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'director')} className="hidden" />
                    </label>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500">Director Sign</span>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                      {directorSign ? (
                        <img src={directorSign} alt="Director Sign" className="w-full h-full object-contain" />
                      ) : (
                        <Paperclip className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <label className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleSignUpload(e, 'director')} className="hidden" />
                    </label>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* 3. Plan, Pricing & Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">3</span>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Status, Plan & Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Application Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Application Status <span className="text-red-500">*</span></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Active">Active (Institute)</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="text-[10px] text-slate-400">Setting status to Paid/Active will register the institute record.</span>
              </div>

              {/* Plan Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.plan_name}</option>
                  ))}
                </select>
              </div>

              {/* Promo Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Promo Code</label>
                <select
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">Select Promo Code</option>
                  {promoCodes.map((pc) => (
                    <option key={pc.id} value={pc.code}>{pc.code} ({pc.discount_value}{pc.discount_type === 'Percentage' ? '%' : ' OFF'})</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Price Preview Card */}
            {plan && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-slate-700/40 border border-blue-100 dark:border-slate-600 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Base Price</span>
                    <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">₹{basePrice.toLocaleString('en-IN')}</p>
                  </div>
                  {discountAmount > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Discount</span>
                      <p className="text-base font-extrabold text-emerald-600">-₹{discountAmount.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 tracking-wider">Final Payable Amount</span>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300">₹{finalNet.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Payment Mode Selector */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Payment Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {PAYMENT_METHOD_OPTIONS.map((pm) => {
                  const Icon = pm.icon
                  const isSelected = paymentMode === pm.id
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMode(pm.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight">{pm.label}</span>
                      <span className="text-[10px] opacity-70 leading-none">{pm.sub}</span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/manager/application')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </form>

      </div>
    </>
  )
}
