'use client'

export interface AdmitCardConfig {
  id: number
  setupId?: string
  className: string
  examName: string
  admitCardLabel: string
  timeTableId: number
  session: string
  schoolName: string
  schoolAddress: string
  displayFields: { [key: string]: boolean }
  status: 'Active' | 'Inactive'
  instructions: string
  showExamTimeTable?: boolean
  noOfPrintPerPage?: string
  headerNameFontSize?: string
  headerDetailsFontSize?: string
  studentDetailsFontSize?: string
  timetableDetailsFontSize?: string
  headingFontSize?: string
  defaultFontSize?: string
  spacing?: string
  studentPhotoSize?: string
  studentPhotoWidth?: string
  studentPhotoHeight?: string
  teacherSignLabel?: string
  studentSignLabel?: string
  parentSignLabel?: string
  principalSignLabel?: string
  principalName?: string
  signatureWidth?: string
  signatureFontSize?: string
  schoolStampWidth?: string
  schoolLogo?: string
  schoolLogoWidth?: string
  schoolLogoHeight?: string
  qrCodeSize?: string
  logoPosition?: 'left' | 'center' | 'right' | string
  contentPosition?: 'left' | 'center' | 'right' | string
  photoPosition?: 'right' | 'left' | string
  signatureOrder?: string[]
  templateStyle?: string
  themeColor?: string
  reportingTimeValue?: string
  gateClosureValue?: string
  customLabels?: Record<string, string>
  elementOffsets?: Record<string, { x: number; y: number }>
  elementScales?: Record<string, number>
  dateCreated: string
  timeCreated: string
}

export interface TimeTableSubject {
  subjectName: string
  date: string
  fromTime: string
  toTime: string
}

export interface TimeTableEntry {
  id: number
  title: string
  classGrade: string
  session: string
  subjects: TimeTableSubject[]
  dateCreated: string
  timeCreated: string
}

const DEFAULT_DISPLAY_FIELDS = {
  name: true,
  fatherName: true,
  motherName: true,
  mobileNo: false,
  admissionNo: true,
  registrationNo: true,
  rollNo: true,
  enrollmentNo: false,
  dob: true,
  address: true,
  class: true,
  section: true,
  photo: true,
  logo: true,
  studentSign: true,
  teacherSign: true,
  principalSign: true,
  parentSign: true,
  schoolStamp: false
}

const DEFAULT_INSTRUCTIONS =
  '1. Reporting & Gate Closure Time: Candidates must report to the examination center by 09:30 AM IST. Gate closure time is 09:50 AM (Sharp).\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.'

export function getStoredAdmitCards(): AdmitCardConfig[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('exam_admit_cards')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Error reading exam_admit_cards:', e)
    return []
  }
}

export function saveStoredAdmitCards(cards: AdmitCardConfig[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('exam_admit_cards', JSON.stringify(cards))
  } catch (e) {
    console.error('Error saving exam_admit_cards:', e)
  }
}

export function getStoredTimetables(): TimeTableEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('exam_timetables')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Error reading exam_timetables:', e)
    return []
  }
}

export function saveStoredTimetables(tables: TimeTableEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('exam_timetables', JSON.stringify(tables))
  } catch (e) {
    console.error('Error saving exam_timetables:', e)
  }
}

/**
 * Creates or updates an Admit Card and an Exam TimeTable simultaneously for a given Marksheet Setup.
 */
