'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  X, Camera, Edit2, Upload, ArrowLeft, Search, Eye, EyeOff,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2, Trash2,
  Receipt, CreditCard, Check, AlertCircle, RefreshCw, Save
} from 'lucide-react'
import { 
  PersonalDetailsCard, PreviousSchoolCard, MedicalDetailsCard, TCDetailsCard, EducationTableCard,
  ParentsDetailsCard, AddressDetailsCard, BirthCertificateCard, ScholarshipDetailsCard, BplRteDetailsCard,
  GovtIdDetailsCard, GovtPortalDetailsCard, InfoRow, FeeDetailsCard
} from '@/components/students/ProfileCards'
import AddStudentWizard from '@/components/students/AddStudentWizard'
import { 
  FeeCollectionWizardModal, 
  FeeReceiptModal, 
  StudentFeeItem 
} from '@/app/institute/fees-collection/page'
import { fetchStudentById, fetchStudents, deleteStudent } from '../actions'
import { toast } from 'sonner'

function parseAmt(val: any): number {
  if (!val) return 0
  const str = String(val).replace(/[^0-9.]/g, '')
  return parseFloat(str) || 0
}

function fmtAmt(n: number): string {
  return `${Math.round(n).toLocaleString('en-IN')}/-`
}

function resolveClassFee(className: string, isRte: boolean): string {
  if (isRte) return '0/-'
  if (typeof window === 'undefined') return '1000/-'
  try {
    const raw = localStorage.getItem('school_class_fees')
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) {
        const target = (className || 'Class 1').replace(/\s*\([^)]*\)/, '').trim().toLowerCase()
        const found = list.find((c: any) =>
          (c.className && c.className.toLowerCase() === target) ||
          (c.name && c.name.toLowerCase() === target) ||
          (c.className && c.className.toLowerCase() === 'all')
        )
        if (found) {
          const amt = parseFloat(found.monthly || found.oneTime || found.amount || '0')
          if (amt > 0) return `${amt}/-`
        }
      }
    }
  } catch (e) {}
  return '1000/-'
}

