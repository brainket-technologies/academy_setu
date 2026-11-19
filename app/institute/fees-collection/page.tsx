'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search, Upload, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Receipt, Printer, X, Check, CheckCircle2,
  Clock, DollarSign, Wallet, ArrowRight, ArrowLeft, Download, CreditCard, RotateCcw,
  AlertCircle, Building2, User, Phone, FileText, Trash2, GraduationCap, BookOpen,
  Bed, Bus, Sparkles, ShieldCheck, QrCode, Copy, Image as ImageIcon, CheckCheck,
  Calendar, Layers, CheckSquare, Square, Ticket, Tag, Percent
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchStudents } from '@/app/institute/students/actions'
import { calculateFinalFee } from '@/components/students/AddStudentWizard'

export interface StudentFeeItem {
  id: string | number
  class: string
  section: string
  name: string
  admissionNo?: string
  rollNo?: string
  reg: string
  adm: string
  classFee: string
  lib: string
  exam: string
  hostel: string
  trans: string
  extra: string
  fine: string
  total: string
  paid: string
  pending: string
  status: 'Paid' | 'Unpaid' | 'Partial'
  paymentMode?: string
  receiptNo?: string
  paymentDate?: string
  remarks?: string
  [key: string]: any
}

const DEFAULT_STUDENT_FEES: StudentFeeItem[] = [
  {
    id: 'stu-1',
    class: 'Class VII',
    section: 'Section A',
    name: 'Rajesh Sharma',
    admissionNo: 'ADM-701',
    rollNo: '01',
    reg: '3,000/-',
    adm: '6,000/-',
    classFee: '12,000/-',
    lib: '3,000/-',
    exam: '6,000/-',
    hostel: '0/-',
    trans: '2,500/-',
    extra: '1,500/-',
    fine: '0/-',
    total: '34,000/-',
    paid: '34,000/-',
    pending: '0/-',
    status: 'Paid',
    paymentMode: 'UPI',
    receiptNo: 'REC-2026-701',
    paymentDate: '2026-11-15',
    remarks: 'Full term fee payment cleared'
  },
  {
    id: 'stu-2',
    class: 'Class VIII',
    section: 'Section B',
    name: 'Suresh Patel',
    admissionNo: 'ADM-802',
    rollNo: '02',
    reg: '6,000/-',
    adm: '12,000/-',
    classFee: '24,000/-',
    lib: '6,000/-',
    exam: '12,000/-',
    hostel: '15,000/-',
    trans: '0/-',
    extra: '2,000/-',
    fine: '500/-',
    total: '77,500/-',
    paid: '40,000/-',
    pending: '37,500/-',
    status: 'Partial',
    paymentMode: 'Bank Transfer',
    receiptNo: 'REC-2026-802',
    paymentDate: '2026-11-10',
    remarks: 'First installment received'
  },
  {
    id: 'stu-3',
    class: 'Class IX',
    section: 'Section C',
    name: 'Aditya Verma',
    admissionNo: 'ADM-903',
    rollNo: '03',
    reg: '4,500/-',
    adm: '9,000/-',
    classFee: '18,000/-',
    lib: '4,500/-',
    exam: '9,000/-',
    hostel: '0/-',
    trans: '3,000/-',
    extra: '1,000/-',
    fine: '0/-',
    total: '49,000/-',
    paid: '0/-',
    pending: '49,000/-',
    status: 'Unpaid',
    remarks: 'Awaiting fee submission'
  },
  {
    id: 'stu-4',
    class: 'Class 1',
    section: 'Section A',
    name: 'Md fahad',
    admissionNo: 'ADM-6666',
    rollNo: '04',
    reg: '2,000/-',
    adm: '5,000/-',
    classFee: '10,000/-',
    lib: '1,500/-',
    exam: '3,000/-',
    hostel: '0/-',
    trans: '2,000/-',
    extra: '1,000/-',
    fine: '0/-',
    total: '24,500/-',
    paid: '0/-',
    pending: '24,500/-',
    status: 'Unpaid',
    remarks: 'Admission pending confirmation'
  }
]

