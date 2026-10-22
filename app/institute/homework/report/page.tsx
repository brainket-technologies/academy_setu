'use client'

import React, { useState, useMemo } from 'react'
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, Filter, 
  Download, Printer, ChevronRight, FileText, Calendar, 
  ArrowUpRight, AlertCircle, Award, PieChart, Users, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface ClassReportStat {
  classes: string
  assigned: number
  submitted: number
  evaluated: number
  completionRate: number
}

interface SubjectReportStat {
  subject: string
  assigned: number
  submissions: number
  avgScore: string
}

interface HomeworkReportItem {
  id: number
  title: string
  classes: string
  section: string
  subject: string
  assignDate: string
  dueDate: string
  totalStudents: number
  submittedCount: number
  evaluatedCount: number
  status: 'Completed' | 'In Progress' | 'Overdue'
}

const SAMPLE_REPORTS: HomeworkReportItem[] = [
  {
    id: 101,
    title: 'Quadratic Equations Exercise 4.2',
    classes: 'Class 1',
    section: 'A',
    subject: 'Maths',
    assignDate: '20/10/2026',
    dueDate: '22/10/2026',
    totalStudents: 35,
    submittedCount: 32,
    evaluatedCount: 31,
    status: 'Completed'
  },
  {
    id: 102,
    title: 'Tenses and Reported Speech Practice',
    classes: 'Class 1',
    section: 'B',
    subject: 'English',
    assignDate: '19/10/2026',
    dueDate: '21/10/2026',
    totalStudents: 38,
    submittedCount: 35,
    evaluatedCount: 34,
    status: 'Completed'
  },
  {
    id: 103,
    title: 'Laws of Motion Numerical Problems',
    classes: 'Class 1',
    section: 'A',
    subject: 'Physics',
    assignDate: '21/10/2026',
    dueDate: '23/10/2026',
    totalStudents: 35,
    submittedCount: 28,
    evaluatedCount: 22,
    status: 'In Progress'
  },
  {
    id: 104,
    title: 'Water Cycle and Atmospheric Pressure',
    classes: 'Class 2',
    section: 'A',
    subject: 'Science',
    assignDate: '18/10/2026',
    dueDate: '20/10/2026',
    totalStudents: 40,
    submittedCount: 38,
    evaluatedCount: 38,
    status: 'Completed'
  },
  {
    id: 105,
    title: 'Plant Cell vs Animal Cell Diagram',
    classes: 'Class 2',
    section: 'B',
    subject: 'Biology',
    assignDate: '21/10/2026',
    dueDate: '24/10/2026',
    totalStudents: 42,
    submittedCount: 24,
    evaluatedCount: 15,
    status: 'In Progress'
  },
  {
    id: 106,
    title: 'French Revolution Timeline Notes',
    classes: 'Class 3',
    section: 'A',
    subject: 'History',
    assignDate: '15/10/2026',
    dueDate: '17/10/2026',
    totalStudents: 36,
    submittedCount: 30,
    evaluatedCount: 30,
    status: 'Overdue'
  }
]

