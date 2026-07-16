'use client'

import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import Link from 'next/link'
import { IdCardDesignPink, IdCardDesignBlue, IdCardDesignPurple } from '@/components/id-cards/IdCardTemplates'

export default function GenerateIdCardPage() {
  const [selectedDesign, setSelectedDesign] = useState<number>(2)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Generate ID Cards</h1>
        <Link href="/institute/id-card/setup" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm flex flex-col gap-10">
        
        {/* Id card Details */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Id card Details</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">ID Card For <span className="text-red-500">*</span></label>
              <select className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-600">
                <option>Select an Option</option>
                <option>Student</option>
                <option>Teacher</option>
                <option>Employee</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Title <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Title" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Tagline</label>
              <input type="text" placeholder="Enter Tagline" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Session <span className="text-red-500">*</span></label>
              <select className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-600">
                <option>Select an Option</option>
                <option>2024-25</option>
                <option>2025-26</option>
              </select>
            </div>
          </div>
        </section>

        {/* School Information */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">School Information</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">School Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter School Name" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">School Address <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Address" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">UDISE Code</label>
              <input type="text" placeholder="Enter UDISE Code" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">School code</label>
              <input type="text" placeholder="Enter School Code" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Affiliated To</label>
              <input type="text" placeholder="Enter Affiliated To" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Affiliation code</label>
              <input type="text" placeholder="Enter Affiliation Code" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">School Contact No. <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Mobile No." className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">School Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="Enter Email" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400" />
            </div>
          </div>
        </section>

        {/* Id Card Design */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Id Card Design</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4].map(id => (
              <div key={id} className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => setSelectedDesign(id)}
                  className={`w-32 h-40 rounded-lg border-2 p-2 cursor-pointer transition-all flex flex-col items-center justify-center ${
                    selectedDesign === id ? 'border-teal-500 bg-teal-50 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-full bg-white rounded border border-slate-100 flex flex-col overflow-hidden relative shadow-sm">
                    {/* Simplified Thumbnail representations */}
                    {id === 1 && (
                      <div className="flex flex-col items-center w-full h-full p-2 text-[6px]">
                        <div className="w-full h-8 bg-blue-500 mb-2 relative">
                           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                        </div>
                        <div className="mt-4 font-bold">ID Card Design 1</div>
                      </div>
                    )}
                    {id === 2 && (
                      <div className="flex flex-col items-center w-full h-full p-2 text-[6px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500 rounded-bl-full opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-500 rounded-tr-full opacity-20"></div>
                        <div className="w-12 h-12 rounded-full border-2 border-pink-500 bg-white mt-4 relative z-10 flex items-center justify-center text-pink-500">
                          User
                        </div>
                        <div className="mt-auto font-bold text-pink-600 pb-2 relative z-10">ID Card Design 2</div>
                      </div>
                    )}
                    {id === 3 && (
                      <div className="flex flex-col w-full h-full p-2 text-[6px] relative">
                         <div className="w-full h-full border border-red-800 bg-amber-50 flex p-1">
                            <div className="w-1/3 h-full border border-red-800 flex flex-col items-center justify-center bg-white"><div className="w-6 h-8 bg-slate-200"></div></div>
                            <div className="w-2/3 h-full pl-1"><div className="w-full h-3 bg-red-800 mb-1"></div><div className="font-bold text-red-800 mt-2">ID Card Design 3</div></div>
                         </div>
                      </div>
                    )}
                    {id === 4 && (
                      <div className="flex flex-col w-full h-full p-2 text-[6px] relative">
                         <div className="w-full h-full bg-purple-600 text-white rounded p-1 flex shadow-inner">
                            <div className="w-1/3 h-full"><div className="w-6 h-8 bg-slate-200 border border-white"></div></div>
                            <div className="w-2/3 h-full pl-1 pt-1"><div className="font-bold">ID Card Design 4</div></div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-5 h-5 rounded-sm border border-slate-300">
                  {selectedDesign === id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Optional Details */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Optional Details</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-6">
            {['Hide watermark?', 'Hide School Stamp?', 'Hide principal signature?', 'Show Top Header Tagline', 'Print QR for Attendance', 'Show Blood Group'].map((label, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded-sm border border-slate-300 group-hover:border-teal-500 transition-colors flex items-center justify-center bg-white"></div>
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Bottom Notes <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
            <textarea 
              rows={4}
              placeholder="This card belongs to the school/institute. If found, please hand it over to the school/institute authorities."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-slate-400 resize-none"
            ></textarea>
          </div>
        </section>

        {/* Set Font Size */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-black text-slate-800 whitespace-nowrap">Set Font Size</h2>
            <div className="h-px bg-slate-200 w-full"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Fields Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'School Name', val: '10' },
                { label: 'School Details', val: '8' },
                { label: 'Student Name', val: '8' },
                { label: 'Student Details', val: '6' },
                { label: 'Logo Width', val: '15' },
                { label: 'Student Pic Width', val: '12' },
                { label: 'Signature Width', val: '20' },
                { label: 'Principal Sign', val: '20' },
              ].map((field, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">{field.label}</label>
                  <input type="text" defaultValue={field.val} className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                </div>
              ))}
              
              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-slate-700">Background Color</label>
                <div className="relative flex items-center">
                  <input type="text" placeholder="Enter Title" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                  <div className="absolute right-2 w-6 h-6 rounded border border-slate-200 bg-white cursor-pointer"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">Header Text Color</label>
                <div className="relative flex items-center">
                  <input type="text" placeholder="Choose a Color" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
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
            </div>

            {/* Preview Panel */}
            <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-full max-w-[320px] bg-slate-100 rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden min-h-[350px]">
                <div style={{ transform: selectedDesign === 4 ? 'scale(0.6)' : 'scale(0.7)', transformOrigin: 'center' }} className="flex items-center justify-center">
                  {selectedDesign === 1 && <IdCardDesignBlue />}
                  {selectedDesign === 2 && <IdCardDesignPink />}
                  {selectedDesign === 3 && <div className="text-slate-500 font-bold">Template 3 not detailed</div>}
                  {selectedDesign === 4 && <IdCardDesignPurple />}
                </div>
              </div>
              <p className="font-bold text-slate-700 text-sm">ID Card Preview</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200">
          <Link href="/institute/id-card/setup" className="px-8 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
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
