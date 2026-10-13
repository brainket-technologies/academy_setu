'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus, Search, Eye, Download, X, Upload, CheckCircle2,
  FileText, ShoppingBag, Cpu, ShieldCheck, Calendar, ArrowRight, RefreshCw,
  Sparkles, Check, AlertTriangle, Layers, Tag, CreditCard, Send, Clock
} from 'lucide-react'

interface AdminDevicePlan {
  id: string
  name: string
  duration_type: string
  duration: number
  amount: string | number
  tax_percent: string | number
  total_amount: string | number
  status: string
  device_type: string
  device_name: string
  device_model?: string
  imei_no?: string
  description?: string
  plan_description?: string
  image_url?: string
  created_at?: string
}

interface DeviceRecord {
  id: string | number
  deviceName: string
  deviceType: string
  deviceModel: string
  brand: string
  simNo: string
  simImei: string
  deviceSrNo: string
  planName: string
  durationDays: number
  amount: number
  taxPercent: number
  totalAmount: number
  paymentMode: string
  transactionId: string
  paymentStatus: string
  status: string
  rechargeStatus?: string
  pendingPlanName?: string
  imageUrl?: string
  validFrom: string
  validTo: string
  expiryDays: number
  createdAt?: string
}

export default function DeviceModulePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'my-devices'>('buy')
  const [view, setView] = useState<'list' | 'details'>('list')
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null)

  // API Data
  const [plans, setPlans] = useState<AdminDevicePlan[]>([])
  const [devicesList, setDevicesList] = useState<DeviceRecord[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogDisplayMode, setCatalogDisplayMode] = useState<'cards' | 'table'>('cards')

  // Buy / Add Device Modal State
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<AdminDevicePlan | null>(null)
  
  // Form fields for Buy / Add modal
  const [formPlanId, setFormPlanId] = useState('')
  const [formDeviceType, setFormDeviceType] = useState('GPS')
  const [formDeviceName, setFormDeviceName] = useState('')
  const [formDeviceModel, setFormDeviceModel] = useState('')
  const [formBrand, setFormBrand] = useState('Academy Setu Tech')
  const [formDeviceSrNo, setFormDeviceSrNo] = useState('')
  const [formSimNo, setFormSimNo] = useState('')
  const [formSimImei, setFormSimImei] = useState('')
  const [formPaymentMode, setFormPaymentMode] = useState('Online / UPI')
  const [formTxnId, setFormTxnId] = useState('')
  const [submittingBuy, setSubmittingBuy] = useState(false)

  // Send Recharge Request Modal State
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false)
  const [rechargeDeviceId, setRechargeDeviceId] = useState('')
  const [rechargePlanId, setRechargePlanId] = useState('')
  const [rechargeTxnId, setRechargeTxnId] = useState('')
  const [rechargePaymentMode, setRechargePaymentMode] = useState('Online / UPI')
  const [rechargeDescription, setRechargeDescription] = useState('')
  const [customDeviceName, setCustomDeviceName] = useState('')
  const [customDeviceType, setCustomDeviceType] = useState('GPS')
  const [customDeviceSrNo, setCustomDeviceSrNo] = useState('')
  const [customSimNo, setCustomSimNo] = useState('')
  const [submittingRecharge, setSubmittingRecharge] = useState(false)

  // Toast State
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Fetch all devices & plans from backend API
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (deviceTypeFilter) params.append('deviceType', deviceTypeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/institute/device?${params.toString()}`)
      const json = await res.json()
      if (json.success && json.data) {
        setPlans(json.data.plans || [])
        setDevicesList(json.data.devices || [])
        if (json.data.deviceTypes?.length) {
          setDeviceTypes(json.data.deviceTypes)
        }
      }
    } catch (err) {
      console.error('Error fetching institute devices:', err)
      triggerToast('Error loading device records')
    } finally {
      setLoading(false)
    }
  }, [deviceTypeFilter, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle opening Buy modal pre-selecting a plan
  const handleInitiateBuy = (plan: AdminDevicePlan) => {
    setSelectedPlanForBuy(plan)
    setFormPlanId(plan.id)
    setFormDeviceType(plan.device_type)
    setFormDeviceName(plan.device_name || plan.name)
    setFormDeviceModel(plan.device_model || '')
    setFormBrand('Academy Setu Tech')
    setFormDeviceSrNo('')
    setFormSimNo('')
    setFormSimImei('')
    setFormPaymentMode('Online / UPI')
    setFormTxnId('')
    setBuyModalOpen(true)
  }

  // Handle plan dropdown change in Buy modal
  const handlePlanSelectionChange = (planId: string) => {
    setFormPlanId(planId)
    const found = plans.find(p => p.id === planId)
    if (found) {
      setSelectedPlanForBuy(found)
      setFormDeviceType(found.device_type)
      setFormDeviceName(found.device_name || found.name)
      if (found.device_model) setFormDeviceModel(found.device_model)
    }
  }

  // Handle Buy submit
  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDeviceName || !formSimNo || !formDeviceSrNo) {
      alert('Please fill in Device Name, SIM Phone Number, and Device IMEI / Serial No.')
      return
    }

    setSubmittingBuy(true)
    try {
      const selectedPlan = plans.find(p => p.id === formPlanId) || selectedPlanForBuy
      const durationDays = selectedPlan ? selectedPlan.duration : 365
      const amount = selectedPlan ? parseFloat(String(selectedPlan.amount)) : 2499
      const taxPercent = selectedPlan ? parseFloat(String(selectedPlan.tax_percent)) : 18
      const totalAmount = selectedPlan ? parseFloat(String(selectedPlan.total_amount)) : 2948.82

      const payload = {
        deviceName: formDeviceName.trim(),
        deviceType: formDeviceType.trim(),
        deviceModel: formDeviceModel.trim() || 'Standard Model',
        brand: formBrand.trim(),
        simNo: formSimNo.trim(),
        simImei: formSimImei.trim(),
        deviceSrNo: formDeviceSrNo.trim(),
        planName: selectedPlan ? selectedPlan.name : 'Standard Device Plan',
        durationDays,
        amount,
        taxPercent,
        totalAmount,
        paymentMode: formPaymentMode,
        transactionId: formTxnId || `TXN-${Date.now()}`,
        imageUrl: selectedPlan?.image_url || ''
      }

      const res = await fetch('/api/institute/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        triggerToast(`Device "${payload.deviceName}" purchased successfully!`)
        setBuyModalOpen(false)
        await fetchData()
        setActiveTab('my-devices')
      } else {
        alert(data.error || 'Failed to complete device purchase')
      }
    } catch (err) {
      console.error(err)
      alert('Network error while processing device purchase')
    } finally {
      setSubmittingBuy(false)
    }
  }

  // Open Recharge Request Modal with optional selected device
  const handleOpenRechargeModal = (dev?: DeviceRecord) => {
    if (dev) {
      setRechargeDeviceId(String(dev.id))
      setCustomDeviceName(dev.deviceName)
      setCustomDeviceType(dev.deviceType)
      setCustomDeviceSrNo(dev.deviceSrNo)
      setCustomSimNo(dev.simNo)
    } else if (devicesList.length > 0) {
      setRechargeDeviceId(String(devicesList[0].id))
      setCustomDeviceName(devicesList[0].deviceName)
      setCustomDeviceType(devicesList[0].deviceType)
      setCustomDeviceSrNo(devicesList[0].deviceSrNo)
      setCustomSimNo(devicesList[0].simNo)
    } else {
      setRechargeDeviceId('custom')
      setCustomDeviceName('')
      setCustomDeviceType('GPS')
      setCustomDeviceSrNo('')
      setCustomSimNo('')
    }

    if (plans.length > 0) {
      setRechargePlanId(plans[0].id)
    }
    setRechargeTxnId('')
    setRechargePaymentMode('Online / UPI')
    setRechargeDescription('')
    setRechargeModalOpen(true)
  }

  // Handle Send Recharge Request Submit
  const handleSendRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rechargePlanId) {
      alert('Please select a recharge plan')
      return
    }

    let devName = customDeviceName
    let devType = customDeviceType
    let devSrNo = customDeviceSrNo
    let sNo = customSimNo

    if (rechargeDeviceId && rechargeDeviceId !== 'custom') {
      const selectedDev = devicesList.find(d => String(d.id) === String(rechargeDeviceId))
      if (selectedDev) {
        devName = selectedDev.deviceName
        devType = selectedDev.deviceType
        devSrNo = selectedDev.deviceSrNo
        sNo = selectedDev.simNo
      }
    }

    if (!devName || !devSrNo) {
      alert('Please select or specify a device with its Serial / IMEI number')
      return
    }

    setSubmittingRecharge(true)
    try {
      const res = await fetch('/api/institute/device/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: rechargeDeviceId,
          deviceName: devName,
          deviceType: devType,
          deviceSrNo: devSrNo,
          simNo: sNo,
          planId: rechargePlanId,
          paymentMode: rechargePaymentMode,
          transactionId: rechargeTxnId,
          description: rechargeDescription
        })
      })

      const data = await res.json()
      if (data.success) {
        triggerToast('Recharge request sent to Admin! Admin will verify and activate your device.')
        setRechargeModalOpen(false)
        await fetchData()
      } else {
        alert(data.error || 'Failed to submit recharge request')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting recharge request to admin')
    } finally {
      setSubmittingRecharge(false)
    }
  }

  const handleOpenDetails = (dev: DeviceRecord) => {
    setSelectedDevice(dev)
    setView('details')
  }

  // Export CSV
  const handleExportCSV = () => {
    if (devicesList.length === 0) {
      alert('No registered devices to export.')
      return
    }
    const headers = ['S.No.', 'Device Name', 'Device Type', 'Model', 'SIM No.', 'IMEI No.', 'Plan Name', 'Valid From', 'Valid To', 'Expiry Days', 'Status']
    const rows = devicesList.map((d, i) => [
      i + 1,
      `"${d.deviceName}"`,
      `"${d.deviceType}"`,
      `"${d.deviceModel}"`,
      `"${d.simNo}"`,
      `"${d.deviceSrNo}"`,
      `"${d.planName}"`,
      `"${d.validFrom}"`,
      `"${d.validTo}"`,
      d.expiryDays,
      `"${d.status}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `institute_devices_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Selected plan calculation for recharge modal
  const currentSelectedRechargePlan = useMemo(() => {
    return plans.find(p => p.id === rechargePlanId) || plans[0]
  }, [plans, rechargePlanId])

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in duration-300">
      
      {/* View Header with Stats & Actions */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-800">
              {view === 'list' ? 'All Device' : 'Device Details'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Cosmopolitan Inter
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {view === 'list' 
              ? 'Devices configured by Main Admin with transparent purchase prices and recharge requests' 
              : `Managing ${selectedDevice?.deviceName || 'Device'} details and subscription plan`}
          </p>
        </div>

        {view === 'list' ? (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* View Mode Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'buy'
                    ? 'bg-white text-teal-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy Devices ({plans.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my-devices')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'my-devices'
                    ? 'bg-white text-teal-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>My Devices ({devicesList.length})</span>
              </button>
            </div>

            {/* Send Recharge Request Button */}
            <button
              onClick={() => handleOpenRechargeModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-all text-xs cursor-pointer"
              title="Select device and send recharge request to Admin"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Send Recharge Request</span>
            </button>

            {/* Add / Buy Device Button */}
            <button
              onClick={() => {
                if (plans.length > 0) {
                  handleInitiateBuy(plans[0])
                } else {
                  setBuyModalOpen(true)
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all text-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Buy Device</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-5 py-2.5 bg-white border text-slate-700 hover:bg-slate-50 rounded-xl font-bold shadow-sm transition-all text-xs cursor-pointer"
          >
            ← Back to All Devices
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6 text-xs font-semibold text-slate-700">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col gap-1.5 w-full sm:w-56">
                <label className="text-slate-500 font-bold">Device Type</label>
                <select
                  value={deviceTypeFilter}
                  onChange={e => setDeviceTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-700 focus:border-teal-500 cursor-pointer"
                >
                  <option value="">Select an Option (All Types)</option>
                  {deviceTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  {deviceTypes.length === 0 && (
                    <>
                      <option value="GPS">GPS</option>
                      <option value="Finger Print Sensor">Finger Print Sensor</option>
                      <option value="Biometric Attendance">Biometric Attendance</option>
                      <option value="RFID Card Reader">RFID Card Reader</option>
                    </>
                  )}
                </select>
              </div>

              {activeTab === 'buy' && (
                <div className="flex flex-col gap-1.5 w-full sm:w-40">
                  <label className="text-slate-500 font-bold">View Layout</label>
                  <div className="flex border rounded-xl overflow-hidden bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setCatalogDisplayMode('cards')}
                      className={`flex-1 py-1.5 text-center font-bold text-[11px] rounded-lg transition-colors cursor-pointer ${
                        catalogDisplayMode === 'cards' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogDisplayMode('table')}
                      className={`flex-1 py-1.5 text-center font-bold text-[11px] rounded-lg transition-colors cursor-pointer ${
                        catalogDisplayMode === 'table' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-end gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Device Name, Serial no, IMEI..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none font-bold text-slate-700 placeholder-slate-400 text-xs focus:border-teal-500"
                />
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                title="Download CSV"
                className="w-10 h-10 border rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-100 shadow-sm cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB 1: BUY DEVICES FROM MAIN ADMIN (All devices from main admin with prices to buy) */}
          {activeTab === 'buy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    Devices from Main Admin with Prices to Buy ({plans.length})
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Hardware units set up by Admin with bundled SIM & software subscriptions ready for instant purchase
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-bold">Loading devices and prices from Main Admin...</span>
                </div>
              ) : plans.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">No devices available from Main Admin.</p>
                  <p className="text-xs text-slate-400 mt-1">Configure devices in Admin portal under Device Setup & Plans.</p>
                </div>
              ) : catalogDisplayMode === 'cards' ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map(p => {
                    const baseAmt = parseFloat(String(p.amount || 0))
                    const taxVal = parseFloat(String(p.tax_percent || 18))
                    const totalAmt = parseFloat(String(p.total_amount || baseAmt * 1.18))

                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 hover:border-teal-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Top device badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">
                            {p.device_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                            {p.duration} Days Plan
                          </span>
                        </div>

                        {/* Image & Title */}
                        <div className="space-y-3">
                          <div className="w-full h-40 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.device_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                                <Cpu className="w-8 h-8 text-teal-600 stroke-[1.5]" />
                                <span className="text-[10px] font-bold">Standard Hardware</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs">
                              {p.device_model || 'Certified'}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                              {p.device_name || p.name}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5 line-clamp-1">
                              Plan: {p.name}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {p.description || p.plan_description || 'Certified smart hardware bundled with cloud portal connectivity and priority replacement warranty.'}
                          </p>
                        </div>

                        {/* Pricing & Buy Button Section */}
                        <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price to Buy</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-slate-900">₹{totalAmt.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-bold">(incl. {taxVal}% GST)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-medium">Base: ₹{baseAmt.toFixed(0)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInitiateBuy(p)}
                            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Buy This Device</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50 font-black text-slate-600 border-b">
                      <tr>
                        <th className="px-3 py-4 w-14">S. No.</th>
                        <th className="px-3 py-4 text-left">Device Name & Model</th>
                        <th className="px-3 py-4">Device Type</th>
                        <th className="px-3 py-4">Plan Duration</th>
                        <th className="px-3 py-4 text-right">Base Price</th>
                        <th className="px-3 py-4 text-right">GST ({plans[0]?.tax_percent || 18}%)</th>
                        <th className="px-3 py-4 text-right font-black">Total to Buy</th>
                        <th className="px-3 py-4 w-32">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p, idx) => {
                        const baseAmt = parseFloat(String(p.amount || 0))
                        const taxVal = parseFloat(String(p.tax_percent || 18))
                        const totalAmt = parseFloat(String(p.total_amount || baseAmt * 1.18))
                        return (
                          <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                            <td className="px-3 py-3.5 text-left font-bold text-slate-800">
                              <div>{p.device_name || p.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">Model: {p.device_model || 'Standard'} • {p.name}</div>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                                {p.device_type}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-slate-700 font-bold">{p.duration} Days</td>
                            <td className="px-3 py-3.5 text-right text-slate-600">₹{baseAmt.toFixed(2)}</td>
                            <td className="px-3 py-3.5 text-right text-slate-400 text-[11px]">₹{(totalAmt - baseAmt).toFixed(2)}</td>
                            <td className="px-3 py-3.5 text-right font-black text-teal-700 text-sm">₹{totalAmt.toFixed(2)}</td>
                            <td className="px-3 py-3.5">
                              <button
                                type="button"
                                onClick={() => handleInitiateBuy(p)}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
                              >
                                Buy Device
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REGISTERED DEVICES TABLE (Real devices, no demo data) */}
          {activeTab === 'my-devices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-800">
                    My Registered Devices ({devicesList.length})
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Currently active hardware units operating at Cosmopolitan Inter with SIM and expiry status
                  </p>
                </div>

                {devicesList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenRechargeModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Recharge Request to Admin</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-bold">Loading registered devices...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-slate-50 font-black text-slate-600 border-b">
                      <tr>
                        <th className="px-3 py-4 w-14">S. No.</th>
                        <th className="px-3 py-4 text-left">Device Name</th>
                        <th className="px-3 py-4">Device Type</th>
                        <th className="px-3 py-4">SIM No.</th>
                        <th className="px-3 py-4">Valid From</th>
                        <th className="px-3 py-4">Valid To</th>
                        <th className="px-3 py-4">Expiry Days</th>
                        <th className="px-3 py-4">Recharge Status</th>
                        <th className="px-3 py-4 w-32">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devicesList.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                          <td className="px-3 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                          <td className="px-3 py-3.5 text-left font-bold text-slate-800">
                            <div>{item.deviceName}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Model: {item.deviceModel || 'VT05-4G'} • IMEI: {item.deviceSrNo}</div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.deviceType}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-slate-700 font-bold">+91 {item.simNo}</td>
                          <td className="px-3 py-3.5 text-slate-500 leading-tight text-[11px]">
                            {item.validFrom}
                          </td>
                          <td className="px-3 py-3.5 text-slate-500 leading-tight text-[11px]">
                            {item.validTo}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${
                              item.expiryDays <= 5 ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              item.expiryDays <= 30 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                              {String(item.expiryDays).padStart(2, '0')} Days
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            {item.rechargeStatus === 'Pending Verification' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                <span>Pending Admin</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(item)}
                                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                                title="View Device Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRechargeModal(item)}
                                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Send Recharge Request to Admin"
                              >
                                <Send className="w-3 h-3 text-teal-600" />
                                <span>Recharge</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {devicesList.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-14 text-center text-slate-400 font-bold">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Cpu className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                              <span className="text-slate-600 text-sm">No devices found.</span>
                              <p className="text-xs text-slate-400 max-w-sm">
                                You haven&apos;t added or purchased any devices yet. Browse the device catalog to buy one or send a recharge request.
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('buy')}
                                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                                >
                                  Browse Devices to Buy →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRechargeModal()}
                                  className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                  Send Recharge Request
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* DETAILS VIEW */}
      {view === 'details' && selectedDevice && (
        <div className="space-y-6 text-xs font-semibold text-slate-700">
          
          {/* Device Details form card */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-black text-slate-800">Device Specifications & Identification</h2>
              <div className="flex items-center gap-2">
                {selectedDevice.rechargeStatus === 'Pending Verification' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>Recharge Request Pending Admin Verification</span>
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  selectedDevice.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedDevice.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Brand</label>
                <input type="text" readOnly value={selectedDevice.brand || 'Academy Setu Tech'} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device Type</label>
                <input type="text" readOnly value={selectedDevice.deviceType} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device Model</label>
                <input type="text" readOnly value={selectedDevice.deviceModel || 'VT05-4G'} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device Name</label>
                <input type="text" readOnly value={selectedDevice.deviceName} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">Device IMEI / Serial No.</label>
                <input type="text" readOnly value={selectedDevice.deviceSrNo} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">SIM IMEI No.</label>
                <input type="text" readOnly value={selectedDevice.simImei} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold">SIM Phone Number</label>
                <input type="text" readOnly value={'+91 ' + selectedDevice.simNo} className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-bold text-slate-600 outline-none" />
              </div>
            </div>

            {/* Device Image Preview */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-black text-slate-800 mb-2">Device Hardware Image</h3>
              <div className="border rounded-2xl bg-slate-50 p-4 max-w-sm flex items-center gap-4">
                {selectedDevice.imageUrl ? (
                  <img src={selectedDevice.imageUrl} alt={selectedDevice.deviceName} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <Cpu className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-800">{selectedDevice.deviceName}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Model: {selectedDevice.deviceModel || 'VT05-4G'}</div>
                  <div className="text-[10px] text-teal-600 font-bold mt-1">Verified Hardware</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500">
                Plan Expiry: <span className="text-slate-800 font-black">{selectedDevice.validTo}</span> ({selectedDevice.expiryDays} days remaining)
              </div>
              <button
                type="button"
                onClick={() => handleOpenRechargeModal(selectedDevice)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer text-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Recharge Request to Admin</span>
              </button>
            </div>
          </div>

          {/* Current Plan table */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Current Active Plan</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-600 border-b">
                  <tr>
                    <th className="px-3 py-3">Plan Name</th>
                    <th className="px-3 py-3">Plan Valid From</th>
                    <th className="px-3 py-3">Plan Valid To</th>
                    <th className="px-3 py-3">Duration</th>
                    <th className="px-3 py-3">Amount Paid</th>
                    <th className="px-3 py-3 w-16">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold text-slate-700">
                    <td className="px-3 py-3 font-bold text-slate-800">{selectedDevice.planName}</td>
                    <td className="px-3 py-3 text-slate-500">{selectedDevice.validFrom}</td>
                    <td className="px-3 py-3 text-slate-500">{selectedDevice.validTo}</td>
                    <td className="px-3 py-3 font-bold">{selectedDevice.durationDays} Days</td>
                    <td className="px-3 py-3 font-black text-teal-700">₹{selectedDevice.totalAmount ? selectedDevice.totalAmount.toFixed(2) : selectedDevice.amount.toFixed(2)}</td>
                    <td className="px-3 py-3">
                      <FileText className="w-4 h-4 text-teal-600 cursor-pointer mx-auto hover:scale-110 transition-transform" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2 pt-4">Recharge & Subscription History</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-600 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4">Plan Name</th>
                    <th className="px-3 py-4">Valid From</th>
                    <th className="px-3 py-4">Valid To</th>
                    <th className="px-3 py-4">Payment Mode</th>
                    <th className="px-3 py-4">Transaction ID</th>
                    <th className="px-3 py-4">Amount</th>
                    <th className="px-3 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                    <td className="px-3 py-3.5 text-slate-500">1.</td>
                    <td className="px-3 py-3.5 font-bold text-slate-800">{selectedDevice.planName}</td>
                    <td className="px-3 py-3.5 text-slate-500">{selectedDevice.validFrom}</td>
                    <td className="px-3 py-3.5 text-slate-500">{selectedDevice.validTo}</td>
                    <td className="px-3 py-3.5 text-slate-600">{selectedDevice.paymentMode}</td>
                    <td className="px-3 py-3.5 text-slate-600 font-mono text-[11px]">{selectedDevice.transactionId}</td>
                    <td className="px-3 py-3.5 font-bold text-slate-900">₹{(selectedDevice.totalAmount || selectedDevice.amount).toFixed(2)}</td>
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black border bg-emerald-50 text-emerald-600 border-emerald-100">
                        {selectedDevice.paymentStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SEND RECHARGE REQUEST TO ADMIN MODAL (Select Device -> Select Plan -> Send to Admin) */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setRechargeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 mb-5">
              <h2 className="text-base font-black text-[#1b3a60] flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <span>Send Recharge Request to Admin</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Select your device and chosen subscription plan. Request will be submitted to Main Admin for immediate verification and activation.
              </p>
            </div>

            <form onSubmit={handleSendRechargeSubmit} className="space-y-5">
              
              {/* STEP 1: SELECT DEVICE */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Step 1: Select Device to Recharge</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold">Select from Registered Devices <span className="text-red-500">*</span></label>
                  <select
                    value={rechargeDeviceId}
                    onChange={e => {
                      const val = e.target.value
                      setRechargeDeviceId(val)
                      const found = devicesList.find(d => String(d.id) === val)
                      if (found) {
                        setCustomDeviceName(found.deviceName)
                        setCustomDeviceType(found.deviceType)
                        setCustomDeviceSrNo(found.deviceSrNo)
                        setCustomSimNo(found.simNo)
                      }
                    }}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-800 focus:border-indigo-500 cursor-pointer"
                  >
                    {devicesList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.deviceName} ({d.deviceType} • IMEI: {d.deviceSrNo})
                      </option>
                    ))}
                    <option value="custom">+ Enter Device Details Manually</option>
                  </select>
                </div>

                {/* If custom or selected, show details fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-bold">Device Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bus 01 GPS Tracker"
                      value={customDeviceName}
                      onChange={e => setCustomDeviceName(e.target.value)}
                      readOnly={rechargeDeviceId !== 'custom'}
                      className={`w-full px-3 py-2 border rounded-xl font-bold ${rechargeDeviceId !== 'custom' ? 'bg-slate-100 text-slate-600' : 'bg-white'}`}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 font-bold">Device IMEI / Serial No.</label>
                    <input
                      type="text"
                      placeholder="e.g. IMEI-8675430291"
                      value={customDeviceSrNo}
                      onChange={e => setCustomDeviceSrNo(e.target.value)}
                      readOnly={rechargeDeviceId !== 'custom'}
                      className={`w-full px-3 py-2 border rounded-xl font-bold ${rechargeDeviceId !== 'custom' ? 'bg-slate-100 text-slate-600' : 'bg-white'}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: SELECT RECHARGE PLAN */}
              <div className="space-y-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                <div className="text-teal-900 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <span>Step 2: Select Recharge Plan from Admin</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold">Choose Plan <span className="text-red-500">*</span></label>
                  <select
                    value={rechargePlanId}
                    onChange={e => setRechargePlanId(e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-800 focus:border-teal-500 cursor-pointer"
                    required
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration} Days • Total: ₹{parseFloat(String(p.total_amount || p.amount)).toFixed(0)})
                      </option>
                    ))}
                  </select>
                </div>

                {currentSelectedRechargePlan && (
                  <div className="bg-white rounded-xl p-3 border border-teal-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Duration: {currentSelectedRechargePlan.duration} Days</span>
                      <span className="font-bold text-slate-800">{currentSelectedRechargePlan.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">
                        Base: ₹{parseFloat(String(currentSelectedRechargePlan.amount)).toFixed(0)} + GST ({currentSelectedRechargePlan.tax_percent}%)
                      </span>
                      <div className="text-sm font-black text-teal-700">
                        Total: ₹{parseFloat(String(currentSelectedRechargePlan.total_amount || currentSelectedRechargePlan.amount)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: PAYMENT & TRANSACTION DETAILS */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold">Payment Mode</label>
                    <select
                      value={rechargePaymentMode}
                      onChange={e => setRechargePaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white outline-none font-bold"
                    >
                      <option value="Online / UPI">Online / UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Cheque / DD">Cheque / Demand Draft</option>
                      <option value="Bank Transfer">Direct Bank Transfer</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold">Transaction / UTR Reference No.</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-9823471029"
                      value={rechargeTxnId}
                      onChange={e => setRechargeTxnId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold">Notes / Message for Admin (Optional)</label>
                  <textarea
                    placeholder="Enter any additional instructions for the Admin verification team..."
                    value={rechargeDescription}
                    onChange={e => setRechargeDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white h-16 resize-none"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecharge}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingRecharge ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request to Admin</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BUY / ADD DEVICE MODAL */}
      {buyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            
            <button
              onClick={() => setBuyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 mb-5">
              <h2 className="text-base font-black text-[#1b3a60] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
                <span>Buy Device from Main Admin</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Choose any device setup and plan configured by Main Admin. Price and validity are automatically populated.
              </p>
            </div>

            <form onSubmit={handleBuySubmit} className="space-y-6">
              
              {/* SECTION 1: ADMIN DEVICE & PLAN SELECTION */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4">
                <div className="flex items-center gap-2 text-teal-800 font-black text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <span>Step 1: Choose Device & Plan from Admin</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold">Select Admin Plan / Device <span className="text-red-500">*</span></label>
                    <select
                      value={formPlanId}
                      onChange={e => handlePlanSelectionChange(e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-800 focus:border-teal-500 cursor-pointer"
                      required
                    >
                      <option value="">-- Select Device Plan --</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.device_name || p.name} ({p.device_type} • ₹{parseFloat(String(p.total_amount || p.amount)).toFixed(0)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600 font-bold">Device Type</label>
                    <input
                      type="text"
                      readOnly
                      value={formDeviceType}
                      className="w-full px-3 py-2.5 border rounded-xl bg-slate-100 font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Live Price Calculation Banner */}
                {(() => {
                  const curr = plans.find(p => p.id === formPlanId) || selectedPlanForBuy
                  if (!curr) return null
                  const base = parseFloat(String(curr.amount || 0))
                  const tax = parseFloat(String(curr.tax_percent || 18))
                  const total = parseFloat(String(curr.total_amount || base * 1.18))

                  return (
                    <div className="bg-white rounded-xl p-3 border border-teal-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Duration: {curr.duration} Days</span>
                        <span className="font-bold text-slate-800">{curr.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Base: ₹{base.toFixed(2)} + GST ({tax}%): ₹{(total - base).toFixed(2)}</span>
                        <div className="text-sm font-black text-teal-700">Total: ₹{total.toFixed(2)}</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* SECTION 2: DEVICE HARDWARE DETAILS */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-800 border-b pb-1 w-full flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-teal-600" />
                  <span>Step 2: Device Identification & Assignment</span>
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Name / Label <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. School Bus 01 - GPS Tracker"
                      value={formDeviceName}
                      onChange={e => setFormDeviceName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Model</label>
                    <input
                      type="text"
                      placeholder="e.g. VT05-4G"
                      value={formDeviceModel}
                      onChange={e => setFormDeviceModel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Device Serial / IMEI No. <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter Hardware IMEI No."
                      value={formDeviceSrNo}
                      onChange={e => setFormDeviceSrNo(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Brand</label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </fieldset>

              {/* SECTION 3: SIM DETAILS */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-800 border-b pb-1 w-full flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Step 3: SIM Card & Connectivity</span>
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">SIM Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex items-center border rounded-xl bg-white overflow-hidden focus-within:border-teal-500">
                      <span className="bg-slate-50 px-3 py-2 text-slate-400 border-r font-bold">+91</span>
                      <input
                        type="text"
                        placeholder="10-digit number"
                        value={formSimNo}
                        onChange={e => setFormSimNo(e.target.value)}
                        className="flex-1 px-3 py-2 outline-none font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">SIM IMEI / ICCID No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 8991001234567890123"
                      value={formSimImei}
                      onChange={e => setFormSimImei(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </fieldset>

              {/* SECTION 4: PAYMENT INFO */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-black text-slate-800 border-b pb-1 w-full flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Step 4: Payment Confirmation</span>
                </legend>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Payment Mode</label>
                    <select
                      value={formPaymentMode}
                      onChange={e => setFormPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white outline-none font-bold"
                    >
                      <option value="Online / UPI">Online / UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Cheque / DD">Cheque / Demand Draft</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Transaction / UTR Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-10928374"
                      value={formTxnId}
                      onChange={e => setFormTxnId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </fieldset>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold shadow-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBuy}
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingBuy ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Purchase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Buy Device</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