export default function HomeworkReportPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  const [dateRange, setDateRange] = useState<'all' | 'this_week' | 'this_month'>('this_month')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  // Options
  const classOptions = useMemo(() => {
    if (classesData && classesData.length > 0) {
      return classesData.map((c: any) => c.className || c.name || String(c))
    }
    return ['Class 1', 'Class 2', 'Class 3', 'Class 4']
  }, [classesData])

  const subjectOptions = useMemo(() => {
    if (subjectsData && subjectsData.length > 0) {
      return subjectsData.map((s: any) => s.subjectName || s.name || String(s))
    }
    return ['Maths', 'English', 'Physics', 'Science', 'Biology', 'History']
  }, [subjectsData])

  // Filtered List
  const filteredList = useMemo(() => {
    return SAMPLE_REPORTS.filter(item => {
      if (selectedClass && item.classes !== selectedClass) return false
      if (selectedSubject && !item.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false
      return true
    })
  }, [selectedClass, selectedSubject])

  // Aggregate Stats
  const totalHomeworks = filteredList.length
  const totalExpected = filteredList.reduce((acc, curr) => acc + curr.totalStudents, 0)
  const totalSubmissions = filteredList.reduce((acc, curr) => acc + curr.submittedCount, 0)
  const totalEvaluated = filteredList.reduce((acc, curr) => acc + curr.evaluatedCount, 0)
  const overallCompletionRate = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0

  // Class wise analysis
  const classStats: ClassReportStat[] = useMemo(() => {
    const map: Record<string, { assigned: number; submitted: number; total: number; evaluated: number }> = {}
    SAMPLE_REPORTS.forEach(item => {
      if (!map[item.classes]) {
        map[item.classes] = { assigned: 0, submitted: 0, total: 0, evaluated: 0 }
      }
      map[item.classes].assigned += 1
      map[item.classes].submitted += item.submittedCount
      map[item.classes].total += item.totalStudents
      map[item.classes].evaluated += item.evaluatedCount
    })

    return Object.entries(map).map(([cls, val]) => ({
      classes: cls,
      assigned: val.assigned,
      submitted: val.submitted,
      evaluated: val.evaluated,
      completionRate: val.total > 0 ? Math.round((val.submitted / val.total) * 100) : 0
    }))
  }, [])

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID,Title,Class,Section,Subject,Assign Date,Due Date,Students,Submitted,Evaluated,Status\n']
    const rows = filteredList.map(r => 
      `"${r.id}","${r.title}","${r.classes}","${r.section}","${r.subject}","${r.assignDate}","${r.dueDate}",${r.totalStudents},${r.submittedCount},${r.evaluatedCount},"${r.status}"`
    )
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homework_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 space-y-6">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-emerald-700 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-700 font-semibold">Homework Report</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-200/60">
              <BarChart3 className="w-6 h-6" />
            </span>
            Homework Insights & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View detailed insights and completion statistics of homeworks across all classes.
          </p>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Assigned</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalHomeworks}</h3>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12% this month
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Submissions</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalSubmissions}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Out of {totalExpected} expected</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Evaluated</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalEvaluated}</h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {totalSubmissions - totalEvaluated} pending remarks
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-4 bg-gradient-to-br from-emerald-50/40 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Completion Rate</p>
            <h3 className="text-2xl font-bold text-emerald-900">{overallCompletionRate}%</h3>
            <span className="text-[11px] text-emerald-700 font-medium">Consistently High</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class-wise Completion Bars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Class-wise Homework Completion
            </h3>
            <span className="text-xs text-slate-400">Current Academic Term</span>
          </div>

          <div className="space-y-4 pt-1">
            {classStats.map(stat => (
              <div key={stat.classes} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{stat.classes}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{stat.submitted} submissions</span>
                    <span className="font-bold text-emerald-700">{stat.completionRate}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Grade Distribution
            </h3>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { label: 'Grade A+ (Outstanding)', pct: 44, color: 'bg-emerald-500' },
              { label: 'Grade A (Very Good)', pct: 32, color: 'bg-blue-500' },
              { label: 'Grade B+ & B (Good)', pct: 16, color: 'bg-amber-500' },
              { label: 'Needs Improvement', pct: 8, color: 'bg-rose-500' }
            ].map(item => (
              <div key={item.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-800">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        {/* Table Filters & Actions */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
            >
              <option value="">All Classes</option>
              {classOptions.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['this_week', 'this_month', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDateRange(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    dateRange === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Homework Title</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Assign Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4">Evaluated</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => {
                const pct = Math.round((item.submittedCount / item.totalStudents) * 100)
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.classes} ({item.section})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {item.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{item.assignDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{item.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800">
                          {item.submittedCount} / {item.totalStudents} ({pct}%)
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.evaluatedCount} of {item.submittedCount}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {item.status === 'In Progress' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          In Progress
                        </span>
                      )}
                      {item.status === 'Overdue' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
