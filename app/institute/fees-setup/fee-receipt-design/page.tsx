'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'

export default function FeeReceiptDesignPage() {
  const [selectedDesign, setSelectedDesign] = useState<number>(1)

  // A simplified inner table for the receipt previews to keep the code clean
  const renderReceiptTable = (headerColor: string, isTheme3: boolean = false) => (
    <div className="w-full mt-4 flex flex-col text-[8px]">
      <div className="grid grid-cols-6 border border-slate-300">
        <div className={`p-1.5 font-bold ${isTheme3 ? 'bg-indigo-950 text-white border-r border-indigo-900' : 'text-slate-700 border-r border-slate-300'}`}>Fee Type</div>
        <div className={`p-1.5 font-bold text-center ${isTheme3 ? 'bg-indigo-950 text-white border-r border-indigo-900' : 'text-slate-700 border-r border-slate-300'}`}>Fee Amount</div>
        <div className={`p-1.5 font-bold text-center ${isTheme3 ? 'bg-indigo-950 text-white border-r border-indigo-900' : 'text-slate-700 border-r border-slate-300'}`}>Fine Amount</div>
        <div className={`p-1.5 font-bold text-center ${isTheme3 ? 'bg-indigo-950 text-white border-r border-indigo-900' : 'text-slate-700 border-r border-slate-300'}`}>Due Fee</div>
        <div className={`p-1.5 font-bold text-center ${isTheme3 ? 'bg-indigo-950 text-white border-r border-indigo-900' : 'text-slate-700 border-r border-slate-300'}`}>Discount</div>
        <div className={`p-1.5 font-bold text-center ${isTheme3 ? 'bg-indigo-950 text-white' : 'text-slate-700'}`}>Total Fee</div>
      </div>
      {['Registration Fee', 'Admission Fee', 'Class Fee'].map((fee, i) => (
        <div key={i} className="grid grid-cols-6 border-b border-l border-r border-slate-300 text-slate-600">
          <div className="p-1 border-r border-slate-300">{fee}</div>
          <div className="p-1 text-center border-r border-slate-300">1000/-</div>
          <div className="p-1 text-center border-r border-slate-300">100/-</div>
          <div className="p-1 text-center border-r border-slate-300">500/-</div>
          <div className="p-1 text-center border-r border-slate-300">50/-</div>
          <div className="p-1 text-center">1550/-</div>
        </div>
      ))}
      <div className="flex justify-end border-b border-l border-r border-slate-300">
        <div className={`${headerColor} text-white font-bold px-4 py-1.5 w-1/2 text-right`}>
          Sub Total &nbsp; 10200/-
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Fee Receipt Design</h1>
        <button className="px-6 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
          Save Settings
        </button>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Template 1 */}
        <div 
          onClick={() => setSelectedDesign(1)}
          className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 relative ${selectedDesign === 1 ? 'border-teal-500 shadow-lg shadow-teal-500/20 scale-[1.02]' : 'border-transparent hover:border-slate-300 hover:scale-[1.01]'}`}
        >
          {selectedDesign === 1 && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center z-10 shadow-md">
              <Check className="w-4 h-4" />
            </div>
          )}
          <div className="bg-white w-full aspect-[1/1.4] relative shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {/* Template 1 Header */}
            <div className="relative h-24 w-full flex-shrink-0">
              <div className="absolute top-0 right-0 w-3/4 h-16 bg-orange-550 flex justify-end" style={{ backgroundColor: '#f95d00', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                <div className="w-12 h-12 bg-white rounded-full mt-2 mr-6"></div>
              </div>
              <div className="absolute top-0 left-0 pt-4 pl-4">
                <h3 className="text-[#f95d00] font-black text-lg">School Name</h3>
                <p className="text-[#f95d00] text-[8px] font-bold">Address</p>
                <p className="text-[6px] text-slate-500 mt-1">Affiliated To : CBSE Board &nbsp; Affiliation No. : 123456</p>
              </div>
              <div className="absolute bottom-4 left-0 w-[80%] h-3 bg-slate-700" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}></div>
            </div>
            
            {/* Body Mockup */}
            <div className="flex-1 px-4 flex flex-col">
              <div className="grid grid-cols-3 gap-2 bg-slate-100 border border-slate-200 text-[7px] font-bold text-slate-700 p-1">
                <div>Session : 2025-26</div>
                <div className="text-center">Receipt No. : 123456</div>
                <div className="text-right">Date : 12/03/2026</div>
              </div>
              <div className="flex justify-between text-[7px] mt-4 font-bold text-slate-700">
                <div className="flex flex-col gap-1">
                  <p>Student Name : <span className="font-normal text-slate-600">Arjun Kumar</span></p>
                  <p>Roll No. : <span className="font-normal text-slate-600">042</span></p>
                </div>
                <div>Father Name : <span className="font-normal text-slate-600">Anuj Kumar</span></div>
              </div>
              {renderReceiptTable('bg-slate-700')}
            </div>

            {/* Template 1 Footer */}
            <div className="relative h-24 flex-shrink-0 mt-auto">
              <div className="absolute bottom-8 left-4 text-[6px] text-slate-500 w-1/2">
                <p className="font-bold text-slate-700 mb-1">Payment Info :</p>
                <p>Payment Mode : Online</p>
                <p>Account No. : 123456789</p>
              </div>
              <div className="absolute bottom-8 right-4 text-[7px] font-bold text-slate-700 text-center">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                Authorised Signature
              </div>
              <div className="absolute bottom-0 w-full h-6 flex">
                <div className="w-1/2 h-full bg-slate-700 flex items-center px-4">
                  <p className="text-white text-[6px]">Contact Info : 9999999999</p>
                </div>
                <div className="w-1/2 h-full bg-[#f95d00] flex flex-col justify-center items-end px-4 text-white text-[5px]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                  <p>Website : schoolname.com</p>
                  <p>Email : schoolname@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template 2 */}
        <div 
          onClick={() => setSelectedDesign(2)}
          className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 relative ${selectedDesign === 2 ? 'border-teal-500 shadow-lg shadow-teal-500/20 scale-[1.02]' : 'border-transparent hover:border-slate-300 hover:scale-[1.01]'}`}
        >
          {selectedDesign === 2 && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center z-10 shadow-md">
              <Check className="w-4 h-4" />
            </div>
          )}
          <div className="bg-white w-full aspect-[1/1.4] relative shadow-sm border border-slate-200 overflow-hidden flex flex-col border-4 border-sky-400">
            {/* Template 2 Header */}
            <div className="relative h-24 w-full flex-shrink-0 bg-sky-100" style={{ borderBottomLeftRadius: '50%', borderBottomRightRadius: '10%' }}>
              <div className="absolute top-0 left-0 w-2/3 h-full bg-slate-800" style={{ borderBottomRightRadius: '100%' }}>
                <div className="w-12 h-12 bg-white rounded-full mt-4 ml-6"></div>
              </div>
              <div className="absolute top-4 right-4 text-right">
                <h3 className="text-slate-800 font-black text-lg">School Name</h3>
                <p className="text-slate-800 text-[8px] font-bold">Address</p>
                <p className="text-[6px] text-slate-500 mt-1">Affiliated To : CBSE Board</p>
              </div>
            </div>
            
            {/* Body Mockup */}
            <div className="flex-1 px-4 pt-4 flex flex-col">
              <div className="grid grid-cols-3 gap-2 bg-slate-200/50 border border-slate-300 text-[7px] font-bold text-slate-700 p-1 rounded-sm">
                <div>Session : 2025-26</div>
                <div className="text-center">Receipt No. : 123456</div>
                <div className="text-right">Date : 12/03/2026</div>
              </div>
              <div className="flex justify-between text-[7px] mt-4 font-bold text-slate-700">
                <div className="flex flex-col gap-1">
                  <p>Student Name : <span className="font-normal text-slate-600">Arjun Kumar</span></p>
                  <p>Roll No. : <span className="font-normal text-slate-600">042</span></p>
                </div>
                <div>Father Name : <span className="font-normal text-slate-600">Anuj Kumar</span></div>
              </div>
              {renderReceiptTable('bg-sky-200 !text-slate-800')}
            </div>

            {/* Template 2 Footer */}
            <div className="relative h-24 flex-shrink-0 mt-auto">
              <div className="absolute bottom-10 left-4 text-[6px] text-slate-500 w-1/2">
                <p className="font-bold text-slate-700 mb-1">Payment Info :</p>
                <p>Payment Mode : Online</p>
              </div>
              <div className="absolute bottom-10 right-4 text-[7px] font-bold text-slate-700 text-center">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                Authorised Signature
              </div>
              <div className="absolute bottom-0 w-full h-8 bg-slate-800 flex items-center justify-between px-4 text-white">
                <p className="text-[6px]">Contact Info : 9999999999</p>
                <div className="text-[5px] text-right">
                  <p>Website : schoolname.com</p>
                  <p>Email : schoolname@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template 3 */}
        <div 
          onClick={() => setSelectedDesign(3)}
          className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 relative ${selectedDesign === 3 ? 'border-teal-500 shadow-lg shadow-teal-500/20 scale-[1.02]' : 'border-transparent hover:border-slate-300 hover:scale-[1.01]'}`}
        >
          {selectedDesign === 3 && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center z-10 shadow-md">
              <Check className="w-4 h-4" />
            </div>
          )}
          <div className="bg-white w-full aspect-[1/1.4] relative shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {/* Template 3 Header */}
            <div className="relative h-24 w-full flex-shrink-0 bg-indigo-950 flex items-center px-6">
              <div className="w-12 h-12 bg-white rounded-full"></div>
              <div className="ml-auto text-right text-white">
                <h3 className="font-black text-lg">School Name</h3>
                <p className="text-[8px] font-medium text-indigo-100">Address</p>
              </div>
            </div>
            
            {/* Body Mockup */}
            <div className="flex-1 px-4 pt-4 flex flex-col">
              <div className="grid grid-cols-3 gap-2 bg-slate-100 border border-slate-300 text-[7px] font-bold text-slate-700 p-1">
                <div>Session : 2025-26</div>
                <div className="text-center">Receipt No. : 123456</div>
                <div className="text-right">Date : 12/03/2026</div>
              </div>
              <div className="flex justify-between text-[7px] mt-4 font-bold text-slate-700">
                <div className="flex flex-col gap-1">
                  <p>Student Name : <span className="font-normal text-slate-600">Arjun Kumar</span></p>
                  <p>Roll No. : <span className="font-normal text-slate-600">042</span></p>
                </div>
                <div>Father Name : <span className="font-normal text-slate-600">Anuj Kumar</span></div>
              </div>
              {renderReceiptTable('bg-slate-200 !text-slate-800', true)}
            </div>

            {/* Template 3 Footer */}
            <div className="relative h-24 flex-shrink-0 mt-auto">
              <div className="absolute bottom-10 left-4 text-[6px] text-slate-500 w-1/2">
                <p className="font-bold text-slate-700 mb-1">Payment Info :</p>
                <p>Payment Mode : Online</p>
              </div>
              <div className="absolute bottom-10 right-4 text-[7px] font-bold text-slate-700 text-center">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                Authorised Signature
              </div>
              <div className="absolute bottom-0 w-full h-8 bg-indigo-950 flex items-center justify-between px-4 text-white">
                <p className="text-[6px]">Contact Info : 9999999999</p>
                <div className="text-[5px] text-right text-indigo-100">
                  <p>Website : schoolname.com</p>
                  <p>Email : schoolname@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
