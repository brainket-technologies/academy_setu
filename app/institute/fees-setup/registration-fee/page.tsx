'use client'

import React, { useState, useEffect } from 'react'
import { Search, Upload, Filter, Receipt, Tag, Plus, Calendar as CalendarIcon, Pencil, Trash2, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export interface RegistrationFeeChartItem {
  id: number
  className: string
  studentType: 'All' | 'New' | 'Old'
  monthly: string
  quarterly: string
  halfYearly: string
  yearly: string
  isRteEnabled?: boolean
  rteMonthly?: string
  rteQuarterly?: string
  rteHalfYearly?: string
  rteYearly?: string
  isLateFeeEnabled?: boolean
  lateFeePerDay?: string
  date: string
  time: string
}

export interface StudentFeeRecord {
  id: number
  admissionNo: string
  rollNo: string
  name: string
  className: string
  contact: string
  status: 'Paid' | 'Unpaid'
}

export default function RegistrationFeePage() {
  const [feeCharts, setFeeCharts] = useState<RegistrationFeeChartItem[]>([])
  const [students, setStudents] = useState<StudentFeeRecord[]>([])
  const [classList, setClassList] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<'Registration Fee Chart' | 'Applicable Student' | 'Paid Student' | 'Pending Student'>('Registration Fee Chart')
  const [showForm, setShowForm] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Form State
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [studentType, setStudentType] = useState<'All' | 'New' | 'Old'>('All')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [quarterlyFee, setQuarterlyFee] = useState('')
  const [halfYearlyFee, setHalfYearlyFee] = useState('')
  const [yearlyFee, setYearlyFee] = useState('')

  // RTE state
  const [isRteEnabled, setIsRteEnabled] = useState(false)
  const [rteMonthly, setRteMonthly] = useState('0.0')
  const [rteQuarterly, setRteQuarterly] = useState('0.0')
  const [rteHalfYearly, setRteHalfYearly] = useState('0.0')
  const [rteYearly, setRteYearly] = useState('0.0')

  // Late fee state
  const [isLateFeeEnabled, setIsLateFeeEnabled] = useState(false)
  const [lateFeePerDay, setLateFeePerDay] = useState('')

  const [formError, setFormError] = useState('')
  const [filterClass, setFilterClass] = useState('')

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedFeeChart, setSelectedFeeChart] = useState<RegistrationFeeChartItem | null>(null)
  const [editClass, setEditClass] = useState('')
  const [editStudentType, setEditStudentType] = useState<'All' | 'New' | 'Old'>('All')
  const [editMonthly, setEditMonthly] = useState('')
  const [editQuarterly, setEditQuarterly] = useState('')
  const [editHalfYearly, setEditHalfYearly] = useState('')
  const [editYearly, setEditYearly] = useState('')

  useEffect(() => {
    // Load registration fee rules
    const savedFees = localStorage.getItem('school_registration_fees')
    if (savedFees) {
      try {
        setFeeCharts(JSON.parse(savedFees))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_registration_fees', JSON.stringify([]))
      setFeeCharts([])
    }

    // Load dynamic classes
    loadClasses()

    // Load students
    const savedStudents = localStorage.getItem('school_institute_students')
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents))
      } catch (e) {
        console.error(e)
      }
    } else {
      setStudents([])
    }
  }, [])

  const loadClasses = () => {
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        const names = parsed.filter((c: any) => !c.deleted).map((c: any) => c.className).filter(Boolean)
        if (names.length > 0) {
          setClassList(names)
          return
        }
      } catch (e) {
        console.error(e)
      }
    }
    setClassList([])
  }

  const handleToggleSelectAllClasses = () => {
    if (selectedClasses.length === classList.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses([...classList])
    }
    if (formError) setFormError('')
  }

  const handleToggleClass = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
    if (formError) setFormError('')
  }

  const formatAmount = (val: string) => {
    if (!val || val.trim() === '') return '-'
    const trimmed = val.trim()
    return trimmed.endsWith('/-') ? trimmed : `${trimmed}/-`
  }

  const handleCreateFeeRule = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (selectedClasses.length === 0) {
      setFormError('Please select at least one Class.')
      return
    }

    if (!monthlyFee && !quarterlyFee && !halfYearlyFee && !yearlyFee) {
      setFormError('Please enter at least one fee amount (Monthly, Quarterly, Half Yearly, or Yearly).')
      return
    }

    const now = new Date()
    const newRules: RegistrationFeeChartItem[] = selectedClasses.map((cls, idx) => ({
      id: Date.now() + idx,
      className: cls,
      studentType,
      monthly: formatAmount(monthlyFee),
      quarterly: formatAmount(quarterlyFee),
      halfYearly: formatAmount(halfYearlyFee),
      yearly: formatAmount(yearlyFee),
      isRteEnabled,
      rteMonthly: isRteEnabled ? formatAmount(rteMonthly) : undefined,
      rteQuarterly: isRteEnabled ? formatAmount(rteQuarterly) : undefined,
      rteHalfYearly: isRteEnabled ? formatAmount(rteHalfYearly) : undefined,
      rteYearly: isRteEnabled ? formatAmount(rteYearly) : undefined,
      isLateFeeEnabled,
      lateFeePerDay: isLateFeeEnabled ? lateFeePerDay : undefined,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }))

    const updated = [...newRules, ...feeCharts]
    setFeeCharts(updated)
    localStorage.setItem('school_registration_fees', JSON.stringify(updated))

    setSelectedClasses([])
    setIsClassDropdownOpen(false)
    setStudentType('All')
    setMonthlyFee('')
    setQuarterlyFee('')
    setHalfYearlyFee('')
    setYearlyFee('')
    setIsRteEnabled(false)
    setIsLateFeeEnabled(false)
    setLateFeePerDay('')
    setFormError('')

    toast.success(`Registration fee created for ${newRules.length} class(es)!`)
  }

  const handleOpenEdit = (item: RegistrationFeeChartItem) => {
    setSelectedFeeChart(item)
    setEditClass(item.className)
    setEditStudentType(item.studentType)
    setEditMonthly(item.monthly === '-' ? '' : item.monthly.replace('/-', ''))
    setEditQuarterly(item.quarterly === '-' ? '' : item.quarterly.replace('/-', ''))
    setEditHalfYearly(item.halfYearly === '-' ? '' : item.halfYearly.replace('/-', ''))
    setEditYearly(item.yearly === '-' ? '' : item.yearly.replace('/-', ''))
    setFormError('')
    setEditModalOpen(true)
  }

  const handleUpdateFeeRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFeeChart) return
    setFormError('')

    if (!editClass) {
      setFormError('Please select a Class.')
      return
    }

    const updated = feeCharts.map(item => {
      if (item.id === selectedFeeChart.id) {
        return {
          ...item,
          className: editClass,
          studentType: editStudentType,
          monthly: formatAmount(editMonthly),
          quarterly: formatAmount(editQuarterly),
          halfYearly: formatAmount(editHalfYearly),
          yearly: formatAmount(editYearly)
        }
      }
      return item
    })

    setFeeCharts(updated)
    localStorage.setItem('school_registration_fees', JSON.stringify(updated))

    setEditModalOpen(false)
    setSelectedFeeChart(null)
    toast.success('Registration fee updated successfully!')
  }

  const handleDeleteFeeRule = (id: number) => {
    const updated = feeCharts.filter(item => item.id !== id)
    setFeeCharts(updated)
    localStorage.setItem('school_registration_fees', JSON.stringify(updated))
    toast.info('Registration fee rule deleted!')
  }

  // Derived Pill Counts
  const applicableStudents = students.filter(s => s.status === 'Paid' || s.status === 'Unpaid')
  const paidStudents = students.filter(s => s.status === 'Paid')
  const pendingStudents = students.filter(s => s.status === 'Unpaid')

  // Search filtering
  const filteredFeeCharts = feeCharts.filter(f => {
    if (filterClass && f.className !== filterClass) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return f.className.toLowerCase().includes(q) || f.studentType.toLowerCase().includes(q)
  })

  const getFilteredStudents = () => {
    let list = students
    if (activeTab === 'Paid Student') list = paidStudents
    if (activeTab === 'Pending Student') list = pendingStudents

    if (!searchQuery) return list
    const q = searchQuery.toLowerCase()
    return list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q)
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Registration Fee</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
          title={showForm ? 'Hide Form' : 'Show Form'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
            Create Registration Amount Classwise
          </h2>
          
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateFeeRule}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6 mb-8">
              
              {/* Multi-Select Class Selector */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Class <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  onFocus={loadClasses}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-sm text-left"
                >
                  <span className="truncate">
                    {selectedClasses.length === 0
                      ? 'Select Class'
                      : selectedClasses.length === classList.length
                      ? `All Classes Selected (${selectedClasses.length})`
                      : selectedClasses.join(', ')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isClassDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsClassDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                      {classList.length > 0 ? (
                        <>
                          <div 
                            onClick={handleToggleSelectAllClasses}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold text-xs border-b border-slate-100 dark:border-slate-800 text-teal-600 dark:text-teal-400 select-none"
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedClasses.length === classList.length && classList.length > 0} 
                              onChange={() => {}} 
                              className="rounded accent-teal-600 pointer-events-none"
                            />
                            <span>Select All ({classList.length})</span>
                          </div>
                          {classList.map((cls, idx) => {
                            const isSelected = selectedClasses.includes(cls)
                            return (
                              <div 
                                key={idx}
                                onClick={() => handleToggleClass(cls)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer font-semibold text-xs text-slate-700 dark:text-slate-200 select-none"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => {}} 
                                  className="rounded accent-teal-600 pointer-events-none"
                                />
                                <span>{cls}</span>
                              </div>
                            )
                          })}
                        </>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 font-medium">
                          No master classes found. Add classes in Masters.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Student Type <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4 py-2.5">
                  <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="studentType" 
                      checked={studentType === 'All'}
                      onChange={() => setStudentType('All')}
                      className="accent-teal-600" 
                    /> All
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="studentType" 
                      checked={studentType === 'New'}
                      onChange={() => setStudentType('New')}
                      className="accent-teal-600" 
                    /> New
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="studentType" 
                      checked={studentType === 'Old'}
                      onChange={() => setStudentType('Old')}
                      className="accent-teal-600" 
                    /> Old
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Monthly Fees</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={monthlyFee}
                  onChange={e => setMonthlyFee(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 dark:text-slate-200" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Quarterly Fees</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={quarterlyFee}
                  onChange={e => setQuarterlyFee(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 dark:text-slate-200" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Half Yearly Fees</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={halfYearlyFee}
                  onChange={e => setHalfYearlyFee(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 dark:text-slate-200" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Yearly Fees</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={yearlyFee}
                  onChange={e => setYearlyFee(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800 dark:text-slate-200" 
                />
              </div>
            </div>

            {/* RTE Toggle */}
            <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-700 mb-6">
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                School is Applicable for RTE (Right to Education) Government Fee Relaxation Scheme Student.
              </span>
              <div 
                onClick={() => setIsRteEnabled(!isRteEnabled)}
                className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${isRteEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isRteEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {isRteEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Monthly Fees</label>
                  <input 
                    type="number" 
                    value={rteMonthly}
                    onChange={e => setRteMonthly(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Quarterly Fees</label>
                  <input 
                    type="number" 
                    value={rteQuarterly}
                    onChange={e => setRteQuarterly(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Half Yearly Fees</label>
                  <input 
                    type="number" 
                    value={rteHalfYearly}
                    onChange={e => setRteHalfYearly(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Yearly Fees</label>
                  <input 
                    type="number" 
                    value={rteYearly}
                    onChange={e => setRteYearly(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" 
                  />
                </div>
              </div>
            )}

            {/* Late Fee */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-8 border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Late Fee</span>
                <div className="flex items-center gap-4 mt-1.5">
                  <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="lateFee" 
                      checked={isLateFeeEnabled} 
                      onChange={() => setIsLateFeeEnabled(true)} 
                      className="accent-teal-600" 
                    /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input 
                      type="radio" 
                      name="lateFee" 
                      checked={!isLateFeeEnabled} 
                      onChange={() => setIsLateFeeEnabled(false)} 
                      className="accent-teal-600" 
                    /> No
                  </label>
                </div>
              </div>

              {isLateFeeEnabled && (
                <div className="flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Per Day Amount</label>
                    <input 
                      type="number" 
                      placeholder="Enter Amount" 
                      value={lateFeePerDay}
                      onChange={e => setLateFeePerDay(e.target.value)}
                      className="w-full md:w-56 px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button 
                type="submit" 
                className="px-10 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">All Registration Fee</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Class, Student Type" 
                className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowFilter(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('Registration Fee Chart')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'Registration Fee Chart'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Registration Fee Chart <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === 'Registration Fee Chart' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'}`}>{String(feeCharts.length).padStart(2, '0')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('Applicable Student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'Applicable Student'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Applicable Student <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-200/60">{applicableStudents.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('Paid Student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'Paid Student'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Paid Student <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-blue-200/60">{paidStudents.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('Pending Student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'Pending Student'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Pending Student <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-200/60">{pendingStudents.length}</span>
          </button>
        </div>

        {/* Dynamic Table Content based on Tab */}
        {activeTab === 'Registration Fee Chart' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-center whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">S. No.</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">Student Type</th>
                  <th className="px-4 py-3.5">Monthly Fee</th>
                  <th className="px-4 py-3.5">Quarterly Fee</th>
                  <th className="px-4 py-3.5">Half Yearly Fee</th>
                  <th className="px-4 py-3.5">Yearly Fee</th>
                  <th className="px-4 py-3.5">Created At</th>
                  <th className="px-4 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeeCharts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                      No registration fee rules found. Create a rule above.
                    </td>
                  </tr>
                ) : (
                  filteredFeeCharts.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-slate-500 font-medium">{idx + 1}.</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-bold">{item.className}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{item.studentType}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-bold">{item.monthly || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-bold">{item.quarterly || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-bold">{item.halfYearly || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-bold">{item.yearly || '-'}</td>
                      <td className="px-4 py-4 text-slate-500 font-medium text-[11px]">
                        <div>📅 {item.date}</div>
                        <div className="text-slate-400">@ {item.time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFeeRule(item.id)}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-center whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">S. No.</th>
                  <th className="px-4 py-3.5">Admission No.</th>
                  <th className="px-4 py-3.5">Roll No.</th>
                  <th className="px-4 py-3.5 text-left">Student Name</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">Contact No.</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStudents().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No students found in this category.
                    </td>
                  </tr>
                ) : (
                  getFilteredStudents().map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-slate-500 font-medium">{idx + 1}.</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-200 font-semibold">{student.admissionNo}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{student.rollNo}</td>
                      <td className="px-4 py-4 text-slate-800 dark:text-slate-100 font-bold text-left">{student.name}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-semibold">{student.className}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{student.contact}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          student.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          ● {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Fee Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden relative p-6">
            <button onClick={() => setEditModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 border-b pb-3 mb-6">Edit Registration Fee</h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateFeeRule} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class</label>
                <select 
                  value={editClass}
                  onChange={e => setEditClass(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {classList.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Type</label>
                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input type="radio" name="editStudentType" checked={editStudentType === 'All'} onChange={() => setEditStudentType('All')} className="accent-teal-600" /> All
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input type="radio" name="editStudentType" checked={editStudentType === 'New'} onChange={() => setEditStudentType('New')} className="accent-teal-600" /> New
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer">
                    <input type="radio" name="editStudentType" checked={editStudentType === 'Old'} onChange={() => setEditStudentType('Old')} className="accent-teal-600" /> Old
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Fees</label>
                  <input type="number" value={editMonthly} onChange={e => setEditMonthly(e.target.value)} className="px-4 py-2 rounded-lg border text-sm font-semibold" placeholder="Enter Amount" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quarterly Fees</label>
                  <input type="number" value={editQuarterly} onChange={e => setEditQuarterly(e.target.value)} className="px-4 py-2 rounded-lg border text-sm font-semibold" placeholder="Enter Amount" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Half Yearly Fees</label>
                  <input type="number" value={editHalfYearly} onChange={e => setEditHalfYearly(e.target.value)} className="px-4 py-2 rounded-lg border text-sm font-semibold" placeholder="Enter Amount" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Yearly Fees</label>
                  <input type="number" value={editYearly} onChange={e => setEditYearly(e.target.value)} className="px-4 py-2 rounded-lg border text-sm font-semibold" placeholder="Enter Amount" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t pt-4">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md">
                  Update Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden relative p-6">
            <button onClick={() => setShowFilter(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 border-b pb-3 mb-6">Filter Options</h2>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class</label>
                <select 
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="">Select Class</option>
                  {classList.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Type</label>
                <select 
                  value={studentType}
                  onChange={e => setStudentType(e.target.value as any)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  <option value="All">All</option>
                  <option value="New">New</option>
                  <option value="Old">Old</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setSearchQuery(''); setFilterClass(''); setShowFilter(false); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                Clear
              </button>
              <button onClick={() => setShowFilter(false)} className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md transition-colors">
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
