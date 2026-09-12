'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, Eye, ArrowLeft, Loader2, Percent, Check, Building, CreditCard, Smartphone, QrCode, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { SearchableDropdown } from '@/components/ui/SearchableDropdown'

interface ApplicationDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function BdmApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
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
          plan_id: plan || null,
          promo_code: promoCode,
          payment_mode: paymentMode || 'Payment Gateway',
          amount: finalNet,
          transaction_id: transactionId,
          screenshot_filename: screenshotFilename,
          screenshot_data_url: screenshotDataUrl
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success('Application details updated successfully!')
        router.push('/bdm/application')
      } else {
        toast.error(resData.error || 'Failed to update details')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Something went wrong saving details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/bdm/application')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Application Details...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Title Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Back to Applications"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Application Details</h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{applicationNo}</p>
          </div>
        </div>
        <button 
          onClick={handleCancel}
          className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-8">
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* Section 1: Personal Details */}
          <div>
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">School & Contact Information</h3>
            </div>

            <div className="flex flex-col gap-5">
              {/* School Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  required
                />
              </div>

              {/* Code grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">School Code</label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Affiliated To</label>
                  <input
                    type="text"
                    value={affiliatedTo}
                    onChange={(e) => setAffiliatedTo(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Affiliation Code</label>
                  <input
                    type="text"
                    value={affiliationCode}
                    onChange={(e) => setAffiliationCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              {/* Contact grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mobile No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email ID</label>
                  <input
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                />
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SearchableDropdown
                  label="State"
                  placeholder="Select State"
                  searchPlaceholder="Search State..."
                  options={allStatesList}
                  value={stateName}
                  onChange={(val) => handleStateChange(val)}
                />
                <SearchableDropdown
                  label="District"
                  placeholder="Select District"
                  searchPlaceholder="Search District..."
                  options={getDistrictsForState(stateName)}
                  value={districtName}
                  onChange={(val) => setDistrictName(val)}
                  disabled={!stateName}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                  />
                </div>
              </div>

              {/* Professional Signatures / Photo blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                 
                {/* Principal Details Panel */}
                <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Principal Name</label>
                      <input
                        type="text"
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</span>
                      <div className="flex gap-4 mt-1">
                        {['Male', 'Female', 'Others'].map(g => (
                          <label key={g} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input 
                              type="radio" 
                              name="principal_gender" 
                              value={g}
                              checked={principalGender === g}
                              onChange={() => setPrincipalGender(g as any)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Principal Sign.</label>
                      <div className="h-16 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden shadow-inner group">
                        {principalSign ? (
                          <>
                            <img src={principalSign} alt="Principal Signature" className="h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setPrincipalSign('')}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                              title="Remove Signature"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                        Upload Signature
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSignUpload(e, 'principal')}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Principal Photo Card */}
                  <div className="w-32 flex flex-col gap-2 shrink-0">
                    <div className="h-32 bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
                      {principalPhoto ? (
                        <>
                          <img src={principalPhoto} alt="Principal" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPrincipalPhoto(null)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Camera className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'principal')}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Director Details Panel */}
                <div className="bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Director Name</label>
                      <input
                        type="text"
                        value={directorName}
                        onChange={(e) => setDirectorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</span>
                      <div className="flex gap-4 mt-1">
                        {['Male', 'Female', 'Others'].map(g => (
                          <label key={g} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input 
                              type="radio" 
                              name="director_gender" 
                              value={g}
                              checked={directorGender === g}
                              onChange={() => setDirectorGender(g as any)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Director Sign.</label>
                      <div className="h-16 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden shadow-inner group">
                        {directorSign ? (
                          <>
                            <img src={directorSign} alt="Director Signature" className="h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setDirectorSign('')}
                              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                              title="Remove Signature"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                        Upload Signature
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSignUpload(e, 'director')}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Director Photo Card */}
                  <div className="w-32 flex flex-col gap-2 shrink-0">
                    <div className="h-32 bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
                      {directorPhoto ? (
                        <>
                          <img src={directorPhoto} alt="Director" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setDirectorPhoto(null)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Camera className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="w-full py-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center transition-colors cursor-pointer block shadow-sm">
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'director')}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Section 2: Status */}
          <div>
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Status & Plan Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value as any
                    setStatus(val)
                    if (val === 'Pending') {
                      setEnquiryStatus('Payment Pending')
                    }
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer font-medium"
                >
                  <option value="Applied">Applied</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Enquiry Status Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enquiry Status</label>
                <select
                  value={enquiryStatus}
                  onChange={(e) => setEnquiryStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer font-medium"
                >
                  <option value="Applied">Applied</option>
                  <option value="In Review">In Review</option>
                  <option value="Verification Completed">Verification Completed</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Successfully Onboarded">Successfully Onboarded</option>
                </select>
              </div>
            </div>

            {/* Plan and Promo Code Section */}
            <div className="flex flex-col gap-5 mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
              
              {/* 1. Plan Selection Dropdown & Plan Card Preview */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer font-medium"
                >
                  <option value="">Select Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plan_name} ({p.segment || 'General'})
                    </option>
                  ))}
                </select>

                {/* Selected Plan Details Card */}
                {(() => {
                  const selectedPlanObj = plans.find(p => p.id === plan || p.plan_name === plan)
                  if (!selectedPlanObj) return null
                  
                  const itemsSum = (selectedPlanObj.first_billing_items || []).reduce((sum: number, item: any) => {
                    const itemTotal = Number(item.tax_price) > 0 
                      ? Number(item.tax_price) 
                      : (Number(item.price || 0) + (Number(item.price || 0) * Number(item.tax_percentage || 0) / 100))
                    return sum + itemTotal
                  }, 0)
                  const price = itemsSum > 0 ? itemsSum : Number((selectedPlanObj as any).price || 0)
                  const duration = selectedPlanObj.first_billing_duration || 365
                  
                  const pad = (n: number) => String(n).padStart(2, '0')
                  const from = new Date()
                  const to = new Date()
                  to.setDate(from.getDate() + duration)
                  const validFromStr = `${pad(from.getDate())}/${pad(from.getMonth() + 1)}/${from.getFullYear()}`
                  const validToStr = `${pad(to.getDate())}/${pad(to.getMonth() + 1)}/${to.getFullYear()}`

                  return (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm overflow-hidden mt-1">
                      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 px-4 text-white flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">PURCHASING PLAN FOR</p>
                          <h2 className="text-sm font-black leading-tight">{schoolName || 'Applicant School'}</h2>
                        </div>
                        {selectedPlanObj.segment && (
                          <span className="px-2 py-0.5 bg-white/20 text-white border border-white/30 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
                            {selectedPlanObj.segment}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/30 dark:bg-slate-700/30">
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedPlanObj.plan_name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                              Validity: {duration} days
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                              {validFromStr} → {validToStr}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PLAN PRICE</p>
                          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* 2. Interactive Promo Code Pills */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <Percent className="w-3.5 h-3.5 text-indigo-500" /> Promo Code
                </h3>
                
                {promoCodes.length === 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['WELCOME10', 'FESTIVE20', 'FLAT500', 'NEWYEAR', 'SPECIAL'].map(codeStr => (
                      <button
                        key={codeStr}
                        type="button"
                        onClick={() => {
                          if (promoCode === codeStr) {
                            setPromoCode('')
                          } else {
                            setPromoCode(codeStr)
                            toast.success(`Promo code ${codeStr} applied!`)
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          promoCode === codeStr
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <Percent className="w-3 h-3" />
                        {codeStr}
                        {promoCode === codeStr && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {promoCodes.map(pc => {
                      const isApplied = promoCode === pc.code
                      return (
                        <button
                          key={pc.id}
                          type="button"
                          onClick={() => {
                            if (isApplied) {
                              setPromoCode('')
                            } else {
                              setPromoCode(pc.code)
                              toast.success(`Promo code ${pc.code} applied!`)
                            }
                          }}
                          className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                            isApplied
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20'
                              : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                          }`}
                        >
                          <Percent className="w-3 h-3" />
                          {pc.code}
                          {isApplied && (
                            <span className="ml-1 flex items-center justify-center bg-white/20 rounded-full w-3.5 h-3.5 text-[9px]">✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 3. Total Payable Net Summary Card */}
              {(() => {
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

                return (
                  <div className="bg-slate-800 dark:bg-slate-900/90 rounded-2xl p-5 shadow-lg text-white border border-slate-700 mt-2">
                    <div className="flex flex-col gap-2 text-xs font-semibold mb-2">
                      <div className="flex justify-between text-slate-300">
                        <span>Plan Price</span>
                        <span>{basePrice > 0 ? `₹${basePrice.toLocaleString('en-IN')}` : '—'}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount ({promoCode || 'Promo'})</span>
                          <span>− ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-black text-lg border-t border-slate-700 pt-3 mt-1">
                        <span>Total Payable (Net)</span>
                        <span className="text-indigo-400">
                          {finalNet > 0 ? `₹${finalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}

            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-center gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
