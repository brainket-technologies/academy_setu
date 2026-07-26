'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Search, UploadCloud, CheckCircle2 } from 'lucide-react'

interface StudentAttendanceRecord {
  rollNo: string
  name: string
  avatar: string
  days: string[]
}

const INITIAL_STUDENTS: StudentAttendanceRecord[] = [
  { rollNo: '45', name: 'Suraj', avatar: '👦', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
  { rollNo: '32', name: 'Ravi', avatar: '👦', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
  { rollNo: '12', name: 'Kirti', avatar: '👧', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
]

export default function StudentAttendancePage() {
  const [session, setSession] = useState('2025-2026')
  const [className, setClassName] = useState('Class V')
  const [section, setSection] = useState('Section B')
  const [currentView, setCurrentView] = useState<'Day' | 'Month'>('Day')
  const [searchQuery, setSearchQuery] = useState('')

  const getCellColor = (char: string) => {
    switch (char) {
      case 'P': return 'text-emerald-500 font-bold'
      case 'A': return 'text-red-500 font-bold'
      case 'H': return 'text-purple-500 font-bold'
      case 'L': return 'text-amber-500 font-bold'
      case 'F': return 'text-indigo-500 font-bold'
      default: return 'text-slate-400'
    }
  }

  const filteredStudents = INITIAL_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Student Attendance</h1>
        <p className="text-xs text-slate-400">Track and review student daily class attendances</p>
      </div>

      {/* Filter bar (Screenshot 3 & 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-wrap gap-6 items-center">
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Select Session</label>
          <select value={session} onChange={e => setSession(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Class</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
            <option value="Class V">Class V</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Section</label>
          <select value={section} onChange={e => setSection(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
            <option value="Section B">Section B</option>
          </select>
        </div>

        <div className="flex-1 flex justify-end pt-4">
          <button 
            type="button" 
            onClick={() => alert('Exporting student attendance records...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date navigation header / search / view toggle controls (Screenshot 3 & 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Left Side: Date Nav */}
        <div className="flex items-center gap-3">
          <button type="button" className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-750">
            <span>{currentView === 'Day' ? '02-Apr-2026' : 'April, 2026'}</span>
            <Calendar className="w-4 h-4 text-teal-600 cursor-pointer" />
          </div>
          <button type="button" className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
        </div>

        {/* Search */}
        {currentView === 'Day' && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search by Name, Roll No..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold w-full"
            />
          </div>
        )}

        {/* Right Side: Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 select-none">
          <button 
            type="button" 
            onClick={() => setCurrentView('Month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === 'Month' ? 'bg-teal-600 text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Month
          </button>
          <button 
            type="button" 
            onClick={() => setCurrentView('Day')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === 'Day' ? 'bg-teal-600 text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Day
          </button>
        </div>

      </div>

      {/* Dynamic Main Body Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-hidden">
        
        {currentView === 'Day' ? (
          /* Student Day log table matrix (Screenshot 3) */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-center text-xs border-collapse">
              <thead className="bg-slate-50 font-black border-b text-slate-600">
                <tr className="border-b">
                  <th className="py-3 px-4 w-20 text-left">Roll No.</th>
                  <th className="px-4 text-left">Name</th>
                  {Array.from({ length: 25 }, (_, i) => (
                    <th key={i} className="px-1.5 py-3 w-7">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.rollNo} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-left font-black text-slate-500">{student.rollNo}</td>
                    <td className="px-4 text-left font-extrabold text-slate-800 flex items-center gap-2 py-3.5">
                      <span>{student.avatar}</span>
                      <span>{student.name}</span>
                    </td>
                    {student.days.map((char, idx) => (
                      <td key={idx} className={`px-1.5 py-3.5 ${getCellColor(char)}`}>{char}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Student Month calendar view sheet (Screenshot 4) */
          <div className="space-y-6">
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2.5">
              {/* Previous month placeholders */}
              <div className="bg-slate-50 border min-h-[90px] rounded-2xl p-2 text-slate-350 font-bold">30</div>
              <div className="bg-slate-50 border min-h-[90px] rounded-2xl p-2 text-slate-350 font-bold">31</div>
              
              {/* April Month Days */}
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">April 1</span>
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-center truncate">Annual Function</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">2</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                  <div className="text-sky-500">🔵 T: 40</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">3</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                  <div className="text-sky-500">🔵 T: 40</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">4</span>
                <div className="space-y-0.5">
                  <div className="text-[8px] bg-red-500 text-white px-1 rounded text-center truncate">Tea Day</div>
                  <div className="text-[8px] bg-purple-500 text-white px-1 rounded text-center truncate">PTM Meeting</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">5</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>

              {/* Day 6 to 12 */}
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">6</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">7</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">8</span>
                <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded text-center">Extra Class</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">9</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">10</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">11</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">12</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>

              {/* Day 13 to 19 */}
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">13</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">14</span>
                <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded text-center truncate">Staff Meeting</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">15</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">16</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">17</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">18</span>
                <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded text-center truncate">Activity Training</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">19</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>

              {/* Day 20 to 26 */}
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">20</span>
                <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded text-center">Extra Class</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">21</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">22</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">23</span>
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-center">Festival Holiday</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">24</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">25</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">26</span>
                <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded text-center">Half Day</span>
              </div>

              {/* Day 27 to 30 */}
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">27</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">28</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">29</span>
                <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded text-center">Extra Class</span>
              </div>
              <div className="bg-white border min-h-[90px] rounded-2xl p-2 flex flex-col justify-between">
                <span className="font-extrabold text-xs text-slate-800">30</span>
                <div className="text-[8px] leading-tight font-extrabold text-slate-500">
                  <div className="text-emerald-500">🟢 P: 20</div>
                  <div className="text-red-500">🔴 A: 10</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