function normalizeStudent(s: any): any {
  if (!s) return null

  const rawClass = s.class_name || s.class || 'Class 1'
  const sectionMatch = rawClass.match(/\(([^)]+)\)/)
  const cleanClass = s.class || (sectionMatch ? rawClass.replace(/\s*\([^)]*\)/, '').trim() : rawClass)
  const section = s.section || s.section_name || (sectionMatch ? sectionMatch[1] : 'A')

  const firstName = s.firstName || s.first_name || (s.name ? s.name.split(' ')[0] : 'Student')
  const lastName = s.lastName || s.last_name || (s.name ? s.name.split(' ').slice(1).join(' ') : '')
  const fullName = `${firstName} ${lastName}`.trim() || s.name || 'Student'

  const admissionNo = s.admissionNo || s.admission_no || s.id || 'ADM-001'
  const rollNo = s.rollNo || s.roll_no || '1'
  const admissionDate = s.admissionDate || s.admission_date || (s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') : '19/11/2026')
  const academicYear = s.academicYear || s.academic_year || '2025-2026'

  const mobileNo = s.mobileNo || s.mobile_no || s.contact || '-'
  const email = s.emailId || s.email || '-'

  const dob = s.dob || s.date_of_birth || '-'
  const gender = s.gender || 'Male'
  const bloodGroup = s.bloodGroup || s.blood_group || '-'
  const height = s.height || '-'
  const weight = s.weight || '-'
  const userName = s.userName || s.user_name || (firstName ? `${firstName.toLowerCase().replace(/\s+/g, '')}${rollNo !== '-' ? rollNo : '123'}` : 'student123')
  const password = s.password || `${userName}@123`

  const prevSchoolName = s.prevSchoolName || s.prev_school_name || '-'
  const prevAttendedClass = s.prevAttendedClass || s.prev_attended_class || '-'
  const prevSchoolAffiliatedTo = s.prevSchoolAffiliatedTo || s.prev_school_affiliated_to || '-'
  const tcNo = s.tcNo || s.tc_no || '-'
  const tcIssueDate = s.tcIssueDate || s.tc_issue_date || '-'
  const otherQualifications = Array.isArray(s.otherQualifications) ? s.otherQualifications : []

  const fatherName = s.fatherName || s.father_name || '-'
  const fatherContact = s.fatherContact || s.father_contact || '-'
  const fatherOccupation = s.fatherOccupation || s.father_occupation || '-'
  const fatherIncome = s.fatherIncome || s.father_income || '-'
  const motherName = s.motherName || s.mother_name || '-'
  const motherContact = s.motherContact || s.mother_contact || '-'
  const motherOccupation = s.motherOccupation || s.mother_occupation || '-'
  const motherIncome = s.motherIncome || s.mother_income || '-'

  const address = s.address || s.current_address || s.permanent_address || '-'
  const pincode = s.pincode || '-'
  const district = s.district || '-'
  const state = s.state || '-'
  const domicileNo = s.domicileNo || s.domicile_no || '-'

  const aadharNo = s.aadharNo || s.aadhar_no || '-'
  const nationality = s.nationality || 'Indian'
  const religion = s.religion || '-'
  const category = s.category || '-'
  const birthCertNo = s.birthCertNo || s.birth_cert_no || '-'
  const scholarshipId = s.scholarshipId || s.scholarship_id || '-'
  const scholarshipPwd = s.scholarshipPwd || s.scholarship_pwd || '-'
  const govtStudentId = s.govtStudentId || s.govt_student_id || '-'
  const govtFamilyId = s.govtFamilyId || s.govt_family_id || '-'
  const samagraId = s.samagraId || s.samagra_id || '-'
  const bplStudent = s.bplStudent || (s.bpl_student ? 'Yes' : 'No')
  const isRteStudent = s.isRteStudent || (s.rte_student ? 'Yes' : 'No')

  const avatar = s.avatar && s.avatar.trim() !== ''
    ? s.avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName || 'Student')}`

  let classFee = s.classFee || s.class_fee
  if ((!classFee || parseAmt(classFee) === 0) && isRteStudent !== 'Yes') {
    classFee = resolveClassFee(cleanClass, false)
  }

  const isPaid = s.fees_status === 'Paid' || s.status === 'Paid'

  return {
    ...s,
    id: s.id,
    name: fullName,
    firstName,
    lastName,
    admissionNo,
    rollNo,
    admissionDate,
    academicYear,
    class: cleanClass,
    section,
    mobileNo,
    email,
    dob,
    gender,
    bloodGroup,
    height,
    weight,
    userName,
    password,
    prevSchoolName,
    prevAttendedClass,
    prevSchoolAffiliatedTo,
    tcNo,
    tcIssueDate,
    otherQualifications,
    fatherName,
    fatherContact,
    fatherOccupation,
    fatherIncome,
    motherName,
    motherContact,
    motherOccupation,
    motherIncome,
    address,
    pincode,
    district,
    state,
    domicileNo,
    aadharNo,
    nationality,
    religion,
    category,
    birthCertNo,
    scholarshipId,
    scholarshipPwd,
    govtStudentId,
    govtFamilyId,
    samagraId,
    bplStudent,
    isRteStudent,
    avatar,
    classFee,
    classFeeDuration: s.classFeeDuration || 'Monthly',
    regFeeDuration: s.regFeeDuration || 'Yearly',
    transFeeDuration: s.transFeeDuration || 'Monthly',
    status: s.status || 'Active',
    fees_status: isPaid ? 'Paid' : (s.fees_status || 'Pending')
  }
}

function studentToFeeItem(student: any): StudentFeeItem {
  if (!student) {
    return {
      id: 0,
      name: '',
      class: '',
      section: '',
      admissionNo: '',
      rollNo: '',
      reg: '0/-',
      adm: '0/-',
      classFee: '0/-',
      lib: '0/-',
      exam: '0/-',
      hostel: '0/-',
      trans: '0/-',
      extra: '0/-',
      fine: '0/-',
      paid: '0/-',
      pending: '0/-',
      total: '0/-',
      status: 'Unpaid'
    }
  }

  const regAmt = parseAmt(student.regFee || student.reg)
  const admAmt = parseAmt(student.admFee || student.adm)
  let classAmt = student.isRteStudent === 'Yes' ? 0 : parseAmt(student.classFee || student.class_fee)
  if (classAmt === 0 && student.isRteStudent !== 'Yes') {
    classAmt = parseAmt(resolveClassFee(student.class, false))
  }
  const libAmt = parseAmt(student.libFee || student.lib)
  const examAmt = parseAmt(student.examFee || student.exam)
  const hostelAmt = parseAmt(student.hostelFee || student.hostel)
  const transAmt = parseAmt(student.transFee || student.trans)
  const extraAmt = parseAmt(student.extraFee || student.extra)
  const fineAmt = parseAmt(student.fine)

  const calcPromo = (base: number, promo?: string) => {
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
      const numMatch = promo.match(/\d+/)
      if (numMatch) {
        const extracted = parseFloat(numMatch[0])
        if (extracted <= 100) { isPercent = true; pVal = extracted }
        else { isPercent = false; pVal = extracted }
      }
    }

    if (isPercent) {
      return Math.round((base * (pVal || 0)) / 100)
    }
    return Math.min(base, Math.round(pVal || 0))
  }

  const grossTotal = regAmt + admAmt + classAmt + libAmt + examAmt + hostelAmt + transAmt + extraAmt + fineAmt
  const regDiscount = calcPromo(regAmt, student.regFeePromo)
  const admDiscount = calcPromo(admAmt, student.admFeePromo)
  const classDiscount = calcPromo(classAmt, student.classFeePromo)
  const transDiscount = calcPromo(transAmt, student.transFeePromo)
  const libDiscount = calcPromo(libAmt, student.libFeePromo)
  const examDiscount = calcPromo(examAmt, student.examFeePromo)
  const hostelDiscount = calcPromo(hostelAmt, student.hostelFeePromo)
  const extraDiscount = calcPromo(extraAmt, student.extraFeePromo)
  const totalDiscount = regDiscount + admDiscount + classDiscount + transDiscount + libDiscount + examDiscount + hostelDiscount + extraDiscount

  const netTotal = Math.max(0, grossTotal - totalDiscount)
  const isPaid = student.fees_status === 'Paid' || student.status === 'Paid'
  const paidNum = isPaid ? netTotal : (parseAmt(student.paid) || 0)
  const pendingNum = Math.max(0, netTotal - paidNum)

  return {
    id: student.id || student.admissionNo || student.admission_no || Date.now(),
    name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
    class: student.class || 'Class 1',
    section: student.section || 'A',
    admissionNo: student.admissionNo || student.admission_no || '',
    rollNo: student.rollNo || student.roll_no || '1',
    reg: fmtAmt(regAmt),
    adm: fmtAmt(admAmt),
    classFee: fmtAmt(classAmt),
    lib: fmtAmt(libAmt),
    exam: fmtAmt(examAmt),
    hostel: fmtAmt(hostelAmt),
    trans: fmtAmt(transAmt),
    extra: fmtAmt(extraAmt),
    fine: fmtAmt(fineAmt),
    paid: fmtAmt(paidNum),
    pending: fmtAmt(pendingNum),
    total: fmtAmt(netTotal),
    status: isPaid || pendingNum === 0 ? 'Paid' : 'Unpaid',
    receiptNo: student.receiptNo || `REC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    paymentDate: student.paymentDate || new Date().toISOString().split('T')[0],
    paymentMode: student.paymentMode || 'Cash',
    remarks: student.remarks || `Fee collection for ${student.class || 'Class 1'} - ${student.firstName || student.name || 'Student'}`
  }
}

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id ? String(params.id) : ''

  const [activeTab, setActiveTab] = useState('Student Details')
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Edit and Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editStep, setEditStep] = useState(1)
  const [showCollectFee, setShowCollectFee] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const tabs = ['Student Details', 'Attendance', 'Leave', 'Fees', 'Login Details']

  const loadStudent = async () => {
    let matchedStudent: any = null

    // 1. Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_students')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          if (Array.isArray(list)) {
            matchedStudent = list.find((s: any) =>
              String(s.id).trim() === studentId.trim() ||
              String(s.admission_no || '').trim().toLowerCase() === studentId.trim().toLowerCase() ||
              String(s.admissionNo || '').trim().toLowerCase() === studentId.trim().toLowerCase() ||
              String(s.roll_no || '').trim() === studentId.trim() ||
              String(s.rollNo || '').trim() === studentId.trim()
            )
            // If not directly matched, check if there's only 1 student in the list
            if (!matchedStudent && list.length === 1) {
              matchedStudent = list[0]
            }
          }
        } catch (e) {
          console.error('Error parsing school_students:', e)
        }
      }

      // Also sync latest payment state from school_all_fees
      const savedFees = localStorage.getItem('school_all_fees')
      if (savedFees && matchedStudent) {
        try {
          const feeList = JSON.parse(savedFees)
          if (Array.isArray(feeList)) {
            const feeMatch = feeList.find((f: any) =>
              String(f.id).trim() === String(matchedStudent.id).trim() ||
              String(f.admissionNo || f.admission_no || '').trim().toLowerCase() === String(matchedStudent.admissionNo || matchedStudent.admission_no || '').trim().toLowerCase()
            )
            if (feeMatch) {
              if (feeMatch.status === 'Paid' || feeMatch.fees_status === 'Paid') {
                matchedStudent.fees_status = 'Paid'
                matchedStudent.status = 'Paid'
              }
              if (feeMatch.paid) matchedStudent.paid = feeMatch.paid
              if (feeMatch.pending) matchedStudent.pending = feeMatch.pending
              if (feeMatch.receiptNo) matchedStudent.receiptNo = feeMatch.receiptNo
              if (feeMatch.paymentDate) matchedStudent.paymentDate = feeMatch.paymentDate
            }
          }
        } catch (e) {}
      }
    }

    // 2. Fetch from DB if not found or to merge
    if (!matchedStudent) {
      try {
        const res = await fetchStudentById(studentId)
        if (res && res.success && res.data) {
          matchedStudent = res.data
        } else {
          const allRes = await fetchStudents()
          if (allRes && allRes.success && Array.isArray(allRes.data) && allRes.data.length > 0) {
            matchedStudent = allRes.data.find((s: any) =>
              String(s.id).trim() === studentId.trim() ||
              String(s.admission_no || '').trim().toLowerCase() === studentId.trim().toLowerCase()
            ) || allRes.data[0]
          }
        }
      } catch (e) {
        console.error('Error fetching student from DB:', e)
      }
    }

    if (matchedStudent) {
      const normalized = normalizeStudent(matchedStudent)
      setStudentData(normalized)
    } else {
      // Fallback data
      setStudentData(normalizeStudent({
        id: studentId || '1791137471385',
        firstName: 'Md fahad',
        lastName: '',
        admissionNo: 'ADM-6666',
        rollNo: '1',
        class: 'Class 1',
        section: 'A',
        mobileNo: '8299514784',
        emailId: 'fahad@gmail.com',
        admissionDate: '19/11/2026',
        fees_status: 'Unpaid'
      }))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudent()
  }, [studentId])

  const handleToggleStatus = () => {
    if (!studentData) return
    const newStatus = studentData.status === 'Active' ? 'Inactive' : 'Active'
    const updated = { ...studentData, status: newStatus }
    setStudentData(updated)

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_students')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          if (Array.isArray(list)) {
            const next = list.map((s: any) => {
              if (String(s.id) === String(studentData.id) || String(s.admission_no) === String(studentData.admissionNo)) {
                return { ...s, status: newStatus }
              }
              return s
            })
            localStorage.setItem('school_students', JSON.stringify(next))
          }
        } catch (e) {}
      }
    }
    toast.success(`Student status set to ${newStatus}`)
  }

  const handlePaymentSuccess = (updatedStudent: StudentFeeItem) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_students')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          if (Array.isArray(list)) {
            const updatedList = list.map((s: any) => {
              if (String(s.id || s.admission_no) === String(studentData?.id || studentData?.admissionNo)) {
                return {
                  ...s,
                  fees_status: 'Paid',
                  status: 'Paid',
                  paid: updatedStudent.paid,
                  pending: '0/-',
                  receiptNo: updatedStudent.receiptNo,
                  paymentDate: updatedStudent.paymentDate,
                  paymentMode: updatedStudent.paymentMode
                }
              }
              return s
            })
            localStorage.setItem('school_students', JSON.stringify(updatedList))
          }
        } catch (e) {}
      }

      const savedAllFees = localStorage.getItem('school_all_fees')
      if (savedAllFees) {
        try {
          const parsed = JSON.parse(savedAllFees)
          if (Array.isArray(parsed)) {
            const syncAll = parsed.map((item: any) => {
              if (String(item.id || item.admissionNo) === String(studentData?.id || studentData?.admissionNo)) {
                return {
                  ...item,
                  status: 'Paid',
                  paid: updatedStudent.paid,
                  pending: '0/-',
                  receiptNo: updatedStudent.receiptNo,
                  paymentDate: updatedStudent.paymentDate
                }
              }
              return item
            })
            localStorage.setItem('school_all_fees', JSON.stringify(syncAll))
          }
        } catch (e) {}
      }
    }

    setStudentData((prev: any) => ({
      ...prev,
      fees_status: 'Paid',
      status: 'Paid',
      paid: updatedStudent.paid,
      pending: '0/-',
      receiptNo: updatedStudent.receiptNo,
      paymentDate: updatedStudent.paymentDate,
      paymentMode: updatedStudent.paymentMode
    }))
    setShowCollectFee(false)
    setShowReceiptModal(true)
    toast.success('Payment settled successfully!')
  }

  const handleOpenEdit = (step = 1) => {
    setEditStep(step)
    setShowEditModal(true)
  }

  const handleDeleteStudent = async () => {
    if (!studentData) return
    const studentName = studentData.name || 'this student'
    if (confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone.`)) {
      try {
        const studentIdToDel = studentData.id || studentData.admissionNo || studentId
        await deleteStudent(studentIdToDel)
      } catch (e) {
        console.error('Error deleting student from DB:', e)
      }

      // Remove from localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('school_students')
        if (saved) {
          try {
            const list = JSON.parse(saved)
            if (Array.isArray(list)) {
              const updated = list.filter((s: any) => 
                String(s.id) !== String(studentData.id) && 
                String(s.admission_no || s.admissionNo) !== String(studentData.admissionNo || studentData.admission_no)
              )
              localStorage.setItem('school_students', JSON.stringify(updated))
            }
          } catch (e) {}
        }
        const savedFees = localStorage.getItem('school_all_fees')
        if (savedFees) {
          try {
            const feeList = JSON.parse(savedFees)
            if (Array.isArray(feeList)) {
              const updatedFees = feeList.filter((f: any) => 
                String(f.id) !== String(studentData.id) && 
                String(f.admissionNo || f.admission_no) !== String(studentData.admissionNo || studentData.admission_no)
              )
              localStorage.setItem('school_all_fees', JSON.stringify(updatedFees))
            }
          } catch (e) {}
        }
      }

      toast.success(`Student "${studentName}" deleted successfully`)
      router.push('/institute/students')
    }
  }

  const handleResetPayment = () => {
    if (confirm('Are you sure you want to void this payment record and revert status to Unpaid?')) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('school_students')
        if (saved) {
          try {
            const list = JSON.parse(saved)
            if (Array.isArray(list)) {
              const updatedList = list.map((s: any) => {
                if (String(s.id || s.admission_no) === String(studentData?.id || studentData?.admissionNo)) {
                  return {
                    ...s,
                    fees_status: 'Unpaid',
                    status: 'Unpaid',
                    paid: '0/-',
                    pending: s.total || '2,200/-',
                    receiptNo: '',
                    paymentDate: '',
                    paymentMode: 'Cash'
                  }
                }
                return s
              })
              localStorage.setItem('school_students', JSON.stringify(updatedList))
            }
          } catch (e) {}
        }
        const savedFees = localStorage.getItem('school_all_fees')
        if (savedFees) {
          try {
            const parsed = JSON.parse(savedFees)
            if (Array.isArray(parsed)) {
              const syncAll = parsed.map((item: any) => {
                if (String(item.id || item.admissionNo) === String(studentData?.id || studentData?.admissionNo)) {
                  return {
                    ...item,
                    status: 'Unpaid',
                    paid: '0/-',
                    pending: item.total || '2,200/-',
                    receiptNo: '',
                    paymentDate: ''
                  }
                }
                return item
              })
              localStorage.setItem('school_all_fees', JSON.stringify(syncAll))
            }
          } catch (e) {}
        }
      }
      setStudentData((prev: any) => ({
        ...prev,
        fees_status: 'Unpaid',
        status: 'Unpaid',
        paid: '0/-',
        pending: prev.total || '2,200/-',
        receiptNo: '',
        paymentDate: ''
      }))
      toast.success('Payment record voided. Fee status reset to Unpaid.')
    }
  }

  if (loading || !studentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-sm font-semibold">Loading student profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/institute/students')} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Profile</h2>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Collect Fee Button */}
          <button 
            type="button"
            onClick={() => setShowCollectFee(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Collect Student Fee"
          >
            <CreditCard className="w-4 h-4" /> Collect Fee
          </button>

          {/* Edit Student Button */}
          <button 
            type="button"
            onClick={() => handleOpenEdit(1)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>

          {/* Delete Student Button */}
          <button 
            type="button"
            onClick={handleDeleteStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer"
            title="Delete Student Record"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          <button 
            onClick={() => router.push('/institute/students')} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors ml-1"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-8">
        
        {/* Top Info Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-8">
          
          {/* Left: Avatar & Name */}
          <div className="flex flex-col items-center gap-3 w-48 shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden relative border border-slate-200 dark:border-slate-600 shadow-inner">
              <img 
                src={studentData.avatar} 
                alt={studentData.name} 
                className="w-full h-full object-cover" 
                onError={(e: any) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentData.firstName || 'Student')}`
                }}
              />
              <div 
                onClick={() => handleOpenEdit(1)}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm cursor-pointer hover:bg-teal-700 transition-transform hover:scale-105"
                title="Change Avatar / Details"
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{studentData.name}</h3>
                <div 
                  onClick={handleToggleStatus}
                  className={`w-8 h-4 ${studentData.status === 'Active' ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'} rounded-full flex items-center ${studentData.status === 'Active' ? 'justify-end' : 'justify-start'} px-0.5 cursor-pointer shadow-inner transition-colors`}
                  title={`Status: ${studentData.status} (Click to toggle)`}
                >
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-500">User ID : {studentData.admissionNo || studentData.id}</p>
            </div>
          </div>

          {/* Right: Admission Information */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-teal-600">
                <Upload className="w-4 h-4" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Admission Information</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowCollectFee(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Collect Fee
                </button>
                <button 
                  type="button"
                  onClick={() => handleOpenEdit(1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteStudent}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow label="Admission No." value={studentData.admissionNo} />
              <InfoRow label="Roll No." value={studentData.rollNo} />
              <InfoRow label="Class" value={studentData.class} />
              <InfoRow label="Section" value={studentData.section ? `Section ${studentData.section}` : '-'} />
              <InfoRow label="Mobile No." value={studentData.mobileNo} />
              <InfoRow label="Admission Date" value={studentData.admissionDate} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 px-2 justify-between">
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-teal-600 text-teal-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowCollectFee(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f766e] text-white hover:bg-teal-700 shadow-2xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Collect Fee
            </button>
            <button 
              type="button"
              onClick={() => handleOpenEdit(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button 
              type="button"
              onClick={handleDeleteStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === 'Student Details' && (
            <StudentDetailsTab 
              data={studentData} 
              onEditStep={handleOpenEdit} 
            />
          )}
          {activeTab === 'Attendance' && <AttendanceTab />}
          {activeTab === 'Leave' && <LeaveTab />}
          {activeTab === 'Fees' && (
            <FeesTab 
              student={studentData} 
              onCollectFee={() => setShowCollectFee(true)}
              onViewReceipt={() => setShowReceiptModal(true)}
              onResetPayment={handleResetPayment}
            />
          )}
          {activeTab === 'Login Details' && (
            <LoginDetailsTab 
              student={studentData} 
              onSave={(creds: any) => {
                setStudentData((prev: any) => ({ ...prev, ...creds }))
              }}
            />
          )}
        </div>

      </div>

      {/* Edit Student Wizard Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl">
            <AddStudentWizard
              initialData={studentData}
              initialStep={editStep}
              onClose={() => {
                setShowEditModal(false)
                loadStudent()
              }}
            />
          </div>
        </div>
      )}

      {/* Fee Collection Wizard Modal */}
      {showCollectFee && (
        <FeeCollectionWizardModal
          student={studentToFeeItem(studentData)}
          onClose={() => setShowCollectFee(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Fee Receipt Modal */}
      {showReceiptModal && (
        <FeeReceiptModal
          record={studentToFeeItem(studentData)}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  )
}

function StudentDetailsTab({ data, onEditStep }: { data: any; onEditStep: (step: number) => void }) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Fee Structure Details Card */}
      <FeeDetailsCard data={data} onEdit={() => onEditStep(5)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <PersonalDetailsCard data={data} onEdit={() => onEditStep(1)} />
          <EducationTableCard data={data} onEdit={() => onEditStep(2)} />
          <ParentsDetailsCard data={data} onEdit={() => onEditStep(3)} />
          <BirthCertificateCard data={data} onEdit={() => onEditStep(4)} />
          <BplRteDetailsCard data={data} onEdit={() => onEditStep(4)} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <PreviousSchoolCard data={data} onEdit={() => onEditStep(2)} />
          <div className="grid grid-cols-2 gap-6">
            <MedicalDetailsCard data={data} onEdit={() => onEditStep(1)} />
            <TCDetailsCard data={data} onEdit={() => onEditStep(2)} />
          </div>
          <AddressDetailsCard data={data} onEdit={() => onEditStep(3)} />
          <GovtIdDetailsCard data={data} onEdit={() => onEditStep(4)} />
          <ScholarshipDetailsCard data={data} onEdit={() => onEditStep(4)} />
          <GovtPortalDetailsCard data={data} onEdit={() => onEditStep(4)} />
        </div>

      </div>
    </div>
  )
}

function AttendanceTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = Array.from({length: 31}, (_, i) => i + 1)
  
  const getStatus = (m: number, d: number) => {
    const n = m * 31 + d;
    if (n % 28 === 0) return 'H' // Holiday
    if (n % 19 === 0) return 'A' // Absent
    if (n % 42 === 0) return 'L' // Late
    if (n % 57 === 0) return 'F' // Half Day
    return 'P' // Present
  }

  const getColor = (status: string) => {
    switch(status) {
      case 'P': return 'text-emerald-500 font-bold'
      case 'A': return 'text-red-500 font-bold'
      case 'H': return 'text-purple-500 font-bold'
      case 'L': return 'text-yellow-500 font-bold'
      case 'F': return 'text-blue-500 font-bold'
      default: return 'text-slate-300'
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-6 animate-in fade-in">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Select Session</label>
            <select className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none w-40 font-semibold focus:ring-2 focus:ring-teal-500">
              <option>2025-2026</option>
            </select>
          </div>
          <button className="mt-5 w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm hover:bg-teal-700 shrink-0">
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold md:mt-5 flex-wrap">
          <span className="text-slate-700 dark:text-slate-300">Present : <span className="text-emerald-500">P</span></span>
          <span className="text-slate-700 dark:text-slate-300">Absent : <span className="text-red-500">A</span></span>
          <span className="text-slate-700 dark:text-slate-300">Holiday : <span className="text-purple-500">H</span></span>
          <span className="text-slate-700 dark:text-slate-300">Late : <span className="text-yellow-500">L</span></span>
          <span className="text-slate-700 dark:text-slate-300">Half Day : <span className="text-blue-500">F</span></span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard value="227" label="Total Present" color="text-emerald-500" bg="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" iconBg="bg-emerald-100 dark:bg-emerald-900" />
        <MetricCard value="70" label="Total Absent" color="text-red-500" bg="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" iconBg="bg-red-100 dark:bg-red-900" />
        <MetricCard value="27" label="Half Day" color="text-blue-500" bg="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" iconBg="bg-blue-100 dark:bg-blue-900" />
        <MetricCard value="28" label="Total Late" color="text-yellow-600" bg="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800" iconBg="bg-yellow-100 dark:bg-yellow-900" />
        <MetricCard value="12" label="Total Holiday" color="text-purple-500" bg="bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800" iconBg="bg-purple-100 dark:bg-purple-900" />
      </div>

      {/* Attendance Grid */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl mt-2 bg-white dark:bg-slate-800">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
              <th className="py-3 px-2 border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-50 dark:bg-slate-800">Month</th>
              {days.map(d => <th key={d} className="py-3 px-1.5 min-w-[24px]">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {months.map((month, mIdx) => (
              <tr key={month} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 sticky left-0">{month}</td>
                {days.map(d => {
                  const status = getStatus(mIdx, d)
                  return (
                    <td key={d} className={`py-3 px-1.5 ${getColor(status)}`}>
                      {status}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

function MetricCard({ value, label, color, bg, iconBg }: any) {
  return (
    <div className={`p-4 rounded-xl border ${bg} flex items-center justify-between`}>
      <div className="flex flex-col">
        <span className={`text-2xl font-black ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${color}`}>
        <CheckCircle2 className="w-4 h-4" />
      </div>
    </div>
  )
}

function LeaveTab() {
  const leaves = [
    { type: 'Medical Leave', date: '17/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
    { type: 'Casual Leave', date: '12/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
    { type: 'Special Leave', date: '12/11/2025-13/11/2025', duration: '3', applyDate: '11/11/2025' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in flex flex-col min-h-[400px]">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Leave</h3>
          <div className="h-px bg-slate-200 dark:bg-slate-700 w-48 hidden sm:block"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800 dark:text-slate-100"
            />
          </div>
          <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none w-32 focus:ring-2 focus:ring-teal-500">
            <option>2025-2026</option>
          </select>
          <button className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-teal-700 shrink-0">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="min-w-[800px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">S. No.</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Leave Type</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Date</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Duration</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Apply Date</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{i+1}.</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-semibold">{l.type}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{l.date}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{l.duration}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{l.applyDate}</td>
                  <td className="py-4 px-6 flex justify-center">
                    <button className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-500 hover:bg-sky-200 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing 1-3 of 3 Entries</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50"><ChevronsLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-600 text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-teal-600 font-bold hover:bg-slate-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeesTab({ 
  student, 
  onCollectFee, 
  onViewReceipt,
  onResetPayment
}: { 
  student: any; 
  onCollectFee: () => void; 
  onViewReceipt: () => void; 
  onResetPayment?: () => void;
}) {
  const [feeCategory, setFeeCategory] = useState('All Fee')
  const feeItem = useMemo(() => studentToFeeItem(student), [student])

  const parseNum = (str: any) => parseFloat(String(str || '').replace(/[^0-9.]/g, '')) || 0

  const regNum = parseNum(student?.regFee || student?.reg)
  const admNum = parseNum(student?.admFee || student?.adm)
  let classNum = student?.isRteStudent === 'Yes' ? 0 : parseNum(student?.classFee || student?.class_fee)
  if (classNum === 0 && student?.isRteStudent !== 'Yes') {
    classNum = parseNum(resolveClassFee(student?.class, false))
  }
  const libNum = parseNum(student?.libFee || student?.lib)
  const examNum = parseNum(student?.examFee || student?.exam)
  const hostelNum = parseNum(student?.hostelFee || student?.hostel)
  const transNum = parseNum(student?.transFee || student?.trans)

  const calcPromo = (base: number, promo?: string) => {
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
      const numMatch = promo.match(/\d+/)
      if (numMatch) {
        const extracted = parseFloat(numMatch[0])
        if (extracted <= 100) { isPercent = true; pVal = extracted }
        else { isPercent = false; pVal = extracted }
      }
    }

    if (isPercent) {
      return Math.round((base * (pVal || 0)) / 100)
    }
    return Math.min(base, Math.round(pVal || 0))
  }

  const grossTotal = regNum + admNum + classNum + libNum + examNum + hostelNum + transNum
  const regDiscount = calcPromo(regNum, student?.regFeePromo)
  const admDiscount = calcPromo(admNum, student?.admFeePromo)
  const classDiscount = calcPromo(classNum, student?.classFeePromo)
  const transDiscount = calcPromo(transNum, student?.transFeePromo)
  const totalDiscount = regDiscount + admDiscount + classDiscount + transDiscount
  const netTotal = Math.max(0, grossTotal - totalDiscount)

  const isPaid = student?.fees_status === 'Paid' || student?.status === 'Paid'

  // Itemized breakdown for specific fee view
  const categoryDetails: { [key: string]: { label: string; base: number; promo?: string; discount: number; net: number } } = {
    'Registration Fee': { label: 'Registration Fee', base: regNum, promo: student?.regFeePromo, discount: regDiscount, net: Math.max(0, regNum - regDiscount) },
    'Admission Fee': { label: 'Admission Fee', base: admNum, promo: student?.admFeePromo, discount: admDiscount, net: Math.max(0, admNum - admDiscount) },
    'Class Fee': { label: 'Class Fee', base: classNum, promo: student?.classFeePromo, discount: classDiscount, net: Math.max(0, classNum - classDiscount) },
    'Transportation Fee': { label: 'Transportation Fee', base: transNum, promo: student?.transFeePromo, discount: transDiscount, net: Math.max(0, transNum - transDiscount) },
    'Library Fee': { label: 'Library Fee', base: libNum, promo: student?.libFeePromo, discount: 0, net: libNum },
    'Exam Fee': { label: 'Exam Fee', base: examNum, promo: student?.examFeePromo, discount: 0, net: examNum },
    'Hostel Fee': { label: 'Hostel Fee', base: hostelNum, promo: student?.hostelFeePromo, discount: 0, net: hostelNum }
  }

  const currentCat = categoryDetails[feeCategory] || categoryDetails['Class Fee']

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in flex flex-col min-h-[500px]">
      
      {/* Header Controls */}
      <div className="p-6 pb-2 flex flex-wrap items-center gap-4">
        <select 
          value={feeCategory}
          onChange={(e) => setFeeCategory(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none w-52 focus:ring-2 focus:ring-teal-500 shadow-sm"
        >
          <option>All Fee</option>
          <option>Class Fee</option>
          <option>Registration Fee</option>
          <option>Admission Fee</option>
          <option>Transportation Fee</option>
          <option>Library Fee</option>
          <option>Exam Fee</option>
          <option>Hostel Fee</option>
        </select>
        <select className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none w-36 focus:ring-2 focus:ring-teal-500 shadow-sm">
          <option>2025-26</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          {/* Always provide Collect Fee button on detail page */}
          <button 
            type="button"
            onClick={onCollectFee}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Collect Fee / Advance Payment"
          >
            <CreditCard className="w-4 h-4" /> Collect Fee
          </button>
          {isPaid && (
            <button 
              type="button"
              onClick={onViewReceipt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors shadow-2xs cursor-pointer"
              title="View Official Receipt"
            >
              <Receipt className="w-4 h-4" /> View Receipt
            </button>
          )}
          {isPaid && onResetPayment && (
            <button 
              type="button"
              onClick={onResetPayment}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              title="Void payment and reset fee status to Unpaid"
            >
              <Trash2 className="w-3.5 h-3.5" /> Void Payment
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{feeCategory}</h3>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* All Fee View */}
        {feeCategory === 'All Fee' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[1050px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Month</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Registration Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Admission Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Class Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Library Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Exam Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Hostel Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Transportation Fee</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-[13px]">
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-200">Nov 2026</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {regNum > 0 ? (
                          <div>
                            <span className="font-semibold">₹{regNum}/-</span>
                            {regDiscount > 0 && <span className="block text-[10px] text-emerald-600 font-bold">-₹{regDiscount} ({student?.regFeePromo})</span>}
                          </div>
                        ) : '0/-'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {admNum > 0 ? (
                          <div>
                            <span className="font-semibold">₹{admNum}/-</span>
                            {admDiscount > 0 && <span className="block text-[10px] text-emerald-600 font-bold">-₹{admDiscount}</span>}
                          </div>
                        ) : '0/-'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {classNum > 0 ? (
                          <div>
                            <span className="font-semibold">₹{classNum}/-</span>
                            {classDiscount > 0 && <span className="block text-[10px] text-emerald-600 font-bold">-₹{classDiscount} ({student?.classFeePromo})</span>}
                          </div>
                        ) : '0/-'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{libNum > 0 ? `₹${libNum}/-` : '0/-'}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{examNum > 0 ? `₹${examNum}/-` : '0/-'}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{hostelNum > 0 ? `₹${hostelNum}/-` : '0/-'}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {transNum > 0 ? (
                          <div>
                            <span className="font-semibold">₹{transNum}/-</span>
                            {transDiscount > 0 && <span className="block text-[10px] text-emerald-600 font-bold">-₹{transDiscount} ({student?.transFeePromo})</span>}
                          </div>
                        ) : '0/-'}
                      </td>
                      <td className="py-4 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={onCollectFee}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0f766e] hover:bg-teal-700 text-white transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                            title="Collect Fee via Multi-Step Wizard"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect Fee</span>
                          </button>
                          {isPaid && (
                            <button
                              type="button"
                              onClick={onViewReceipt}
                              className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                              title="View Official Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grand Total & Payment Card */}
            <div className="flex flex-col items-center gap-4 mt-4 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl mx-auto w-full">
              <div className="w-full flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Scheduled Gross Total:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">₹{grossTotal.toLocaleString()}/-</span>
              </div>
              {totalDiscount > 0 && (
                <div className="w-full flex items-center justify-between text-sm text-emerald-600">
                  <span className="font-semibold">Promo Discount Savings:</span>
                  <span className="font-bold">- ₹{totalDiscount.toLocaleString()}/-</span>
                </div>
              )}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">Total Net Amount</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">₹{netTotal.toLocaleString()}/-</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button 
                    type="button"
                    onClick={onCollectFee} 
                    className="bg-[#0f766e] hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> Collect Fee
                  </button>
                  {isPaid && (
                    <button 
                      type="button"
                      onClick={onViewReceipt}
                      className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" /> View Paid Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Fee View (For any specific fee category) */}
        {feeCategory !== 'All Fee' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[1000px] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Month</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">{feeCategory} (Gross)</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Total Fine</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Pending Fee</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Promo Code</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Net Fee</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Payment</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="py-4 px-3 font-bold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-[13px]">
                      <td className="py-4 px-3 font-semibold text-slate-600 dark:text-slate-300">Nov 2026</td>
                      <td className="py-4 px-3 text-slate-600 dark:text-slate-300 font-semibold">₹{currentCat.base}/-</td>
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-400">0/-</td>
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-400">
                        {isPaid ? '0/-' : `₹${currentCat.net}/-`}
                      </td>
                      <td className="py-4 px-3">
                        {currentCat.promo ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {currentCat.promo} (-₹{currentCat.discount})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-3 font-bold text-slate-700 dark:text-slate-200">₹{currentCat.net}/-</td>
                      <td className="py-4 px-3">
                        <button 
                          type="button"
                          onClick={onCollectFee} 
                          className="bg-[#0f766e] hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect Fee</span>
                        </button>
                      </td>
                      <td className="py-4 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex justify-center gap-1.5">
                          {isPaid && (
                            <button 
                              onClick={onViewReceipt}
                              title="View Receipt"
                              className="w-7 h-7 flex items-center justify-center bg-teal-100 dark:bg-teal-950 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded hover:bg-emerald-200 transition-colors"
                            title="Verified Head"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function LoginDetailsTab({ student, onSave }: { student: any; onSave: (creds: any) => void }) {
  const [userName, setUserName] = useState(student?.userName || student?.email || student?.admissionNo || '')
  const [password, setPassword] = useState(student?.password || 'Student@123')
  const [confirmPassword, setConfirmPassword] = useState(student?.password || 'Student@123')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSave = () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_students')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          if (Array.isArray(list)) {
            const next = list.map((s: any) => {
              if (String(s.id) === String(student.id) || String(s.admission_no) === String(student.admissionNo)) {
                return { ...s, userName, password }
              }
              return s
            })
            localStorage.setItem('school_students', JSON.stringify(next))
          }
        } catch (e) {}
      }
    }

    onSave({ userName, password })
    toast.success('Login credentials updated successfully!')
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Login/Account Details</h3>
        <div className="h-px bg-slate-300 dark:bg-slate-700 w-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">User Name</label>
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Save className="w-4 h-4" /> Save Credentials
        </button>
      </div>
    </div>
  )
}
