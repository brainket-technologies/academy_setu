'use client'

import React, { useRef } from 'react'
import { X, Printer, Sparkles, QrCode } from 'lucide-react'
import { AdmitCardConfig, getStoredTimetables } from '@/lib/admit-card-sync'

interface AdmitCardModalPreviewProps {
  card: AdmitCardConfig | null
  onClose: () => void
}

export const AdmitCardModalPreview: React.FC<AdmitCardModalPreviewProps> = ({ card, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null)

  if (!card) return null

  // Lookup timetable subjects
  const timetables = getStoredTimetables()
  const table = timetables.find(t => t.id === Number(card.timeTableId))
  const subjects = table && table.subjects && table.subjects.length > 0
    ? table.subjects
    : [
        { subjectName: 'English Core', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Mathematics', date: '2025-03-23', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'General Science', date: '2025-03-25', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Social Science', date: '2025-03-27', fromTime: '10:00', toTime: '13:00' },
        { subjectName: 'Hindi / Regional', date: '2025-03-29', fromTime: '10:00', toTime: '13:00' }
      ]

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const fields = card.displayFields || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-admit-card-container, #printable-admit-card-container * {
            visibility: visible !important;
          }
          #printable-admit-card-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[880px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto">
        
        {/* Modal Top Control Bar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Live Admit Card • Examination Hall Ticket
              </h3>
              <p className="text-[10px] text-slate-400">
                Exam: <span className="font-bold text-slate-700 dark:text-slate-300">{card.examName}</span> • Class: <span className="font-bold text-teal-600">{card.className}</span> ({card.session})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Admit Card
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Paper Scroll Container */}
        <div className="overflow-auto bg-slate-200/60 dark:bg-slate-950 p-4 sm:p-6 flex-1 flex justify-center items-start">
          
          <div
            id="printable-admit-card-container"
            ref={printRef}
            className="w-full max-w-[780px] bg-white text-slate-900 border-2 border-slate-300 p-6 sm:p-8 flex flex-col font-sans shrink-0 relative shadow-xl rounded-xl select-none"
          >
            {/* School Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-teal-600 flex flex-col items-center justify-center font-black text-xs shrink-0 bg-teal-50 text-teal-700 shadow-xs">
                  <span className="text-[9px] uppercase tracking-tighter">ESTD</span>
                  <span className="text-sm">2010</span>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
                    {card.schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                  </h1>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 leading-tight">
                    {card.schoolAddress || 'Knowledge Park, Sector 62, New Delhi - 110092'}
                  </p>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[9.5px] font-bold text-slate-700 mt-2">
                    <div>Aff. To : Central Board of Secondary Education</div>
                    <div>School Code : 123456</div>
                    <div>Aff. No. : 2130842</div>
                    <div>UDISE Code : 09100201923</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <QrCode className="w-12 h-12 text-slate-800 bg-white p-0.5 border border-slate-200 rounded" />
                <span className="text-[7.5px] text-slate-400 font-bold font-mono">CODE: 123456</span>
              </div>
            </div>

            {/* Sub-Header details: Contact */}
            <div className="flex justify-center gap-8 text-[9.5px] font-bold text-slate-600 border-b border-slate-200 pb-2 mb-4">
              <span>Email : contact@cosmopolitan.edu</span>
              <span>•</span>
              <span>Helpline : +91 11 2345 6789 / 9999999999</span>
            </div>

            {/* Admit Card Title */}
            <div className="text-center my-2">
              <div className="inline-block bg-slate-900 text-white px-6 py-1.5 rounded-md">
                <h2 className="text-base sm:text-lg font-black tracking-widest uppercase">
                  {card.admitCardLabel || 'ADMIT CARD • HALL TICKET'}
                </h2>
              </div>
            </div>

            {/* Term & Session info */}
            <div className="flex justify-between items-center text-xs font-black uppercase text-slate-800 mb-4 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded">
              <span>EXAM : {card.examName}</span>
              <span>ACADEMIC SESSION : {card.session}</span>
            </div>

            {/* Student Details Grid */}
            <div className="flex gap-5 items-start mb-5">
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-slate-800">
                {fields.admissionNo !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Admission No. :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-bold text-slate-900 px-1">
                      ADM-2025-089
                    </span>
                  </div>
                )}

                {fields.rollNo !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Roll No. :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-black text-slate-900 px-1">
                      10104
                    </span>
                  </div>
                )}

                {fields.name !== false && (
                  <div className="flex col-span-2">
                    <span className="font-extrabold whitespace-nowrap">Student Name :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 text-teal-700 font-black text-sm px-1">
                      Aarav Sharma
                    </span>
                  </div>
                )}

                {fields.fatherName !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Father Name :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-bold text-slate-700 px-1">
                      Rajesh Sharma
                    </span>
                  </div>
                )}

                {fields.motherName !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Mother Name :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-bold text-slate-700 px-1">
                      Sunita Sharma
                    </span>
                  </div>
                )}

                {fields.class !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Class :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-black text-slate-900 px-1">
                      {card.className}
                    </span>
                  </div>
                )}

                {fields.section !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Section :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-black text-slate-900 px-1">
                      Section A
                    </span>
                  </div>
                )}

                {fields.dob !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Date of Birth :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-bold text-slate-700 px-1">
                      15/08/2010
                    </span>
                  </div>
                )}

                {fields.mobileNo !== false && (
                  <div className="flex">
                    <span className="font-extrabold whitespace-nowrap">Mobile No. :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 font-bold text-slate-700 px-1">
                      +91 98765 43210
                    </span>
                  </div>
                )}

                {fields.address !== false && (
                  <div className="flex col-span-2">
                    <span className="font-extrabold whitespace-nowrap">Address :</span>
                    <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 text-[11px] text-slate-600 px-1">
                      H.No. 45, Green Avenue, Knowledge Park, New Delhi - 110092
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Box */}
              {fields.photo !== false && (
                <div className="w-24 h-28 bg-slate-50 border-2 border-slate-300 rounded flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 shadow-sm relative overflow-hidden">
                  <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-300 p-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 mb-1"></div>
                    <span className="text-[9px] uppercase font-bold text-slate-500">Student Photo</span>
                  </div>
                </div>
              )}
            </div>

            {/* Exam Time Table */}
            <div className="space-y-2 mt-2">
              <h3 className="text-center font-black text-xs tracking-widest text-slate-900 uppercase bg-slate-100 py-1 rounded">
                EXAMINATION DATE SHEET & TIME TABLE
              </h3>

              <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b-2 border-slate-300 text-slate-800">
                      <th className="py-2 px-2 border-r border-slate-300 w-12">S.No.</th>
                      <th className="py-2 px-3 border-r border-slate-300 w-28">Exam Date</th>
                      <th className="py-2 px-3 border-r border-slate-300 w-32">Time Slot</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left">Subject / Paper</th>
                      <th className="py-2 px-3 w-32">Invigilator Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub: any, sidx: number) => (
                      <tr key={sidx} className="border-b border-slate-200 font-semibold text-slate-700 hover:bg-slate-50/50">
                        <td className="py-2 border-r border-slate-200 font-bold">{sidx + 1}.</td>
                        <td className="py-2 border-r border-slate-200 font-bold text-slate-900">{sub.date}</td>
                        <td className="py-2 border-r border-slate-200 text-slate-600">{sub.fromTime} - {sub.toTime || '13:00'}</td>
                        <td className="py-2 px-3 border-r border-slate-200 text-left text-slate-900 font-bold">{sub.subjectName}</td>
                        <td className="py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            {card.instructions && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[9.5px] text-slate-700 leading-relaxed">
                <span className="font-black text-slate-900 uppercase">Important Instructions for Candidate:</span>
                <p className="mt-1 whitespace-pre-line text-slate-600">{card.instructions}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-4 gap-4 text-center mt-10 pb-2 text-[9px] font-black uppercase text-slate-700">
              <div className="flex flex-col items-center">
                <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                <span>Student Sign</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                <span>Parent Sign</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                <span>Class Teacher Sign</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                <span>Principal Sign & Stamp</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Admit Card ID: #{card.id} • Status: <strong className="text-emerald-600">{card.status}</strong></span>
          <span className="text-[11px] font-semibold text-teal-600">Simultaneously synced with Exam Setup</span>
        </div>

      </div>
    </div>
  )
}
