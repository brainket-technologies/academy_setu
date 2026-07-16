'use client'

import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import Link from 'next/link'
import { CertificateDesign1, CertificateDesign2, CertificateDesign3, CertificateDesign4 } from '@/components/certificates/CertificateTemplates'

export default function AddCertificateTypePage() {
  const [selectedDesign, setSelectedDesign] = useState<number>(1)

  const hiddenFields = [
    'Title', 'School Name', 'Tagline', 'School Address',
    'Affiliated To', 'Affiliated Code', 'School Code', 'UDISE Code',
    'Website', 'School Logo', 'Phone No.', 'Water Mark',
    'Sr. No.', 'Registration No.', 'Admission No.', 'School Address 2', // Renamed to avoid exact duplicate as shown in screenshot
    'Session', 'Student Photo', 'Enrollment No.', 'PEN No.',
    'Certificate Date', 'Principal Sign'
  ]

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Certificate Type</h1>
        <Link href="/institute/certificate/type" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        
        {/* Top Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Certificate Prefix</label>
            <input type="text" defaultValue="CER/123" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-teal-500 transition-all text-slate-600 font-medium" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Certificate No. Start from</label>
            <input type="text" defaultValue="101" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-teal-500 transition-all text-slate-600 font-medium" />
          </div>
        </div>

        {/* Student Details */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Student Details</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Class <span className="text-red-500">*</span></label>
              <select className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600">
                <option>Select an Option</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Student Name <span className="text-red-500">*</span></label>
              <div className="min-h-[42px] px-2 py-1.5 rounded-lg border border-slate-200 bg-white flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold border border-teal-100">
                  <span>34 Rahul</span>
                  <X className="w-3 h-3 cursor-pointer" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold border border-teal-100">
                  <span>14 Rahul</span>
                  <X className="w-3 h-3 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certificate Title & Design */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Certificate Title & Design <span className="text-red-500">*</span></h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          
          <div className="flex flex-col gap-2 mb-8">
            <label className="text-xs font-bold text-slate-700">Certificate Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter Title" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-6 mb-8">
            {[1, 2, 3, 4].map(id => (
              <div key={id} className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => setSelectedDesign(id)}
                  className={`w-32 h-24 rounded-lg border-2 p-1 cursor-pointer transition-all flex flex-col items-center justify-center bg-white ${
                    selectedDesign === id ? 'border-teal-500 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Fake Certificate Thumbnails */}
                  <div className="w-full h-full border border-amber-200 bg-amber-50 relative flex flex-col items-center justify-center text-[6px] font-bold text-amber-800 overflow-hidden">
                    <div className="absolute inset-1 border border-amber-200"></div>
                    <div className="mb-1">CERTIFICATE</div>
                    <div className="w-1/2 h-px bg-amber-300 mb-1"></div>
                    <div className="text-[4px] text-amber-600">Student Name</div>
                  </div>
                </div>
                <div className="flex items-center justify-center w-5 h-5 rounded-sm border border-slate-300">
                  {selectedDesign === id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <div className="text-[10px] font-bold text-slate-600 -mt-1">Certificate Design {id}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Fields Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Title Background Color</label>
                <div className="relative flex items-center">
                  <input type="text" placeholder="Enter Title" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                  <div className="absolute right-2 w-6 h-6 rounded bg-pink-700 cursor-pointer"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Text Color</label>
                <div className="relative flex items-center">
                  <input type="text" placeholder="Choose Background Color" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                  <div className="absolute right-2 w-6 h-6 rounded bg-slate-900 cursor-pointer"></div>
                </div>
              </div>

              {[
                { label: 'Font Size (in pixels like 20)', val: '10' },
                { label: 'Header School Name Font Size', val: '8' },
                { label: 'Header School Tagline Font Size', val: '6' },
                { label: 'Header School Details Font Size', val: '6' },
              ].map((field, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">{field.label}</label>
                  <input type="text" defaultValue={field.val} className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                </div>
              ))}
            </div>

            {/* Preview Panel */}
            <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-full bg-slate-100 rounded-xl border border-slate-200 shadow-md p-4 flex items-center justify-center overflow-hidden min-h-[350px]">
                <div style={{ transform: 'scale(0.5)', transformOrigin: 'center' }} className="flex items-center justify-center">
                  {selectedDesign === 1 && <CertificateDesign1 />}
                  {selectedDesign === 2 && <CertificateDesign2 />}
                  {selectedDesign === 3 && <CertificateDesign3 />}
                  {selectedDesign === 4 && <CertificateDesign4 />}
                </div>
              </div>
              <p className="font-bold text-slate-700 text-sm">Certificate Preview</p>
            </div>
          </div>
        </section>

        {/* Certificate Content */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Certificate Content</h2>
            <div className="h-px bg-slate-200 w-full"></div>
            <select className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[10px] outline-none shrink-0 font-bold text-slate-600">
              <option>Student Gender</option>
            </select>
          </div>
          
          <div className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white">
            {/* Fake Editor Toolbar */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 border-b border-slate-200 flex-wrap">
              <select className="text-[10px] py-1 px-2 border border-slate-200 rounded bg-white"><option>Paragraph 1</option></select>
              <select className="text-[10px] py-1 px-2 border border-slate-200 rounded bg-white"><option>12 px</option></select>
              <div className="h-4 w-px bg-slate-300"></div>
              <div className="flex gap-1 text-slate-600">
                <button className="w-6 h-6 flex items-center justify-center font-serif font-bold text-xs hover:bg-slate-200 rounded">B</button>
                <button className="w-6 h-6 flex items-center justify-center font-serif italic text-xs hover:bg-slate-200 rounded">I</button>
                <button className="w-6 h-6 flex items-center justify-center font-serif underline text-xs hover:bg-slate-200 rounded">U</button>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              {/* Alignment icons (mocked with text for simplicity) */}
              <div className="flex gap-1 text-slate-400 text-xs tracking-tighter font-mono font-bold leading-none">
                <button className="w-6 h-6 hover:bg-slate-200 rounded flex items-center justify-center">≡</button>
                <button className="w-6 h-6 hover:bg-slate-200 rounded flex items-center justify-center">≡</button>
                <button className="w-6 h-6 hover:bg-slate-200 rounded flex items-center justify-center">≡</button>
                <button className="w-6 h-6 hover:bg-slate-200 rounded flex items-center justify-center">≡</button>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <div className="flex gap-1">
                <div className="text-[10px] font-bold">Aa</div>
                <div className="w-3 h-3 bg-black rounded-sm border border-slate-300 mt-0.5"></div>
              </div>
            </div>
            {/* Editor Area */}
            <textarea 
              rows={4}
              className="w-full p-4 text-xs text-slate-600 outline-none resize-none leading-loose"
              defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            ></textarea>
          </div>
        </section>

        {/* Hidden Fields */}
        <section>
          <div className="flex items-center gap-4 mb-6 relative">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Select the fields to be hidden</h2>
            <div className="h-px bg-slate-200 w-full"></div>
            <div className="absolute right-0 top-0 flex items-center gap-2 border border-slate-200 px-2 py-1 rounded bg-white shrink-0">
               <div className="w-3 h-3 border border-slate-300 rounded-sm bg-white"></div>
               <span className="text-[9px] font-bold text-slate-600">Select All</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-5 gap-x-4">
            {hiddenFields.map((field, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded-sm border border-slate-300 group-hover:border-teal-500 transition-colors flex items-center justify-center bg-white shrink-0"></div>
                <span className="text-xs text-slate-700 font-medium">{field}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-6 mt-4">
          <Link href="/institute/certificate/type" className="px-8 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
            Cancel
          </Link>
          <button className="px-10 py-2.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-sm">
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