export default function FeeCollectionPage() {
  const [feeRecords, setFeeRecords] = useState<StudentFeeItem[]>([])
  const [classList, setClassList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'All Fee Data' | 'Paid Student' | 'Pending Student'>('All Fee Data')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState('2025-26')
  const [filterClass, setFilterClass] = useState('All')
  const [filterSection, setFilterSection] = useState('All')

  // Modals
  const [selectedRecordForReceipt, setSelectedRecordForReceipt] = useState<StudentFeeItem | null>(null)
  const [payModalStudent, setPayModalStudent] = useState<StudentFeeItem | null>(null)
  const [payAmountInput, setPayAmountInput] = useState<string>('')
  const [paymentModeInput, setPaymentModeInput] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card'>('Cash')
  const [payTxnIdInput, setPayTxnIdInput] = useState<string>('')
  const [payRemarksInput, setPayRemarksInput] = useState<string>('')
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Parse helper
  const parseAmt = (val: any): number => {
    if (!val) return 0
    const str = String(val).replace(/[^0-9.]/g, '')
    return parseFloat(str) || 0
  }
  const fmtAmt = (num: number): string => `${Math.round(num).toLocaleString('en-IN')}/-`

  // Helper to resolve Class Fee from record, student profile, or master
  const resolveStudentClassFee = (
    currentFee: any,
    studentObj: any,
    classNameStr?: string
  ): number => {
    const parsed = parseAmt(currentFee)
    if (parsed > 0) return parsed
    if (studentObj?.isRteStudent === 'Yes') return 0

    if (studentObj?.classFee || studentObj?.class_fee) {
      const fromObj = parseAmt(studentObj.classFee || studentObj.class_fee)
      if (fromObj > 0) return fromObj
    }

    if (typeof window !== 'undefined') {
      try {
        const rawMaster = localStorage.getItem('school_class_fees')
        if (rawMaster) {
          const list = JSON.parse(rawMaster)
          if (Array.isArray(list) && list.length > 0) {
            const target = (classNameStr || studentObj?.class || studentObj?.class_name || 'Class 1').trim().toLowerCase()
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

            if (found) {
              const chartAmt = parseFloat(found.monthly || found.oneTime || found.amount || '0') || 0
              if (chartAmt > 0) return chartAmt
            } else if (list[0]) {
              const fallbackAmt = parseFloat(list[0].monthly || list[0].oneTime || list[0].amount || '0') || 0
              if (fallbackAmt > 0) return fallbackAmt
            }
          }
        }
      } catch (e) {}
    }

    return 1000 // Standard fallback tuition fee
  }

  // Load students & fee records
  const loadFeeCollectionData = async () => {
    setLoading(true)

    // Helper to calculate student heads with discounts applied
    const computeStudentHeads = (src: any, studentProfile?: any) => {
      // Priority: studentProfile has the authoritative student master details (class, promo codes, fee structure)
      const sp = { ...(src || {}), ...(studentProfile || {}) }
      const regPromo = sp.regFeePromo || sp.regPromo || sp.promocode || sp.promoCode
      const admPromo = sp.admFeePromo || sp.admPromo || sp.promocode || sp.promoCode
      const classPromo = sp.classFeePromo || sp.classPromo || sp.promocode || sp.promoCode
      const libPromo = sp.libFeePromo || sp.libPromo || sp.promocode || sp.promoCode
      const examPromo = sp.examFeePromo || sp.examPromo || sp.promocode || sp.promoCode
      const hostelPromo = sp.hostelFeePromo || sp.hostelPromo || sp.promocode || sp.promoCode
      const transPromo = sp.transFeePromo || sp.transPromo || sp.promocode || sp.promoCode
      const extraPromo = sp.extraFeePromo || sp.extraPromo || sp.promocode || sp.promoCode

      const computeOne = (baseVal: any, promo?: string) => {
        const base = parseAmt(baseVal)
        if (!promo || base <= 0) return { base, discount: 0, net: base }
        const res = calculateFinalFee(base, promo)
        return { base: res.baseFee, discount: res.discount, net: res.finalFee }
      }

      const reg = computeOne(sp.regFee || sp.reg || src.regFee || src.reg, regPromo)
      const adm = computeOne(sp.admFee || sp.adm || src.admFee || src.adm, admPromo)
      const rawClassBase = resolveStudentClassFee(sp.classFee || sp.class_fee || src.classFee, sp, sp.class || sp.class_name || src.class)
      const classFee = computeOne(rawClassBase, classPromo)
      const lib = computeOne(sp.libFee || sp.lib || src.libFee || src.lib, libPromo)
      const exam = computeOne(sp.examFee || sp.exam || src.examFee || src.exam, examPromo)
      const hostel = computeOne(sp.hostelFee || sp.hostel || src.hostelFee || src.hostel, hostelPromo)
      const trans = computeOne(sp.transFee || sp.trans || src.transFee || src.trans, transPromo)
      const extra = computeOne(sp.extraFee || sp.extra || src.extraFee || src.extra, extraPromo)
      const fineNum = parseAmt(sp.fine || src.fine)

      const totalGrossNum = reg.base + adm.base + classFee.base + lib.base + exam.base + hostel.base + trans.base + extra.base + fineNum
      const totalDiscountNum = reg.discount + adm.discount + classFee.discount + lib.discount + exam.discount + hostel.discount + trans.discount + extra.discount
      const netTotalNum = Math.max(0, totalGrossNum - totalDiscountNum)

      const isPaid = (sp.fees_status === 'Paid' || sp.status === 'Paid' || src.status === 'Paid')
      const rawPaid = parseAmt(src.paid || sp.paid)
      // When student paid, they paid the DISCOUNTED net amount:
      const paidNum = isPaid ? netTotalNum : Math.min(netTotalNum, rawPaid)
      const pendingNum = Math.max(0, netTotalNum - paidNum)
      const statusVal: 'Paid' | 'Unpaid' | 'Partial' = (pendingNum <= 0 && netTotalNum > 0 && isPaid) ? 'Paid' : (paidNum > 0 ? 'Partial' : 'Unpaid')

      return {
        reg: fmtAmt(reg.net),
        regGross: fmtAmt(reg.base),
        regDiscount: reg.discount,
        adm: fmtAmt(adm.net),
        admGross: fmtAmt(adm.base),
        admDiscount: adm.discount,
        classFee: fmtAmt(classFee.net),
        classFeeGross: fmtAmt(classFee.base),
        classFeeDiscount: classFee.discount,
        lib: fmtAmt(lib.net),
        libGross: fmtAmt(lib.base),
        exam: fmtAmt(exam.net),
        examGross: fmtAmt(exam.base),
        hostel: fmtAmt(hostel.net),
        hostelGross: fmtAmt(hostel.base),
        trans: fmtAmt(trans.net),
        transGross: fmtAmt(trans.base),
        transDiscount: trans.discount,
        extra: fmtAmt(extra.net),
        extraGross: fmtAmt(extra.base),
        fine: fmtAmt(fineNum),
        total: fmtAmt(netTotalNum),
        totalGross: fmtAmt(totalGrossNum),
        totalDiscount: fmtAmt(totalDiscountNum),
        totalDiscountNum,
        paid: fmtAmt(paidNum),
        pending: fmtAmt(pendingNum),
        status: statusVal
      }
    }

    // 1. Gather all actual registered students from localStorage and DB
    let registeredStudents: any[] = []
    if (typeof window !== 'undefined') {
      const savedStudentsRaw = localStorage.getItem('school_students')
      if (savedStudentsRaw) {
        try {
          const list = JSON.parse(savedStudentsRaw)
          if (Array.isArray(list)) registeredStudents = list
        } catch (e) {}
      }
    }

    // Merge with DB students
    try {
      const res = await fetchStudents()
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const merged: any[] = []
        const seen = new Set<string>()

        // Keep local students first (rich form details like promo codes & fee structures)
        registeredStudents.forEach(stu => {
          const key = String(stu.admission_no || stu.admissionNo || stu.id).trim().toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(stu)
          }
        })

        // Add any DB students not yet present
        res.data.forEach(dbStu => {
          const key = String(dbStu.admission_no || dbStu.id).trim().toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(dbStu)
          }
        })
        registeredStudents = merged
      }
    } catch (e) {}

    // Deduplicate actual registered students so each appears strictly ONCE
    const uniqueStudents: any[] = []
    const seenAdm = new Set<string>()
    registeredStudents.forEach(s => {
      const key = String(s.admission_no || s.admissionNo || s.id || s.name).trim().toLowerCase()
      if (!seenAdm.has(key)) {
        seenAdm.add(key)
        uniqueStudents.push(s)
      }
    })

    // Read saved fee payments from localStorage
    let existingFeesList: any[] = []
    if (typeof window !== 'undefined') {
      const savedAllFees = localStorage.getItem('school_all_fees')
      if (savedAllFees) {
        try {
          const parsed = JSON.parse(savedAllFees)
          if (Array.isArray(parsed)) existingFeesList = parsed
        } catch (e) {}
      }
    }

    let combined: StudentFeeItem[] = []

    if (uniqueStudents.length > 0) {
      // Build exactly ONE fee record per registered student (prunes ghost/orphan records!)
      combined = uniqueStudents.map((stu, i) => {
        const existingFee = existingFeesList.find(f =>
          (f.id && String(f.id).trim() === String(stu.id).trim()) ||
          (f.admissionNo && String(f.admissionNo).trim().toLowerCase() === String(stu.admission_no || stu.admissionNo).trim().toLowerCase()) ||
          (f.name && stu.name && f.name.trim().toLowerCase() === stu.name.trim().toLowerCase())
        )

        const calc = computeStudentHeads(existingFee || {}, stu)
        const stuId = stu.id || stu.admission_no || stu.admissionNo || `stu-${i + 1}`

        return {
          id: stuId,
          class: stu.class || (stu.class_name ? stu.class_name.replace(/\s*\([^)]*\)/, '').trim() : 'Class VII'),
          section: stu.section || (stu.class_name ? stu.class_name.match(/\(([^)]+)\)/)?.[1] || 'Section A' : (stu.section_name ? `Section ${stu.section_name}` : 'Section A')),
          name: `${stu.first_name || stu.firstName || ''} ${stu.last_name || stu.lastName || ''}`.trim() || stu.name || 'Student',
          admissionNo: stu.admission_no || stu.admissionNo || `ADM-${i + 101}`,
          rollNo: stu.roll_no || stu.rollNo || '1',
          paymentMode: stu.paymentMode || existingFee?.paymentMode || 'Cash',
          receiptNo: stu.receiptNo || existingFee?.receiptNo || '',
          paymentDate: stu.paymentDate || existingFee?.paymentDate || '',
          remarks: stu.remarks || existingFee?.remarks || '',
          classFeePromo: stu.classFeePromo || existingFee?.classFeePromo,
          regFeePromo: stu.regFeePromo || existingFee?.regFeePromo,
          transFeePromo: stu.transFeePromo || existingFee?.transFeePromo,
          ...stu,
          ...(existingFee || {}),
          ...calc
        }
      })
    } else {
      // Fallback sample records ONLY if zero registered students exist
      combined = [...DEFAULT_STUDENT_FEES]
    }

    setFeeRecords(combined)
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_all_fees', JSON.stringify(combined))
    }

    // Load available class list
    const classes = Array.from(new Set(combined.map(c => c.class).filter(Boolean)))
    setClassList(classes.length > 0 ? classes : ['Class VII', 'Class VIII', 'Class IX', 'Class 1'])
    setLoading(false)
  }

  useEffect(() => {
    loadFeeCollectionData()
  }, [])

  // Dynamic Statistics
  const stats = useMemo(() => {
    let totalPaidSum = 0
    let totalPendingSum = 0
    let paidCount = 0
    let pendingCount = 0
    let overdueCount = 0

    feeRecords.forEach(r => {
      const pAmt = parseAmt(r.paid)
      const dAmt = parseAmt(r.pending)
      totalPaidSum += pAmt
      totalPendingSum += dAmt

      if (r.status === 'Paid') {
        paidCount++
      } else if (r.status === 'Partial') {
        pendingCount++
      } else {
        pendingCount++
        overdueCount++
      }
    })

    return {
      totalPaidSum,
      totalPendingSum,
      paidCount,
      pendingCount,
      overdueCount,
      totalStudents: feeRecords.length
    }
  }, [feeRecords])

  // Filtered Records based on Tab, Search, Year, Class, Section
  const filteredRecords = useMemo(() => {
    return feeRecords.filter(item => {
      // Tab filter
      if (activeTab === 'Paid Student' && item.status !== 'Paid') return false
      if (activeTab === 'Pending Student' && item.status === 'Paid') return false

      // Class filter
      if (filterClass !== 'All' && item.class !== filterClass) return false

      // Section filter
      if (filterSection !== 'All' && !item.section.toLowerCase().includes(filterSection.toLowerCase())) return false

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.class.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          (item.admissionNo && item.admissionNo.toLowerCase().includes(q)) ||
          (item.rollNo && item.rollNo.toLowerCase().includes(q)) ||
          (item.receiptNo && item.receiptNo.toLowerCase().includes(q))
        if (!matches) return false
      }

      return true
    })
  }, [feeRecords, activeTab, filterClass, filterSection, searchQuery])

  // Open Collect Fee / Pay Now Modal
  const handleOpenPayModal = (student: StudentFeeItem) => {
    setPayModalStudent(student)
  }

  // Handle successful fee payment from wizard
  const handlePaymentSuccess = (updatedStudent: StudentFeeItem) => {
    const updatedList = feeRecords.map(item => {
      if (
        String(item.id).trim() === String(updatedStudent.id).trim() ||
        String(item.admissionNo).trim().toLowerCase() === String(updatedStudent.admissionNo).trim().toLowerCase() ||
        (item.name && updatedStudent.name && item.name.trim().toLowerCase() === updatedStudent.name.trim().toLowerCase())
      ) {
        return {
          ...item,
          ...updatedStudent,
          status: 'Paid' as const,
          paid: updatedStudent.paid || updatedStudent.total,
          pending: '0/-',
          receiptNo: updatedStudent.receiptNo || `REC-2026-${Date.now().toString().slice(-5)}`,
          paymentDate: updatedStudent.paymentDate || new Date().toISOString().split('T')[0]
        }
      }
      return item
    })

    setFeeRecords(updatedList)
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_all_fees', JSON.stringify(updatedList))

      const savedStudents = localStorage.getItem('school_students')
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents)
          if (Array.isArray(parsed)) {
            const syncStudents = parsed.map((s: any) => {
              if (
                String(s.id).trim() === String(updatedStudent.id).trim() ||
                String(s.admission_no || s.admissionNo).trim().toLowerCase() === String(updatedStudent.admissionNo).trim().toLowerCase() ||
                (s.name && updatedStudent.name && s.name.trim().toLowerCase() === updatedStudent.name.trim().toLowerCase())
              ) {
                return {
                  ...s,
                  fees_status: 'Paid',
                  paid: updatedStudent.paid || updatedStudent.total,
                  pending: '0/-',
                  status: 'Active',
                  receiptNo: updatedStudent.receiptNo,
                  paymentDate: updatedStudent.paymentDate
                }
              }
              return s
            })
            localStorage.setItem('school_students', JSON.stringify(syncStudents))
          }
        } catch (e) {}
      }
    }

    setPayModalStudent(null)
    // Open receipt modal automatically
    setSelectedRecordForReceipt(updatedStudent)
    toast.success('Fee payment completed successfully!')
  }

  // Void/Reset Fee Payment
  const handleResetPayment = (student: StudentFeeItem) => {
    if (confirm(`Are you sure you want to void payment record for "${student.name}" and reset status to Unpaid?`)) {
      const updatedList = feeRecords.map(item => {
        if (
          String(item.id).trim() === String(student.id).trim() ||
          String(item.admissionNo).trim().toLowerCase() === String(student.admissionNo).trim().toLowerCase()
        ) {
          return {
            ...item,
            status: 'Unpaid' as const,
            paid: '0/-',
            pending: item.total,
            receiptNo: '',
            paymentDate: ''
          }
        }
        return item
      })

      setFeeRecords(updatedList)
      if (typeof window !== 'undefined') {
        localStorage.setItem('school_all_fees', JSON.stringify(updatedList))
        const savedStudents = localStorage.getItem('school_students')
        if (savedStudents) {
          try {
            const parsed = JSON.parse(savedStudents)
            if (Array.isArray(parsed)) {
              const syncStudents = parsed.map((s: any) => {
                if (
                  String(s.id).trim() === String(student.id).trim() ||
                  String(s.admission_no || s.admissionNo).trim().toLowerCase() === String(student.admissionNo).trim().toLowerCase()
                ) {
                  return {
                    ...s,
                    fees_status: 'Unpaid',
                    paid: '0/-',
                    pending: student.total,
                    receiptNo: '',
                    paymentDate: ''
                  }
                }
                return s
              })
              localStorage.setItem('school_students', JSON.stringify(syncStudents))
            }
          } catch (e) {}
        }
      }
      toast.success(`Payment record voided for ${student.name}`)
    }
  }

  // Delete Orphan/Unwanted Fee Record
  const handleDeleteFeeRecord = (student: StudentFeeItem) => {
    if (confirm(`Are you sure you want to remove fee record for "${student.name}"?`)) {
      const updatedList = feeRecords.filter(item => 
        String(item.id).trim() !== String(student.id).trim() &&
        String(item.admissionNo).trim().toLowerCase() !== String(student.admissionNo).trim().toLowerCase()
      )
      setFeeRecords(updatedList)
      if (typeof window !== 'undefined') {
        localStorage.setItem('school_all_fees', JSON.stringify(updatedList))
      }
      toast.success('Fee record removed successfully')
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'S. No.', 'Class', 'Section', 'Student Name', 'Admission No',
      'Registration Fee', 'Admission Fee', 'Class Fee', 'Library Fee', 'Exam Fee',
      'Hostel Fee', 'Transportation Fee', 'Extra Curricular Fee', 'Total Fine',
      'Pending Fee', 'Total Fee', 'Status', 'Payment Mode', 'Receipt No'
    ]

    const rows = filteredRecords.map((r, idx) => [
      idx + 1,
      `"${r.class}"`,
      `"${r.section}"`,
      `"${r.name}"`,
      `"${r.admissionNo || ''}"`,
      `"${r.reg}"`,
      `"${r.adm}"`,
      `"${r.classFee}"`,
      `"${r.lib}"`,
      `"${r.exam}"`,
      `"${r.hostel}"`,
      `"${r.trans}"`,
      `"${r.extra}"`,
      `"${r.fine}"`,
      `"${r.pending}"`,
      `"${r.total}"`,
      `"${r.status}"`,
      `"${r.paymentMode || ''}"`,
      `"${r.receiptNo || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `student_fee_collection_${activeTab.toLowerCase().replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Fee collection statement exported!')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#0f766e]" />
              <span>Student Fee Collection</span>
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Live Collection Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Collect, track and verify all configured student fees including admission, class, library, exam, transportation &amp; extra fees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[#0f766e] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export fee collection data to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── FEES MANAGEMENT OVERVIEW & METRICS ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Fees Management</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
              Session {filterYear}
            </span>
          </h2>
          <div className="text-xs text-slate-400 font-semibold">
            Total Students: <strong className="text-slate-700 dark:text-slate-200">{stats.totalStudents}</strong>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col shadow-xs bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Fees Collection Trend</h3>
                <span className="text-[11px] text-slate-400">Monthly collection summary &amp; milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Total Collected: ₹{stats.totalPaidSum.toLocaleString('en-IN')}/-
                </span>
              </div>
            </div>
            
            {/* SVG Interactive Chart */}
            <div className="flex-1 relative min-h-[200px] w-full mt-2">
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 font-semibold pb-6 pointer-events-none">
                <div className="border-b border-slate-200/60 dark:border-slate-700/60 w-full flex items-center justify-between">
                  <span className="-mt-2">₹75,000</span>
                </div>
                <div className="border-b border-slate-200/60 dark:border-slate-700/60 w-full flex items-center justify-between">
                  <span className="-mt-2">₹50,000</span>
                </div>
                <div className="border-b border-slate-200/60 dark:border-slate-700/60 w-full flex items-center justify-between">
                  <span className="-mt-2">₹25,000</span>
                </div>
                <div className="border-b border-slate-200/60 dark:border-slate-700/60 w-full flex items-center justify-between">
                  <span className="-mt-2">₹0</span>
                </div>
              </div>
              
              {/* Chart Line & Area */}
              <div className="absolute inset-0 ml-10 mb-6 overflow-hidden">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="feeChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  
                  {/* Highlight bar for current month */}
                  <rect x="740" y="25" width="22" height="175" fill="#ccfbf1" rx="4" opacity="0.6" />
                  
                  {/* Path for area */}
                  <path d="M0,140 Q60,110 120,115 T240,150 T360,80 T480,50 T600,125 T720,70 T840,40 T960,60 L1000,70 L1000,200 L0,200 Z" fill="url(#feeChartGradient)" />
                  
                  {/* Path for line */}
                  <path d="M0,140 Q60,110 120,115 T240,150 T360,80 T480,50 T600,125 T720,70 T840,40 T960,60 L1000,70" fill="none" stroke="#0f766e" strokeWidth="3.5" />
                  
                  {/* Data points */}
                  <circle cx="120" cy="115" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="240" cy="150" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="360" cy="80" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="480" cy="50" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="600" cy="125" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="720" cy="70" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="751" cy="40" r="6" fill="#0f766e" stroke="white" strokeWidth="2.5" />
                  <circle cx="840" cy="40" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                  <circle cx="960" cy="60" r="4" fill="white" stroke="#0f766e" strokeWidth="2.5" />
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span className="text-teal-700 font-black">Nov (Cur)</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Fee Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between shadow-xs bg-slate-50/40 dark:bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Fee Collection Status</h3>
                <span className="text-[11px] text-slate-400">Total student dues &amp; compliance</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {stats.totalStudents} Enrolled
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1 justify-center">
              {/* Paid Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200/70 bg-white dark:bg-slate-800 shadow-2xs">
                <div>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {stats.paidCount} Students
                  </span>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    ₹{stats.totalPaidSum.toLocaleString('en-IN')}/- collected
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Paid
                </span>
              </div>

              {/* Pending Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200/70 bg-white dark:bg-slate-800 shadow-2xs">
                <div>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {stats.pendingCount} Students
                  </span>
                  <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                    ₹{stats.totalPendingSum.toLocaleString('en-IN')}/- awaiting
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Pending
                </span>
              </div>

              {/* Overdue Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200/70 bg-white dark:bg-slate-800 shadow-2xs">
                <div>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {stats.overdueCount} Students
                  </span>
                  <div className="text-[10px] text-rose-500 font-bold mt-0.5">
                    Immediate reminder required
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Overdue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE SECTION: ALL FEE COLLECTION DATA ACCORDING TO STUDENT FEE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-5">
        
        {/* Title & Search / Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>All Fee Collection Data</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0f766e] border border-teal-200">
                {filteredRecords.length} Students
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live student fees breakdown: Registration, Admission, Class, Library, Exam, Hostel, Transport, Extra &amp; Fine
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Class, Roll No..." 
                className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs and Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-b border-slate-100 dark:border-slate-700 py-3">
          {/* Dynamic Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('All Fee Data')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeTab === 'All Fee Data'
                  ? 'bg-fuchsia-100 dark:bg-fuchsia-950/50 text-fuchsia-800 dark:text-fuchsia-200 border-fuchsia-300 font-black shadow-2xs'
                  : 'bg-fuchsia-50/50 dark:bg-fuchsia-950/20 text-fuchsia-600 border-fuchsia-100 hover:bg-fuchsia-100'
              }`}
            >
              <span>All Fee Data</span>
              <span className="bg-white dark:bg-slate-800 text-fuchsia-700 dark:text-fuchsia-300 px-2 py-0.5 rounded-md text-[10px] font-black border border-fuchsia-200">
                {String(feeRecords.length).padStart(2, '0')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Paid Student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeTab === 'Paid Student'
                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border-blue-300 font-black shadow-2xs'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 border-blue-100 hover:bg-blue-100'
              }`}
            >
              <span>Paid Student</span>
              <span className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md text-[10px] font-black border border-blue-200">
                {stats.paidCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Pending Student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeTab === 'Pending Student'
                  ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-300 font-black shadow-2xs'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 border-rose-100 hover:bg-rose-100'
              }`}
            >
              <span>Pending Student</span>
              <span className="bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md text-[10px] font-black border border-rose-200">
                {stats.pendingCount}
              </span>
            </button>
          </div>

          {/* Academic Year, Class, Section Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>

            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              {classList.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>

            {(filterClass !== 'All' || filterSection !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilterClass('All')
                  setFilterSection('All')
                  setSearchQuery('')
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ── COMPLETE STUDENT FEE TABLE (ALL STUDENT FEE HEADS) ── */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 relative no-scrollbar">
          <table className="w-full text-[11px] text-center border-collapse whitespace-nowrap">
            <thead className="bg-slate-900 text-white font-black border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3.5 text-left w-12">S. No.</th>
                <th className="px-3 py-3.5">Class</th>
                <th className="px-3 py-3.5">Section</th>
                <th className="px-4 py-3.5 text-left">Student Name</th>
                <th className="px-3 py-3.5">Registration Fee</th>
                <th className="px-3 py-3.5">Admission Fee</th>
                <th className="px-3 py-3.5">Class Fee</th>
                <th className="px-3 py-3.5">Library Fee</th>
                <th className="px-3 py-3.5">Exam Fee</th>
                <th className="px-3 py-3.5">Hostel Fee</th>
                <th className="px-3 py-3.5">Transport Fee</th>
                <th className="px-3 py-3.5">Extra Fee</th>
                <th className="px-3 py-3.5 text-rose-300">Fine</th>
                <th className="px-3 py-3.5 text-amber-300 bg-amber-950/20 font-black">Pending Fee</th>
                <th className="px-3 py-3.5 text-teal-300 bg-teal-950/20 font-black">Total Fee</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Receipt</th>
                <th className="px-3 py-3.5">Collect Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400 font-bold">
                    Loading student fee collection data...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400 font-semibold">
                    No student fee records found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((student, i) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-3 py-3.5 text-slate-400 font-medium text-left">{i + 1}.</td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold">{student.class}</td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-400">{student.section}</td>
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-black text-slate-900 dark:text-slate-100 text-xs">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        ID: {student.admissionNo || student.rollNo || `ADM-${i + 101}`}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold">
                      <div>
                        <span>{student.reg}</span>
                        {student.regDiscount > 0 && (
                          <span className="block text-[9px] text-emerald-600 font-bold">
                            (-₹{student.regDiscount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold">
                      <div>
                        <span>{student.adm}</span>
                        {student.admDiscount > 0 && (
                          <span className="block text-[9px] text-emerald-600 font-bold">
                            (-₹{student.admDiscount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold">
                      <div>
                        <span>{student.classFee}</span>
                        {student.classFeeDiscount > 0 && (
                          <span className="block text-[9px] text-emerald-600 font-bold">
                            (-₹{student.classFeeDiscount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{student.lib}</td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{student.exam}</td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{student.hostel || '0/-'}</td>
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold">
                      <div>
                        <span>{student.trans || '0/-'}</span>
                        {student.transDiscount > 0 && (
                          <span className="block text-[9px] text-emerald-600 font-bold">
                            (-₹{student.transDiscount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">{student.extra || '0/-'}</td>
                    <td className="px-3 py-3.5 text-rose-600 font-bold">{student.fine || '0/-'}</td>
                    
                    {/* Pending Fee */}
                    <td className="px-3 py-3.5 text-amber-600 dark:text-amber-400 font-black bg-amber-50/30 dark:bg-amber-950/10">
                      {student.pending}
                    </td>

                    {/* Total Fee */}
                    <td className="px-3 py-3.5 text-teal-700 dark:text-teal-300 font-black bg-teal-50/30 dark:bg-teal-950/10">
                      <div>
                        <span>{student.total}</span>
                        {student.totalDiscountNum > 0 && (
                          <span className="block text-[9px] text-emerald-600 font-bold">
                            Saved ₹{student.totalDiscountNum}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                        student.status === 'Paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                          : student.status === 'Partial'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                      }`}>
                        ● {student.status}
                      </span>
                    </td>

                    {/* Receipt Button */}
                    <td className="px-3 py-3.5">
                      {student.status === 'Paid' || parseAmt(student.paid) > 0 ? (
                        <button 
                          type="button"
                          onClick={() => setSelectedRecordForReceipt(student)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 hover:bg-teal-100 font-bold text-[11px] border border-teal-200 dark:border-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="View & Print Full Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>

                    {/* Payment / Collect Fee Action */}
                    <td className="px-3 py-3.5">
                      {student.status === 'Paid' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-emerald-600 font-black text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Paid ✓</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleOpenPayModal(student)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-[#0f766e] hover:bg-teal-50 border border-teal-200 cursor-pointer"
                            title="Collect Advance / Next Month Fee"
                          >
                            + Advance
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetPayment(student)}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                            title="Void Payment & Reset to Unpaid"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => handleOpenPayModal(student)}
                            className="px-3 py-1.5 rounded-lg bg-[#0f766e] hover:bg-teal-700 text-white font-black text-[10px] uppercase tracking-wider transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>{student.status === 'Partial' ? 'Pay Due' : 'Collect Fee'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFeeRecord(student)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Remove Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 pt-2">
          <span>Showing 1 to {filteredRecords.length} of {feeRecords.length} student fee records</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronsLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg bg-[#0f766e] text-white font-black text-xs shadow-xs">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"><ChevronsRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ── COLLECT STUDENT FEE MULTI-STEP WIZARD (ACCORDING TO STUDENT PROFILE) ── */}
      {/* ========================================================================= */}
      {payModalStudent && (
        <FeeCollectionWizardModal
          student={payModalStudent}
          onClose={() => setPayModalStudent(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ========================================================================= */}
      {/* ── ITEMIZED FEE BREAKDOWN & PRINTABLE RECEIPT MODAL ── */}
      {/* ========================================================================= */}
      {selectedRecordForReceipt && (
        <FeeReceiptModal
          record={selectedRecordForReceipt}
          onClose={() => setSelectedRecordForReceipt(null)}
        />
      )}

    </div>
  )
}

export function FeeReceiptModal({ record, onClose }: { record: StudentFeeItem; onClose: () => void }) {
  const parseNum = (val: any): number => {
    if (!val) return 0
    const str = String(val).replace(/[^0-9.]/g, '')
    return parseFloat(str) || 0
  }

  // 1. Resolve full student profile from school_students (to get promo codes & configured fees)
  let fullStudent: any = record
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('school_students')
    if (raw) {
      try {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const match = list.find((s: any) =>
            (record.id && String(s.id) === String(record.id)) ||
            (record.admissionNo && String(s.admission_no || s.admissionNo) === String(record.admissionNo)) ||
            (record.name && s.name && s.name.trim().toLowerCase() === record.name.trim().toLowerCase()) ||
            (record.name && (s.first_name || s.firstName) && `${s.first_name || s.firstName} ${s.last_name || s.lastName || ''}`.trim().toLowerCase() === record.name.trim().toLowerCase())
          )
          if (match) {
            fullStudent = { ...match, ...record }
          }
        }
      } catch (e) {}
    }
  }

  // 2. Resolve Class Fee: if missing, look up school_class_fees master
  let resolvedClassFee = parseNum(record.classFee || fullStudent.classFee || fullStudent.class_fee)
  if (resolvedClassFee === 0 && fullStudent.isRteStudent !== 'Yes') {
    try {
      const rawMaster = typeof window !== 'undefined' ? localStorage.getItem('school_class_fees') : null
      if (rawMaster) {
        const list = JSON.parse(rawMaster)
        if (Array.isArray(list) && list.length > 0) {
          const target = (record.class || fullStudent.class || 'Class 1').trim().toLowerCase()
          const found = list.find((c: any) => 
            (c.className && c.className.toLowerCase() === target) ||
            (c.name && c.name.toLowerCase() === target) ||
            (c.className && c.className.toLowerCase() === 'all')
          )
          if (found) {
            resolvedClassFee = parseFloat(found.monthly || found.oneTime || found.amount || '1000') || 1000
          } else if (list[0].monthly || list[0].oneTime) {
            resolvedClassFee = parseFloat(list[0].monthly || list[0].oneTime) || 1000
          }
        }
      }
    } catch (e) {}
    if (resolvedClassFee === 0) resolvedClassFee = 1000 // Standard class tuition fee fallback
  }

  // 3. Helper to calculate promo discount for any fee head
  const calcPromoDiscount = (baseAmount: number, promoCode?: string) => {
    if (!promoCode || baseAmount <= 0) {
      return { discount: 0, tag: '', promoCode: '' }
    }
    const cleanPromo = promoCode.trim().toUpperCase()
    let discount = 0
    let tag = ''

    // Check school_masters_discounts
    try {
      const rawDiscounts = typeof window !== 'undefined' ? localStorage.getItem('school_masters_discounts') : null
      if (rawDiscounts) {
        const list = JSON.parse(rawDiscounts)
        if (Array.isArray(list)) {
          const found = list.find((d: any) =>
            (d.promoCode && d.promoCode.trim().toUpperCase() === cleanPromo) ||
            (d.name && d.name.trim().toUpperCase() === cleanPromo) ||
            (d.headName && d.headName.trim().toUpperCase() === cleanPromo)
          )
          if (found) {
            if (found.valueType === 'Percentage' || (!found.valueType && found.percentage && found.percentage !== '0')) {
              const p = parseFloat(found.percentage) || 0
              discount = Math.round((baseAmount * p) / 100)
              tag = `${found.promoCode || promoCode} (${p}% Off - ₹${discount})`
            } else {
              const amt = parseFloat(found.amount) || 0
              discount = Math.min(baseAmount, amt)
              tag = `${found.promoCode || promoCode} (₹${amt} Flat Off)`
            }
            return { discount, tag, promoCode: found.promoCode || promoCode }
          }
        }
      }
    } catch (e) {}

    // Parse from promo code string (e.g. NEW20 -> 20%, 500OFF -> 500)
    const numMatch = cleanPromo.match(/\d+/)
    if (numMatch) {
      const val = parseFloat(numMatch[0])
      if (cleanPromo.includes('%') || val <= 100) {
        discount = Math.round((baseAmount * val) / 100)
        tag = `${promoCode} (${val}% Off - ₹${discount})`
      } else {
        discount = Math.min(baseAmount, val)
        tag = `${promoCode} (-₹${discount} Off)`
      }
    } else {
      discount = Math.round(baseAmount * 0.1)
      tag = `${promoCode} (10% Off - ₹${discount})`
    }

    return { discount, tag, promoCode }
  }

  interface ReceiptHeadItem {
    name: string
    details: string
    grossAmt: number
    discountAmt: number
    netAmt: number
    promoCode?: string
    promoTag?: string
  }

  const items: ReceiptHeadItem[] = []
  const appliedPromos: string[] = []

  // Class Fee (ALWAYS SHOWING)
  if (resolvedClassFee > 0) {
    const promo = fullStudent.classFeePromo || fullStudent.classPromo || fullStudent.promocode || fullStudent.promoCode
    const { discount, tag, promoCode } = calcPromoDiscount(resolvedClassFee, promo)
    if (promoCode) appliedPromos.push(promoCode)
    const net = Math.max(0, resolvedClassFee - discount)
    items.push({
      name: 'Class Fee',
      details: fullStudent.classFeeDuration ? `Tuition fee (${fullStudent.classFeeDuration})` : 'Tuition & class curriculum fee',
      grossAmt: resolvedClassFee,
      discountAmt: discount,
      netAmt: net,
      promoCode,
      promoTag: tag
    })
  }

  // Registration Fee
  const regNum = parseNum(record.reg || fullStudent.regFee || fullStudent.reg)
  if (regNum > 0) {
    const promo = fullStudent.regFeePromo || fullStudent.regPromo || fullStudent.promocode || fullStudent.promoCode
    const { discount, tag, promoCode } = calcPromoDiscount(regNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    const net = Math.max(0, regNum - discount)
    items.push({
      name: 'Registration Fee',
      details: 'One-time registration fee',
      grossAmt: regNum,
      discountAmt: discount,
      netAmt: net,
      promoCode,
      promoTag: tag
    })
  }

  // Admission Fee
  const admNum = parseNum(record.adm || fullStudent.admFee || fullStudent.adm)
  if (admNum > 0) {
    const promo = fullStudent.admFeePromo || fullStudent.admPromo
    const { discount, tag, promoCode } = calcPromoDiscount(admNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    const net = Math.max(0, admNum - discount)
    items.push({
      name: 'Admission Fee',
      details: 'Standard admission fee',
      grossAmt: admNum,
      discountAmt: discount,
      netAmt: net,
      promoCode,
      promoTag: tag
    })
  }

  // Transportation Fee
  const transNum = parseNum(record.trans || fullStudent.transFee || fullStudent.trans)
  if (transNum > 0) {
    const promo = fullStudent.transFeePromo || fullStudent.transPromo
    const { discount, tag, promoCode } = calcPromoDiscount(transNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    const net = Math.max(0, transNum - discount)
    const route = [fullStudent.transRoute, fullStudent.transStoppage].filter(Boolean).join(' • ')
    items.push({
      name: 'Transportation Fee',
      details: route ? `School bus transport (${route})` : 'School bus transport',
      grossAmt: transNum,
      discountAmt: discount,
      netAmt: net,
      promoCode,
      promoTag: tag
    })
  }

  // Library Fee
  const libNum = parseNum(record.lib || fullStudent.libFee || fullStudent.lib)
  if (libNum > 0) {
    const promo = fullStudent.libFeePromo || fullStudent.libPromo
    const { discount, tag, promoCode } = calcPromoDiscount(libNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    items.push({
      name: 'Library Fee',
      details: 'Annual library & books access',
      grossAmt: libNum,
      discountAmt: discount,
      netAmt: Math.max(0, libNum - discount),
      promoCode,
      promoTag: tag
    })
  }

  // Exam Fee
  const examNum = parseNum(record.exam || fullStudent.examFee || fullStudent.exam)
  if (examNum > 0) {
    const promo = fullStudent.examFeePromo || fullStudent.examPromo
    const { discount, tag, promoCode } = calcPromoDiscount(examNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    items.push({
      name: 'Exam Fee',
      details: 'Examinations, test papers & marksheets',
      grossAmt: examNum,
      discountAmt: discount,
      netAmt: Math.max(0, examNum - discount),
      promoCode,
      promoTag: tag
    })
  }

  // Hostel Fee
  const hostelNum = parseNum(record.hostel || fullStudent.hostelFee || fullStudent.hostel)
  if (hostelNum > 0) {
    const promo = fullStudent.hostelFeePromo || fullStudent.hostelPromo
    const { discount, tag, promoCode } = calcPromoDiscount(hostelNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    items.push({
      name: 'Hostel Fee',
      details: fullStudent.hostelType ? `Hostel room & mess (${fullStudent.hostelType})` : 'Hostel room & mess charges',
      grossAmt: hostelNum,
      discountAmt: discount,
      netAmt: Math.max(0, hostelNum - discount),
      promoCode,
      promoTag: tag
    })
  }

  // Extra Curricular Fee
  const extraNum = parseNum(record.extra || fullStudent.extraFee || fullStudent.extra)
  if (extraNum > 0) {
    const promo = fullStudent.extraFeePromo || fullStudent.extraPromo
    const { discount, tag, promoCode } = calcPromoDiscount(extraNum, promo)
    if (promoCode) appliedPromos.push(promoCode)
    items.push({
      name: 'Extra Curricular Fee',
      details: fullStudent.extraActivityName ? `Activities & sports (${fullStudent.extraActivityName})` : 'Sports, activities & club fees',
      grossAmt: extraNum,
      discountAmt: discount,
      netAmt: Math.max(0, extraNum - discount),
      promoCode,
      promoTag: tag
    })
  }

  // Fine
  const fineNum = parseNum(record.fine || fullStudent.fine)
  if (fineNum > 0) {
    items.push({
      name: 'Fine / Late Fee',
      details: 'Late fee adjustment',
      grossAmt: fineNum,
      discountAmt: 0,
      netAmt: fineNum
    })
  }

  // Check general promo code / discount head from student profile
  const generalPromo = fullStudent.promocode || fullStudent.promoCode || fullStudent.discountHead
  const generalDiscountAmt = parseNum(fullStudent.discountAmount || fullStudent.discount)
  if (generalPromo && generalDiscountAmt > 0 && items.every(it => it.discountAmt === 0)) {
    appliedPromos.push(generalPromo)
    items.push({
      name: 'Promo Code Discount',
      details: `Discount applied via promo code ${generalPromo}`,
      grossAmt: 0,
      discountAmt: generalDiscountAmt,
      netAmt: -generalDiscountAmt,
      promoCode: generalPromo,
      promoTag: `${generalPromo} (-₹${generalDiscountAmt})`
    })
  }

  // Deduplicate applied promo codes
  const uniqueAppliedPromos = Array.from(new Set(appliedPromos))

  const totalGross = items.reduce((sum, item) => sum + item.grossAmt, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmt, 0)
  const totalNet = Math.max(0, totalGross - totalDiscount)
  const paidNum = parseNum(record.paid) || (record.status === 'Paid' ? totalNet : 0)
  const dueNum = Math.max(0, totalNet - paidNum)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-[#0f766e] flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Student Fee Receipt &mdash; {record.name}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  record.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : record.status === 'Partial'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  ● {record.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Class: {record.class} &bull; Section: {record.section} &bull; Admission No: {record.admissionNo || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Summary Metric Cards with Promo Discount */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Configured Fee</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1 block">₹{totalGross.toLocaleString('en-IN')}/-</span>
            </div>

            {totalDiscount > 0 ? (
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" /> Promo Discount
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  -₹{totalDiscount.toLocaleString('en-IN')}/-
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Paid</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block">₹{paidNum.toLocaleString('en-IN')}/-</span>
              </div>
            )}

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Due Amount</span>
              <span className="text-lg font-black text-amber-600 mt-1 block">₹{dueNum.toLocaleString('en-IN')}/-</span>
            </div>

            <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Receipt / TXN Ref</span>
              <span className="text-xs font-mono font-bold text-teal-800 dark:text-teal-200 mt-1.5 block">{record.receiptNo || 'REC-SETTLED'}</span>
            </div>
          </div>

          {/* Promo Code Notification Banner */}
          {totalDiscount > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-semibold shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-emerald-900 dark:text-emerald-100">Promo Code Discount Applied:</span>
                  <span className="ml-1.5 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {uniqueAppliedPromos.length > 0 ? uniqueAppliedPromos.join(', ') : 'Student Promo'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200">
                Saved: ₹{totalDiscount.toLocaleString('en-IN')}/-
              </span>
            </div>
          )}

          {/* Itemized Fee Structure Table */}
          <div>
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2.5 uppercase tracking-wider">
              Itemized Fee Heads Breakdown
            </h3>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5 w-10">#</th>
                    <th className="py-3 px-3.5">Fee Head</th>
                    <th className="py-3 px-3.5">Description / Duration</th>
                    <th className="py-3 px-3.5 text-right">Gross Fee</th>
                    <th className="py-3 px-3.5 text-right text-emerald-300">Promo Discount</th>
                    <th className="py-3 px-3.5 text-right text-teal-300">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3.5 text-slate-400">{idx + 1}.</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-100">
                        {it.name}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 font-normal">
                        <div>{it.details}</div>
                        {it.promoTag && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-black">
                            <Tag className="w-2.5 h-2.5" />
                            <span>Promo: {it.promoTag}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right text-slate-500 font-medium">
                        {it.discountAmt > 0 ? (
                          <span className="line-through text-slate-400">₹{it.grossAmt.toLocaleString('en-IN')}/-</span>
                        ) : (
                          <span>₹{it.grossAmt.toLocaleString('en-IN')}/-</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {it.discountAmt > 0 ? (
                          <span>-₹{it.discountAmt.toLocaleString('en-IN')}/-</span>
                        ) : (
                          <span className="text-slate-400 font-normal">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-teal-700 dark:text-teal-300">
                        ₹{it.netAmt.toLocaleString('en-IN')}/-
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 font-bold text-slate-700 dark:text-slate-200">
                  {totalDiscount > 0 && (
                    <>
                      <tr>
                        <td colSpan={5} className="py-2 px-3.5 text-right text-slate-500">Gross Total Scheduled Fee:</td>
                        <td className="py-2 px-3.5 text-right font-bold text-slate-700 dark:text-slate-300">₹{totalGross.toLocaleString('en-IN')}/-</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="py-2 px-3.5 text-right text-emerald-600 font-bold">Total Promo Code Discount:</td>
                        <td className="py-2 px-3.5 text-right font-black text-emerald-600">-₹{totalDiscount.toLocaleString('en-IN')}/-</td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black">
                    <td colSpan={5} className="py-3 px-3.5 text-right text-sm">Total Net Fee Payable:</td>
                    <td className="py-3 px-3.5 text-right text-[#0f766e] text-base font-black">₹{totalNet.toLocaleString('en-IN')}/-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Transaction Metadata Card */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Mode</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.paymentMode || 'Cash'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.paymentDate || '2026-11-19'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Settlement Status</span>
              <span className="font-black text-emerald-600">{record.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Promo Discount</span>
              <span className="font-bold text-emerald-600">
                {totalDiscount > 0 ? `${uniqueAppliedPromos.join(', ') || 'Promo'} (-₹${totalDiscount})` : 'None'}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs font-semibold text-slate-400">
            <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
              Authorized Cashier / Accounts
            </div>
            <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
              Parent / Student Signature
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f766e] text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// ── MULTI-STEP FEE COLLECTION WIZARD MODAL ──
// =========================================================================

export interface FeeItem {
  id: string
  headKey: string
  headName: string
  month: string
  dueDate: string
  amount: number
  baseAmount?: number
  discount?: number
  promoCode?: string
  iconType: 'class' | 'lib' | 'exam' | 'hostel' | 'trans' | 'extra' | 'reg' | 'adm' | 'fine'
  isPaid?: boolean
}

export interface MonthGroup {
  month: string
  dueDate: string
  isOverdue?: boolean
  items: FeeItem[]
  monthTotal: number
}

export function isDatePassed(dateStr: string): boolean {
  if (!dateStr) return false
  const parts = dateStr.split('-')
  let dueTime = 0
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const mIdx = monthNames.indexOf(parts[1].toLowerCase())
    const year = parseInt(parts[2], 10)
    if (mIdx >= 0 && !isNaN(day) && !isNaN(year)) {
      dueTime = new Date(year, mIdx, day, 23, 59, 59).getTime()
    } else {
      dueTime = new Date(dateStr).getTime()
    }
  } else {
    dueTime = new Date(dateStr).getTime()
  }
  return dueTime < Date.now()
}

export function buildStudentMonthlySchedule(student: StudentFeeItem): MonthGroup[] {
  const parseAmt = (val: any): number => {
    if (!val) return 0
    const str = String(val).replace(/[^0-9.]/g, '')
    return parseFloat(str) || 0
  }

  // Look up full student profile to ensure all fee heads and promo codes are available
  let rawStudent: any = student
  if (typeof window !== 'undefined') {
    try {
      const rawStudents = localStorage.getItem('school_students')
      if (rawStudents) {
        const list = JSON.parse(rawStudents)
        if (Array.isArray(list)) {
          const matched = list.find((s: any) =>
            (student.id && String(s.id).trim() === String(student.id).trim()) ||
            (student.admissionNo && String(s.admission_no || s.admissionNo).trim().toLowerCase() === String(student.admissionNo).trim().toLowerCase()) ||
            (student.name && s.name && s.name.trim().toLowerCase() === student.name.trim().toLowerCase())
          )
          if (matched) {
            rawStudent = { ...matched, ...rawStudent, ...matched }
          }
        }
      }
      const rawFees = localStorage.getItem('school_all_fees')
      if (rawFees) {
        const feeList = JSON.parse(rawFees)
        if (Array.isArray(feeList)) {
          const feeMatch = feeList.find((f: any) =>
            (student.id && String(f.id).trim() === String(student.id).trim()) ||
            (student.admissionNo && String(f.admissionNo || f.admission_no).trim().toLowerCase() === String(student.admissionNo).trim().toLowerCase())
          )
          if (feeMatch) {
            rawStudent = { ...feeMatch, ...rawStudent }
          }
        }
      }
    } catch (e) {}
  }

  // Promo discount calculation helper
  const calcPromoDiscount = (base: number, promo?: string): number => {
    if (!promo || base <= 0) return 0
    let pVal = 0
    let isPercent = false
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('school_masters_discounts')
        if (saved) {
          const list = JSON.parse(saved)
          if (Array.isArray(list)) {
            const matched = list.find((d: any) => 
              (d.promoCode && d.promoCode.toLowerCase() === promo.toLowerCase()) ||
              (d.name && d.name.toLowerCase() === promo.toLowerCase())
            )
            if (matched) {
              isPercent = matched.valueType === 'Percentage'
              pVal = parseFloat(isPercent ? matched.percentage : (matched.amount || matched.percentage || '0')) || 0
            }
          }
        }
      }
    } catch (e) {}

    if (!pVal) {
      const match = promo.match(/\d+/)
      if (match) {
        const extracted = parseFloat(match[0])
        if (extracted <= 100) { isPercent = true; pVal = extracted }
        else { isPercent = false; pVal = extracted }
      }
    }

    if (isPercent) return Math.round((base * (pVal || 0)) / 100)
    return Math.min(base, Math.round(pVal || 0))
  }

  // Base Fee Amounts
  const regBase = parseAmt(rawStudent.regFee || rawStudent.reg || student.reg)
  const admBase = parseAmt(rawStudent.admFee || rawStudent.adm || student.adm)
  let classBase = rawStudent.isRteStudent === 'Yes' ? 0 : parseAmt(rawStudent.classFee || rawStudent.class_fee || student.classFee)
  if (classBase === 0 && rawStudent.isRteStudent !== 'Yes') {
    if (typeof window !== 'undefined') {
      try {
        const rawClassFees = localStorage.getItem('school_class_fees')
        if (rawClassFees) {
          const list = JSON.parse(rawClassFees)
          if (Array.isArray(list) && list.length > 0) {
            const target = (student.class || 'Class 1').replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
            const found = list.find((c: any) => 
              (c.className && c.className.toLowerCase() === target) ||
              (c.name && c.name.toLowerCase() === target) ||
              (c.className && c.className.toLowerCase() === 'all')
            )
            if (found) {
              classBase = parseFloat(found.monthly || found.oneTime || found.amount || '1000') || 1000
            } else if (list[0].monthly || list[0].oneTime) {
              classBase = parseFloat(list[0].monthly || list[0].oneTime) || 1000
            }
          }
        }
      } catch (e) {}
    }
    if (classBase === 0) classBase = 1000
  }
  const libBase = parseAmt(rawStudent.libFee || rawStudent.lib || student.lib)
  const examBase = parseAmt(rawStudent.examFee || rawStudent.exam || student.exam)
  const hostelBase = parseAmt(rawStudent.hostelFee || rawStudent.hostel || student.hostel)
  const transBase = parseAmt(rawStudent.transFee || rawStudent.trans || student.trans)
  const extraBase = parseAmt(rawStudent.extraFee || rawStudent.extra || student.extra)
  const fineAmt = parseAmt(rawStudent.fine || student.fine)

  // Applied Promo Codes and Net Amounts
  const regPromo = rawStudent.regFeePromo || (student as any).regFeePromo
  const regDiscount = calcPromoDiscount(regBase, regPromo)
  const regNet = Math.max(0, regBase - regDiscount)

  const admPromo = rawStudent.admFeePromo || (student as any).admFeePromo
  const admDiscount = calcPromoDiscount(admBase, admPromo)
  const admNet = Math.max(0, admBase - admDiscount)

  const classPromo = rawStudent.classFeePromo || (student as any).classFeePromo
  const classDiscount = calcPromoDiscount(classBase, classPromo)
  const classNet = Math.max(0, classBase - classDiscount)

  const transPromo = rawStudent.transFeePromo || (student as any).transFeePromo
  const transDiscount = calcPromoDiscount(transBase, transPromo)
  const transNet = Math.max(0, transBase - transDiscount)

  const libPromo = rawStudent.libFeePromo || (student as any).libFeePromo
  const libDiscount = calcPromoDiscount(libBase, libPromo)
  const libNet = Math.max(0, libBase - libDiscount)

  const examPromo = rawStudent.examFeePromo || (student as any).examPromo
  const examDiscount = calcPromoDiscount(examBase, examPromo)
  const examNet = Math.max(0, examBase - examDiscount)

  const hostelPromo = rawStudent.hostelFeePromo || (student as any).hostelFeePromo
  const hostelDiscount = calcPromoDiscount(hostelBase, hostelPromo)
  const hostelNet = Math.max(0, hostelBase - hostelDiscount)

  const extraPromo = rawStudent.extraFeePromo || (student as any).extraFeePromo
  const extraDiscount = calcPromoDiscount(extraBase, extraPromo)
  const extraNet = Math.max(0, extraBase - extraDiscount)

  const isStudentPaid = rawStudent.fees_status === 'Paid' || rawStudent.status === 'Paid' || student.status === 'Paid' || student.fees_status === 'Paid'

  const groups: MonthGroup[] = []

  // Month 1: November 2026 (Active / Admission Period)
  // Contains Registration Fee (one-time/yearly), Admission Fee, and Monthly Recurring Fees (Class, Transport)
  const m1Items: FeeItem[] = []
  if (regNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-reg`,
      headKey: 'reg',
      headName: 'Registration Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: regNet,
      baseAmount: regBase,
      discount: regDiscount,
      promoCode: regPromo,
      iconType: 'reg',
      isPaid: isStudentPaid
    })
  }
  if (admNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-adm`,
      headKey: 'adm',
      headName: 'Admission Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: admNet,
      baseAmount: admBase,
      discount: admDiscount,
      promoCode: admPromo,
      iconType: 'adm',
      isPaid: isStudentPaid
    })
  }
  if (classNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-class`,
      headKey: 'classFee',
      headName: 'Class Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: classNet,
      baseAmount: classBase,
      discount: classDiscount,
      promoCode: classPromo,
      iconType: 'class',
      isPaid: isStudentPaid
    })
  }
  if (transNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-trans`,
      headKey: 'trans',
      headName: 'Transportation Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: transNet,
      baseAmount: transBase,
      discount: transDiscount,
      promoCode: transPromo,
      iconType: 'trans',
      isPaid: isStudentPaid
    })
  }
  if (libNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-lib`,
      headKey: 'lib',
      headName: 'Library Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: libNet,
      baseAmount: libBase,
      discount: libDiscount,
      promoCode: libPromo,
      iconType: 'lib',
      isPaid: isStudentPaid
    })
  }
  if (examNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-exam`,
      headKey: 'exam',
      headName: 'Exam Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: examNet,
      baseAmount: examBase,
      discount: examDiscount,
      promoCode: examPromo,
      iconType: 'exam',
      isPaid: isStudentPaid
    })
  }
  if (hostelNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-hostel`,
      headKey: 'hostel',
      headName: 'Hostel Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: hostelNet,
      baseAmount: hostelBase,
      discount: hostelDiscount,
      promoCode: hostelPromo,
      iconType: 'hostel',
      isPaid: isStudentPaid
    })
  }
  if (extraNet > 0) {
    m1Items.push({
      id: `${student.id}-m1-extra`,
      headKey: 'extra',
      headName: 'Extra Curricular Fee',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: extraNet,
      baseAmount: extraBase,
      discount: extraDiscount,
      promoCode: extraPromo,
      iconType: 'extra',
      isPaid: isStudentPaid
    })
  }
  if (fineAmt > 0) {
    m1Items.push({
      id: `${student.id}-m1-fine`,
      headKey: 'fine',
      headName: 'Late Fine',
      month: 'November 2026',
      dueDate: '15-Nov-2026',
      amount: fineAmt,
      iconType: 'fine',
      isPaid: isStudentPaid
    })
  }

  const m1Total = m1Items.reduce((acc, it) => acc + it.amount, 0)
  const m1DueDate = '15-Nov-2026'
  groups.push({
    month: 'November 2026',
    dueDate: m1DueDate,
    isOverdue: isDatePassed(m1DueDate),
    items: m1Items,
    monthTotal: m1Total
  })

  // Month 2: December 2026
  // Recurring monthly fees (Class Fee & Transportation Fee) - EQUAL & IDENTICAL to November!
  const m2Items: FeeItem[] = []
  if (classNet > 0) {
    m2Items.push({
      id: `${student.id}-m2-class`,
      headKey: 'classFee',
      headName: 'Class Fee',
      month: 'December 2026',
      dueDate: '15-Dec-2026',
      amount: classNet,
      baseAmount: classBase,
      discount: classDiscount,
      promoCode: classPromo,
      iconType: 'class',
      isPaid: false
    })
  }
  if (transNet > 0) {
    m2Items.push({
      id: `${student.id}-m2-trans`,
      headKey: 'trans',
      headName: 'Transportation Fee',
      month: 'December 2026',
      dueDate: '15-Dec-2026',
      amount: transNet,
      baseAmount: transBase,
      discount: transDiscount,
      promoCode: transPromo,
      iconType: 'trans',
      isPaid: false
    })
  }
  if (libNet > 0 && rawStudent.libFeeDuration === 'Monthly') {
    m2Items.push({
      id: `${student.id}-m2-lib`,
      headKey: 'lib',
      headName: 'Library Fee',
      month: 'December 2026',
      dueDate: '15-Dec-2026',
      amount: libNet,
      iconType: 'lib',
      isPaid: false
    })
  }
  if (hostelNet > 0 && rawStudent.hostelFeeDuration === 'Monthly') {
    m2Items.push({
      id: `${student.id}-m2-hostel`,
      headKey: 'hostel',
      headName: 'Hostel Fee',
      month: 'December 2026',
      dueDate: '15-Dec-2026',
      amount: hostelNet,
      iconType: 'hostel',
      isPaid: false
    })
  }
  const m2Total = m2Items.reduce((acc, it) => acc + it.amount, 0)
  const m2DueDate = '15-Dec-2026'
  if (m2Items.length > 0) {
    groups.push({
      month: 'December 2026',
      dueDate: m2DueDate,
      isOverdue: isDatePassed(m2DueDate),
      items: m2Items,
      monthTotal: m2Total
    })
  }

  // Month 3: January 2027
  // Recurring monthly fees - EQUAL & IDENTICAL to November and December!
  const m3Items: FeeItem[] = []
  if (classNet > 0) {
    m3Items.push({
      id: `${student.id}-m3-class`,
      headKey: 'classFee',
      headName: 'Class Fee',
      month: 'January 2027',
      dueDate: '15-Jan-2027',
      amount: classNet,
      baseAmount: classBase,
      discount: classDiscount,
      promoCode: classPromo,
      iconType: 'class',
      isPaid: false
    })
  }
  if (transNet > 0) {
    m3Items.push({
      id: `${student.id}-m3-trans`,
      headKey: 'trans',
      headName: 'Transportation Fee',
      month: 'January 2027',
      dueDate: '15-Jan-2027',
      amount: transNet,
      baseAmount: transBase,
      discount: transDiscount,
      promoCode: transPromo,
      iconType: 'trans',
      isPaid: false
    })
  }
  const m3Total = m3Items.reduce((acc, it) => acc + it.amount, 0)
  const m3DueDate = '15-Jan-2027'
  if (m3Items.length > 0) {
    groups.push({
      month: 'January 2027',
      dueDate: m3DueDate,
      isOverdue: isDatePassed(m3DueDate),
      items: m3Items,
      monthTotal: m3Total
    })
  }

  return groups
}

// Icon component helper
function FeeHeadIcon({ type }: { type: FeeItem['iconType'] }) {
  switch (type) {
    case 'class':
      return <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
    case 'lib':
      return <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    case 'exam':
      return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    case 'hostel':
      return <Bed className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    case 'trans':
      return <Bus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    case 'extra':
      return <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
    case 'reg':
    case 'adm':
      return <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    case 'fine':
      return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
    default:
      return <DollarSign className="w-5 h-5 text-teal-600" />
  }
}

// Crisp QR Code Display Component
function QRCodeDisplay({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
      {/* QR Box with corner scan brackets */}
      <div className="relative p-5 bg-white rounded-2xl border-2 border-teal-600/30 shadow-inner">
        {/* Top-left bracket */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-teal-600 rounded-tl"></div>
        {/* Top-right bracket */}
        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-teal-600 rounded-tr"></div>
        {/* Bottom-left bracket */}
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-teal-600 rounded-bl"></div>
        {/* Bottom-right bracket */}
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-teal-600 rounded-br"></div>
        
        <svg viewBox="0 0 200 200" className="w-52 h-52">
          {/* Finder pattern Top-Left */}
          <rect x="10" y="10" width="50" height="50" fill="#0f766e" rx="4" />
          <rect x="18" y="18" width="34" height="34" fill="#ffffff" rx="2" />
          <rect x="26" y="26" width="18" height="18" fill="#0f766e" rx="2" />

          {/* Finder pattern Top-Right */}
          <rect x="140" y="10" width="50" height="50" fill="#0f766e" rx="4" />
          <rect x="148" y="18" width="34" height="34" fill="#ffffff" rx="2" />
          <rect x="156" y="26" width="18" height="18" fill="#0f766e" rx="2" />

          {/* Finder pattern Bottom-Left */}
          <rect x="10" y="140" width="50" height="50" fill="#0f766e" rx="4" />
          <rect x="18" y="148" width="34" height="34" fill="#ffffff" rx="2" />
          <rect x="26" y="156" width="18" height="18" fill="#0f766e" rx="2" />

          {/* Alignment & Timing Patterns */}
          <rect x="135" y="135" width="28" height="28" fill="#0f766e" rx="3" />
          <rect x="141" y="141" width="16" height="16" fill="#ffffff" rx="2" />
          <rect x="146" y="146" width="6" height="6" fill="#0f766e" rx="1" />

          {/* Timing horizontal */}
          <line x1="68" y1="35" x2="132" y2="35" stroke="#0f766e" strokeWidth="4" strokeDasharray="6,6" />
          {/* Timing vertical */}
          <line x1="35" y1="68" x2="35" y2="132" stroke="#0f766e" strokeWidth="4" strokeDasharray="6,6" />

          {/* Data Matrix Blocks */}
          <rect x="70" y="15" width="8" height="8" fill="#0f766e" />
          <rect x="85" y="22" width="12" height="6" fill="#0f766e" />
          <rect x="105" y="14" width="8" height="14" fill="#0f766e" />
          <rect x="120" y="20" width="10" height="8" fill="#0f766e" />

          <rect x="70" y="45" width="14" height="8" fill="#0f766e" />
          <rect x="92" y="42" width="8" height="14" fill="#0f766e" />
          <rect x="110" y="48" width="12" height="10" fill="#0f766e" />
          <rect x="130" y="44" width="6" height="12" fill="#0f766e" />

          <rect x="15" y="70" width="8" height="14" fill="#0f766e" />
          <rect x="30" y="80" width="12" height="8" fill="#0f766e" />
          <rect x="48" y="72" width="10" height="12" fill="#0f766e" />

          <rect x="70" y="70" width="10" height="10" fill="#0f766e" />
          <rect x="88" y="75" width="14" height="6" fill="#0f766e" />
          <rect x="115" y="70" width="8" height="12" fill="#0f766e" />
          <rect x="130" y="78" width="12" height="8" fill="#0f766e" />
          <rect x="150" y="72" width="10" height="14" fill="#0f766e" />
          <rect x="170" y="76" width="14" height="8" fill="#0f766e" />

          <rect x="15" y="98" width="12" height="8" fill="#0f766e" />
          <rect x="35" y="94" width="8" height="14" fill="#0f766e" />
          <rect x="50" y="102" width="10" height="10" fill="#0f766e" />

          <rect x="70" y="95" width="14" height="8" fill="#0f766e" />
          <rect x="90" y="100" width="8" height="14" fill="#0f766e" />
          <rect x="108" y="94" width="12" height="8" fill="#0f766e" />
          <rect x="128" y="102" width="14" height="10" fill="#0f766e" />
          <rect x="152" y="96" width="8" height="14" fill="#0f766e" />
          <rect x="172" y="100" width="12" height="8" fill="#0f766e" />

          <rect x="15" y="120" width="10" height="12" fill="#0f766e" />
          <rect x="32" y="125" width="14" height="8" fill="#0f766e" />
          <rect x="52" y="118" width="8" height="14" fill="#0f766e" />

          <rect x="70" y="120" width="10" height="12" fill="#0f766e" />
          <rect x="86" y="124" width="14" height="8" fill="#0f766e" />
          <rect x="106" y="118" width="10" height="14" fill="#0f766e" />

          <rect x="70" y="145" width="12" height="10" fill="#0f766e" />
          <rect x="90" y="150" width="8" height="14" fill="#0f766e" />
          <rect x="105" y="144" width="14" height="8" fill="#0f766e" />

          <rect x="70" y="170" width="14" height="8" fill="#0f766e" />
          <rect x="92" y="172" width="10" height="12" fill="#0f766e" />
          <rect x="110" y="168" width="8" height="14" fill="#0f766e" />
          <rect x="126" y="174" width="12" height="8" fill="#0f766e" />
          <rect x="146" y="170" width="10" height="12" fill="#0f766e" />
          <rect x="164" y="172" width="12" height="8" fill="#0f766e" />
          <rect x="180" y="168" width="8" height="14" fill="#0f766e" />

          {/* Center Logo badge */}
          <rect x="80" y="80" width="40" height="40" fill="#ffffff" rx="8" stroke="#0f766e" strokeWidth="2" />
          <text x="100" y="105" textAnchor="middle" fill="#0f766e" fontSize="20" fontWeight="900" fontFamily="sans-serif">₹</text>
        </svg>
      </div>

      <div className="text-center space-y-1">
        <span className="text-xs font-black text-slate-700 dark:text-slate-200 block">
          Scan and pay with any UPI app
        </span>
        <span className="text-base font-black text-[#0f766e] block">
          Amount: ₹{amount.toLocaleString('en-IN')}/-
        </span>
      </div>

      {/* App Badges */}
      <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-500">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Google Pay</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">PhonePe</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Paytm</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BHIM UPI</span>
      </div>
    </div>
  )
}

export function FeeCollectionWizardModal({
  student,
  onClose,
  onPaymentSuccess
}: {
  student: StudentFeeItem
  onClose: () => void
  onPaymentSuccess: (updatedStudent: StudentFeeItem) => void
}) {
  const [step, setStep] = useState<'SELECT_FEES' | 'SUMMARY' | 'ONLINE_MANUAL' | 'ATTACH_CONFIRM'>('SELECT_FEES')
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [manualPayTab, setManualPayTab] = useState<'QR CODE' | 'BANK ACCOUNT' | 'UPI'>('QR CODE')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'Online Gateway' | 'UPI / QR' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card'>('UPI / QR')
  
  // Payment confirmation state
  const [payAmountInput, setPayAmountInput] = useState<string>('')
  const [payTxnIdInput, setPayTxnIdInput] = useState<string>('')
  const [payRemarksInput, setPayRemarksInput] = useState<string>('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Initialize schedule & auto-select only due/active month items by default
  useEffect(() => {
    const groups = buildStudentMonthlySchedule(student)
    setMonthGroups(groups)

    const initialSelected = new Set<string>()
    // Auto-select ONLY months that are due or overdue (e.g. November 2026)!
    // Future advance months (December 2026, January 2027) should NOT be selected by default.
    let selectedActiveMonth = false
    groups.forEach(g => {
      if (g.isOverdue || (!selectedActiveMonth && g.items.some(it => !it.isPaid))) {
        g.items.forEach(it => {
          if (!it.isPaid) {
            initialSelected.add(it.id)
            selectedActiveMonth = true
          }
        })
      }
    })
    setSelectedItemIds(initialSelected)

    // Calculate initial payable sum
    let initialSum = 0
    groups.forEach(g => {
      g.items.forEach(it => {
        if (!it.isPaid && initialSelected.has(it.id)) {
          initialSum += it.amount
        }
      })
    })

    setPayAmountInput(String(initialSum))
    setPayTxnIdInput(`REC-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`)
    setPayRemarksInput(`Fee collection for ${student.class} - ${student.name}`)
  }, [student])

  // Flat list of all fee items
  const allItems = useMemo(() => {
    return monthGroups.flatMap(g => g.items)
  }, [monthGroups])

  const unpaidItems = useMemo(() => {
    return allItems.filter(it => !it.isPaid)
  }, [allItems])

  const selectedItems = useMemo(() => {
    return allItems.filter(it => selectedItemIds.has(it.id))
  }, [allItems, selectedItemIds])

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.amount, 0)
  }, [selectedItems])

  const totalOutstanding = useMemo(() => {
    return unpaidItems.reduce((sum, it) => sum + it.amount, 0)
  }, [unpaidItems])

  // Keep payAmountInput in sync when selection changes if in earlier steps
  useEffect(() => {
    if (step === 'SELECT_FEES' || step === 'SUMMARY') {
      setPayAmountInput(String(selectedTotal))
    }
  }, [selectedTotal, step])

  // Toggle single item
  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  // Toggle entire month
  const handleToggleMonth = (monthGroup: MonthGroup) => {
    const unpaidInMonth = monthGroup.items.filter(it => !it.isPaid)
    const allSelected = unpaidInMonth.every(it => selectedItemIds.has(it.id))

    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        unpaidInMonth.forEach(it => next.delete(it.id))
      } else {
        unpaidInMonth.forEach(it => next.add(it.id))
      }
      return next
    })
  }

  // Toggle all dues
  const isAllDuesSelected = unpaidItems.length > 0 && unpaidItems.every(it => selectedItemIds.has(it.id))
  const handleToggleAllDues = () => {
    setSelectedItemIds(prev => {
      if (isAllDuesSelected) {
        return new Set()
      } else {
        return new Set(unpaidItems.map(it => it.id))
      }
    })
  }

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(label)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopiedField(null), 2000)
    } else {
      toast.info(`${label}: ${text}`)
    }
  }

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAttachedPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success(`Attached: ${file.name}`)
    }
  }

  // Submit Payment Record
  const handleSubmitPayment = () => {
    const amtNum = parseFloat(payAmountInput)
    if (!amtNum || amtNum <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return
    }

    setIsSubmitting(true)

    const parseNum = (val: any): number => {
      if (!val) return 0
      const str = String(val).replace(/[^0-9.]/g, '')
      return parseFloat(str) || 0
    }

    const currentTotal = parseNum(student.total)
    const currentPaid = parseNum(student.paid)
    const newPaid = currentPaid + amtNum
    const newPending = Math.max(0, currentTotal - newPaid)
    const newStatus: 'Paid' | 'Unpaid' | 'Partial' = newPending <= 0 ? 'Paid' : 'Partial'

    const fmt = (n: number) => `${Math.round(n).toLocaleString('en-IN')}/-`

    const updatedStudent: StudentFeeItem = {
      ...student,
      paid: fmt(newPaid),
      pending: fmt(newPending),
      status: newStatus,
      paymentMode: selectedPaymentMode,
      receiptNo: payTxnIdInput,
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: payRemarksInput
    }

    // Save payment history record in localStorage
    if (typeof window !== 'undefined') {
      const historyKey = 'school_student_fee_payments'
      const existingHistory = localStorage.getItem(historyKey)
      let historyList = []
      if (existingHistory) {
        try {
          historyList = JSON.parse(existingHistory)
        } catch (e) {}
      }

      const paymentRecord = {
        id: `TXN-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        section: student.section,
        amountPaid: amtNum,
        totalSelected: selectedTotal,
        paymentMode: selectedPaymentMode,
        receiptNo: payTxnIdInput,
        paymentDate: new Date().toISOString(),
        screenshotName: attachedFile?.name || null,
        selectedFeeItems: selectedItems.map(i => ({ head: i.headName, month: i.month, amount: i.amount })),
        remarks: payRemarksInput
      }

      historyList.unshift(paymentRecord)
      localStorage.setItem(historyKey, JSON.stringify(historyList))
    }

    toast.success(`Fee payment of ₹${amtNum.toLocaleString('en-IN')}/- recorded successfully!`)
    setIsSubmitting(false)
    onPaymentSuccess(updatedStudent)
  }

  // Selected Months summary text (e.g. "May & June 2026")
  const selectedMonthsSummary = useMemo(() => {
    const monthsSet = Array.from(new Set(selectedItems.map(i => i.month)))
    if (monthsSet.length === 0) return 'None'
    if (monthsSet.length === 1) return monthsSet[0]
    return monthsSet.join(' & ')
  }, [selectedItems])

  // Live calculations for step 4
  const currentPaidAmt = parseFloat(payAmountInput) || 0
  const remainingDue = Math.max(0, selectedTotal - currentPaidAmt)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* ── MODAL HEADER ── */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            {step !== 'SELECT_FEES' && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'SUMMARY') setStep('SELECT_FEES')
                  else if (step === 'ONLINE_MANUAL') setStep('SUMMARY')
                  else if (step === 'ATTACH_CONFIRM') {
                    if (selectedPaymentMode === 'UPI / QR' || selectedPaymentMode === 'Bank Transfer') {
                      setStep('ONLINE_MANUAL')
                    } else {
                      setStep('SUMMARY')
                    }
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>
                  {step === 'SELECT_FEES' && 'Pay Fee'}
                  {step === 'SUMMARY' && 'Fee Payment Summary'}
                  {step === 'ONLINE_MANUAL' && 'Online Manual Pay'}
                  {step === 'ATTACH_CONFIRM' && 'Attach Screenshot'}
                </span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Step {step === 'SELECT_FEES' ? '1 of 4: Monthly Fee Structure' : step === 'SUMMARY' ? '2 of 4: Payment Summary' : step === 'ONLINE_MANUAL' ? '3 of 4: Online Manual Transfer' : '4 of 4: Payment Details & Receipt'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── MODAL SCROLLABLE BODY ── */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* ========================================================================= */}
          {/* STEP 1: PAY FEE / MONTHLY FEE STRUCTURE */}
          {/* ========================================================================= */}
          {step === 'SELECT_FEES' && (
            <div className="space-y-4">
              
              {/* Student Profile Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{student.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Class: <strong className="text-slate-700 dark:text-slate-300">{student.class} - {student.section}</strong> &bull; Roll: <strong className="text-slate-700 dark:text-slate-300">{student.rollNo || '01'}</strong> &bull; Adm: <strong className="text-slate-700 dark:text-slate-300">{student.admissionNo || 'A101'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* TOTAL OUTSTANDING DUE BANNER */}
              <div className="bg-gradient-to-r from-teal-900 via-[#0f766e] to-emerald-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest font-black text-teal-200">
                    TOTAL OUTSTANDING DUE
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-teal-100 border border-white/20">
                    Session 2025-26
                  </span>
                </div>

                <div className="text-3xl font-black tracking-tight text-white">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </div>

                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] font-bold text-teal-100">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/20 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Due Date: {monthGroups[0]?.dueDate || '15-Nov-2026'}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/20 border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-teal-300" />
                    <span>Months: {monthGroups.length} Months</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/20 border border-white/10">
                    <Layers className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Total Fees: {allItems.length} Items</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/20 border border-white/10">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                    <span>Fine: {student.fine || '0/-'}</span>
                  </span>
                </div>
              </div>

              {/* Monthly Fee Structure Section Header */}
              <div className="flex items-center justify-between pt-1">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Monthly Fee Structure</span>
                </h4>

                <button
                  type="button"
                  onClick={handleToggleAllDues}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isAllDuesSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] border-teal-300 dark:border-teal-700 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAllDuesSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#0f766e]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All Dues</span>
                </button>
              </div>

              {/* Month Cards Breakdown */}
              <div className="space-y-4">
                {monthGroups.map((group, gIdx) => {
                  const unpaidInThisMonth = group.items.filter(it => !it.isPaid)
                  const isMonthFullySelected = unpaidInThisMonth.length > 0 && unpaidInThisMonth.every(it => selectedItemIds.has(it.id))

                  return (
                    <div
                      key={gIdx}
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/80 overflow-hidden shadow-2xs"
                    >
                      {/* Month Card Header */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                              {group.month}
                            </span>
                            {unpaidInThisMonth.length === 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Paid ✓
                              </span>
                            ) : group.isOverdue ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                                Overdue: {group.dueDate}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                Due: {group.dueDate}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-[#0f766e] mt-0.5 block">
                            Total: ₹{group.monthTotal.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {unpaidInThisMonth.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleToggleMonth(group)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isMonthFullySelected
                                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isMonthFullySelected ? '✓ Selected Month' : 'Select Month'}
                          </button>
                        )}
                      </div>

                      {/* Itemized Fee Heads */}
                      <div className="p-3 divide-y divide-slate-100 dark:divide-slate-700/60">
                        {group.items.map(item => {
                          const isSelected = selectedItemIds.has(item.id)

                          return (
                            <div
                              key={item.id}
                              className={`py-2.5 px-3 flex items-center justify-between rounded-xl transition-colors ${
                                isSelected ? 'bg-teal-50/50 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                  <FeeHeadIcon type={item.iconType} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                                      {item.headName}
                                    </span>
                                    {item.promoCode && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        {item.promoCode} {item.discount ? `(-₹${item.discount})` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {item.baseAmount && item.baseAmount > item.amount && (
                                      <span className="text-[11px] line-through text-slate-400 font-semibold">
                                        ₹{item.baseAmount.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
                                      ₹{item.amount.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                {item.isPaid ? (
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Paid ✓
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItem(item.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                      isSelected
                                        ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: FEE PAYMENT SUMMARY */}
          {/* ========================================================================= */}
          {step === 'SUMMARY' && (
            <div className="space-y-4">
              
              {/* TOTAL PAYABLE AMOUNT CARD */}
              <div className="bg-gradient-to-r from-teal-900 via-[#0f766e] to-emerald-900 text-white rounded-3xl p-6 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest font-black text-teal-200">
                    TOTAL PAYABLE AMOUNT
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-teal-100 border border-white/20">
                    {student.name} &bull; {student.class}
                  </span>
                </div>

                <div className="text-4xl font-black text-white">
                  ₹{selectedTotal.toLocaleString('en-IN')}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-teal-100 font-semibold pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Selected {selectedItems.length} fee items across {selectedMonthsSummary}</span>
                </div>
              </div>

              {/* Fee Breakdown List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fee Breakdown ({selectedItems.length} Items)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStep('SELECT_FEES')}
                    className="text-xs font-bold text-[#0f766e] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More Fees</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 flex items-center justify-center shrink-0">
                          <FeeHeadIcon type={item.iconType} />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                            {item.headName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {item.month}
                          </span>
                        </div>
                      </div>

                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMode('Online Gateway')
                    setStep('ATTACH_CONFIRM')
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-sm flex items-center justify-between shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5" />
                    <span>Pay via Payment Gateway (Instant)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMode('UPI / QR')
                    setStep('ONLINE_MANUAL')
                  }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-teal-600 text-[#0f766e] hover:bg-teal-50 dark:hover:bg-teal-950/40 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Online Manual Payment / QR</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMode('Cash')
                      setStep('ATTACH_CONFIRM')
                    }}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Cash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMode('Bank Transfer')
                      setStep('ATTACH_CONFIRM')
                    }}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Bank Transfer / Cheque</span>
                  </button>
                </div>

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Safe &amp; Secure Payment Gateway</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ONLINE MANUAL PAY (QR / BANK / UPI) */}
          {/* ========================================================================= */}
          {step === 'ONLINE_MANUAL' && (
            <div className="space-y-4">
              
              {/* Bank Name Selector */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                      State Bank of India
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Academy Setu Main Collection A/C
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black text-[#0f766e]">
                  ₹{selectedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* 3 Tabs: QR CODE | BANK ACCOUNT | UPI */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setManualPayTab('QR CODE')}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    manualPayTab === 'QR CODE'
                      ? 'bg-white dark:bg-slate-900 text-[#0f766e] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  QR CODE
                </button>
                <button
                  type="button"
                  onClick={() => setManualPayTab('BANK ACCOUNT')}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    manualPayTab === 'BANK ACCOUNT'
                      ? 'bg-white dark:bg-slate-900 text-[#0f766e] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  BANK ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setManualPayTab('UPI')}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    manualPayTab === 'UPI'
                      ? 'bg-white dark:bg-slate-900 text-[#0f766e] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  UPI
                </button>
              </div>

              {/* TAB 1: QR CODE */}
              {manualPayTab === 'QR CODE' && (
                <QRCodeDisplay amount={selectedTotal} />
              )}

              {/* TAB 2: BANK ACCOUNT */}
              {manualPayTab === 'BANK ACCOUNT' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Name</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-black">State Bank of India</strong>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Current Account
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Holder</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-black">Academy Setu Public School</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                        <strong className="text-base font-mono font-black text-slate-900 dark:text-white">38947291048</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('38947291048', 'Account Number')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'Account Number' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">IFSC Code</span>
                        <strong className="text-base font-mono font-black text-slate-900 dark:text-white">SBIN0004521</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('SBIN0004521', 'IFSC Code')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'IFSC Code' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Branch</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">Main Campus Branch, City Centre</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: UPI */}
              {manualPayTab === 'UPI' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">UPI ID / VPA</span>
                        <strong className="text-base font-mono font-black text-[#0f766e]">academysetu@sbi</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('academysetu@sbi', 'UPI ID')}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0f766e] text-xs font-bold flex items-center gap-1 border border-teal-200 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'UPI ID' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Merchant</span>
                      <strong className="text-slate-800 dark:text-slate-100 font-black">Academy Setu Public School</strong>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verified Educational Institution UPI Merchant</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action: Attach Screenshot */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPaymentMode(manualPayTab === 'BANK ACCOUNT' ? 'Bank Transfer' : 'UPI / QR')
                    setStep('ATTACH_CONFIRM')
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Attach Screenshot / Receipt</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: ATTACH SCREENSHOT & PAYMENT CONFIRMATION */}
          {/* ========================================================================= */}
          {step === 'ATTACH_CONFIRM' && (
            <div className="space-y-4">
              
              {/* TOTAL AMOUNT CARD */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-[#0f766e] flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Amount</span>
                    <strong className="text-2xl font-black text-[#0f766e]">
                      ₹{selectedTotal.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-[#0f766e] border border-teal-200">
                  {selectedPaymentMode}
                </span>
              </div>

              {/* PAYMENT DETAILS 1 BOX */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0f766e] font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Payment Details 1
                  </h4>
                </div>

                {/* Amount Paid Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[#0f766e] text-sm">₹</span>
                    <input
                      type="number"
                      value={payAmountInput}
                      onChange={e => setPayAmountInput(e.target.value)}
                      placeholder="Enter Paid Amount (e.g. 10000)"
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50/50 dark:bg-slate-900/50"
                    />
                  </div>
                </div>

                {/* Attach Screenshot / Receipt Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    Attach Screenshot / Receipt
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2 px-2 text-xs text-slate-500 font-semibold truncate">
                      <Upload className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">
                        {attachedFile ? attachedFile.name : 'Choose Screenshot / Receipt'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-[#0f766e] text-white text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer shrink-0"
                    >
                      Browse
                    </button>
                  </div>

                  {/* Thumbnail preview if image attached */}
                  {attachedPreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={attachedPreview}
                        alt="Payment Receipt Preview"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedFile(null)
                          setAttachedPreview(null)
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black cursor-pointer shadow-xs"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Transaction Ref & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Receipt / TXN Ref No.</label>
                    <input
                      type="text"
                      value={payTxnIdInput}
                      onChange={e => setPayTxnIdInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Remarks / Note</label>
                    <input
                      type="text"
                      value={payRemarksInput}
                      onChange={e => setPayRemarksInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* Add Another Screenshot Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Screenshot</span>
                </button>
              </div>

              {/* LIVE DUE SUMMARY BOX */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Total Due Amount</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100">
                    ₹{selectedTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <span>&darr;</span> Paid Amount
                  </span>
                  <span className="text-base font-black">
                    ₹{currentPaidAmt.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between">
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Remaining Due</span>
                  </span>
                  <span className={`text-base font-black ${remainingDue === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{remainingDue.toLocaleString('en-IN')} {remainingDue === 0 ? '(Fully Cleared ✓)' : ''}
                  </span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                disabled={isSubmitting || currentPaidAmt <= 0}
                onClick={handleSubmitPayment}
                className="w-full py-3.5 rounded-2xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Payment...' : 'Submit'}</span>
              </button>

            </div>
          )}

        </div>

        {/* ── MODAL BOTTOM STICKY BAR (ONLY IN STEP 1) ── */}
        {step === 'SELECT_FEES' && (
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                Selected: {selectedItems.length} Items
              </span>
              <span className="text-lg font-black text-[#0f766e]">
                ₹{selectedTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => setStep('SUMMARY')}
              className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>Proceed to Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