export function generateAdmitCardAndTimetableForSetup(setup: {
  id?: string
  exam?: string
  examName?: string
  classGrade?: string
  session?: string
  examDate?: string
  admitCardDate?: string
  config?: any
  date?: string
  time?: string
}): { admitCard: AdmitCardConfig; timetable: TimeTableEntry } {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB')
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const examTitle = setup.exam || setup.examName || 'Annual Examination'
  const baseClassName =
    setup.config?.className ||
    (setup.classGrade ? setup.classGrade.split('(')[0].trim() : 'Class 10')
  const sessionStr = setup.session || '2025-2026'

  // Build subject list from setup config
  let subjects: TimeTableSubject[] = []
  if (Array.isArray(setup.config?.subjects) && setup.config.subjects.length > 0) {
    subjects = setup.config.subjects.map((sub: any, idx: number) => {
      let subDate = sub.examDate || setup.examDate
      if (!subDate) {
        const d = new Date()
        d.setDate(d.getDate() + idx)
        subDate = d.toISOString().split('T')[0]
      }
      return {
        subjectName: sub.subjectName || `Paper ${idx + 1}`,
        date: subDate,
        fromTime: sub.startTime || sub.fromTime || '10:00',
        toTime: sub.endTime || sub.toTime || '13:00'
      }
    })
  } else {
    // Standard default academic subjects
    const defaultList = ['English Core', 'Mathematics', 'General Science', 'Social Science', 'Hindi / Regional']
    subjects = defaultList.map((name, idx) => {
      const d = new Date()
      d.setDate(d.getDate() + idx)
      return {
        subjectName: name,
        date: d.toISOString().split('T')[0],
        fromTime: '10:00',
        toTime: '13:00'
      }
    })
  }

  // Create or identify timetable
  const currentTTs = getStoredTimetables()
  const existingTT = currentTTs.find(
    t => t.title.toLowerCase() === examTitle.toLowerCase() && t.classGrade === baseClassName
  )

  const timetableId = existingTT ? existingTT.id : Date.now()
  const timetableEntry: TimeTableEntry = {
    id: timetableId,
    title: examTitle,
    classGrade: baseClassName,
    session: sessionStr,
    subjects,
    dateCreated: existingTT ? existingTT.dateCreated : dateStr,
    timeCreated: existingTT ? existingTT.timeCreated : timeStr
  }

  if (existingTT) {
    const updatedTTs = currentTTs.map(t => (t.id === timetableId ? timetableEntry : t))
    saveStoredTimetables(updatedTTs)
  } else {
    saveStoredTimetables([timetableEntry, ...currentTTs])
  }

  // School info from config
  const schoolName =
    setup.config?.schoolDetails?.schoolName || 'COSMOPOLITAN INTER COLLEGE'
  const schoolAddress =
    setup.config?.schoolDetails?.schoolAddress ||
    'Knowledge Park, Sector 62, New Delhi - 110092'

  // Create or update Admit Card
  const currentCards = getStoredAdmitCards()
  const existingCard = currentCards.find(
    c =>
      (setup.id && c.setupId === setup.id) ||
      (c.examName.toLowerCase() === examTitle.toLowerCase() && c.className === baseClassName)
  )

  const customAdmit = setup.config?.admitCardSettings || {}
  const admitCardId = existingCard ? existingCard.id : (Date.now() + Math.floor(Math.random() * 1000))
  const admitCard: AdmitCardConfig = {
    id: admitCardId,
    setupId: setup.id,
    className: baseClassName,
    examName: examTitle,
    admitCardLabel: customAdmit.admitLabel || existingCard?.admitCardLabel || 'Admit Card',
    templateStyle: setup.config?.admitTemplateStyle || customAdmit.templateStyle || existingCard?.templateStyle || 'Classic Board',
    themeColor: setup.config?.admitThemeColor || customAdmit.themeColor || existingCard?.themeColor || '#1e3a8a',
    reportingTimeValue: customAdmit.reportingTimeValue || existingCard?.reportingTimeValue || '09:30 AM IST',
    gateClosureValue: customAdmit.gateClosureValue || existingCard?.gateClosureValue || '09:50 AM (Sharp)',
    timeTableId: timetableId,
    session: sessionStr,
    schoolName,
    schoolAddress,
    displayFields: customAdmit.displayFields || existingCard?.displayFields || { ...DEFAULT_DISPLAY_FIELDS },
    status: customAdmit.status !== undefined 
      ? (customAdmit.status ? 'Active' : 'Inactive') 
      : (existingCard?.status || 'Active'),
    instructions: customAdmit.instructions || existingCard?.instructions || DEFAULT_INSTRUCTIONS,
    showExamTimeTable: customAdmit.showExamTimeTable ?? existingCard?.showExamTimeTable ?? true,
    noOfPrintPerPage: customAdmit.noOfPrintPerPage || existingCard?.noOfPrintPerPage || '1',
    headerNameFontSize: customAdmit.headerNameFontSize || existingCard?.headerNameFontSize || '22',
    headerDetailsFontSize: customAdmit.headerDetailsFontSize || existingCard?.headerDetailsFontSize || '10',
    studentDetailsFontSize: customAdmit.studentDetailsFontSize || existingCard?.studentDetailsFontSize || '11',
    timetableDetailsFontSize: customAdmit.timetableDetailsFontSize || existingCard?.timetableDetailsFontSize || '11',
    headingFontSize: customAdmit.headingFontSize || existingCard?.headingFontSize || '13',
    defaultFontSize: customAdmit.defaultFontSize || existingCard?.defaultFontSize || '9',
    spacing: customAdmit.spacing || existingCard?.spacing || '20',
    studentPhotoSize: customAdmit.studentPhotoSize || existingCard?.studentPhotoSize || '100',
    teacherSignLabel: customAdmit.teacherSignLabel || existingCard?.teacherSignLabel || "Class Teacher's Sign.",
    studentSignLabel: customAdmit.studentSignLabel || existingCard?.studentSignLabel || "Student's Sign.",
    parentSignLabel: customAdmit.parentSignLabel || existingCard?.parentSignLabel || "Parent's Sign.",
    principalSignLabel: customAdmit.principalSignLabel || existingCard?.principalSignLabel || "Principal's Sign.",
    principalName: setup.config?.schoolDetails?.principalName || customAdmit.principalName || existingCard?.principalName || 'fahad',
    signatureWidth: customAdmit.signatureWidth || existingCard?.signatureWidth || '100',
    signatureFontSize: customAdmit.signatureFontSize || existingCard?.signatureFontSize || '9',
    schoolStampWidth: customAdmit.schoolStampWidth || existingCard?.schoolStampWidth || '56',
    qrCodeSize: customAdmit.qrCodeSize || existingCard?.qrCodeSize || '72',
    dateCreated: existingCard ? existingCard.dateCreated : dateStr,
    timeCreated: existingCard ? existingCard.timeCreated : timeStr
  }

  if (existingCard) {
    const updatedCards = currentCards.map(c => (c.id === admitCardId ? admitCard : c))
    saveStoredAdmitCards(updatedCards)
  } else {
    saveStoredAdmitCards([admitCard, ...currentCards])
  }

  return { admitCard, timetable: timetableEntry }
}

/**
 * Ensures all PostgreSQL Marksheet Setups have a synchronized Admit Card.
 */
export function syncAllSetupsWithAdmitCards(setups: any[]): {
  createdCount: number
  admitCards: AdmitCardConfig[]
} {
  if (!Array.isArray(setups) || setups.length === 0) {
    return { createdCount: 0, admitCards: getStoredAdmitCards() }
  }

  let createdCount = 0
  const currentCards = getStoredAdmitCards()

  setups.forEach(setup => {
    const examTitle = setup.exam || setup.examName || ''
    const baseClassName =
      setup.config?.className ||
      (setup.classGrade ? setup.classGrade.split('(')[0].trim() : '')

    if (!examTitle || !baseClassName) return

    const exists = currentCards.some(
      c =>
        (setup.id && c.setupId === setup.id) ||
        (c.examName.toLowerCase() === examTitle.toLowerCase() && c.className === baseClassName)
    )

    if (!exists) {
      generateAdmitCardAndTimetableForSetup(setup)
      createdCount++
    }
  })

  return {
    createdCount,
    admitCards: getStoredAdmitCards()
  }
}
