'use client'

import React, { useState } from 'react'
import { Check, X, Camera, Paperclip, Plus, FileEdit, Printer, Upload, EyeOff } from 'lucide-react'
import Link from 'next/link'

const STEPS = ['Personal Details', 'Qualification Details', 'Employment Details', 'Address Details']

export default function AddParentPage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        {currentStep === 4 ? (
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentStep(3)} className="w-8 h-8 flex items-center justify-center rounded border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors">
              <span className="text-xl leading-none">&lsaquo;</span>
            </button>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Final Preview</h1>
          </div>
        ) : (
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Parents</h1>
        )}
        <Link href="/institute/parents" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200">
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Stepper Header (hidden on final preview) */}
        {currentStep < 4 && (
          <div className="p-6 pb-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center border border-teal-600 rounded-xl overflow-hidden mb-8 shadow-sm">
              {STEPS.map((step, idx) => (
                <div 
                  key={step} 
                  className={`flex-1 py-3 px-2 text-center text-xs font-bold border-r border-teal-600 last:border-0 transition-colors ${
                    idx === currentStep ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            <div className="flex justify-between relative max-w-4xl mx-auto px-10">
              <div className="absolute left-[50px] right-[50px] top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
              {STEPS.map((step, idx) => {
                const isPast = idx < currentStep
                const isCurrent = idx === currentStep
                return (
                  <div key={idx} className={`w-4 h-4 rounded-full border-2 z-10 bg-white ${
                    isPast ? 'border-teal-600 flex items-center justify-center' : 
                    isCurrent ? 'border-teal-600 bg-teal-600 relative after:content-[""] after:absolute after:w-1.5 after:h-1.5 after:bg-white after:rounded-full' : 
                    'border-slate-300'
                  }`}>
                    {isPast && <Check className="w-2.5 h-2.5 text-teal-600 absolute" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 1: Personal Details */}
        {currentStep === 0 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Basic Info</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Your First Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input type="text" placeholder="Enter Your Last Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Mobile No. <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Mobile No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Id</label>
                  <input type="email" placeholder="Enter Your Email Id" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Gender <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4 py-2.5">
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="gender" /> Male</label>
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="gender" /> Female</label>
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="gender" /> Others</label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Parents Type <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4 py-2.5">
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="parentType" /> Mother</label>
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="parentType" /> Father</label>
                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="parentType" /> Guardian</label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-2xl bg-teal-50/50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center text-teal-600 mb-4 hover:bg-teal-50 cursor-pointer">
                  <Camera className="w-8 h-8 mb-2" />
                </div>
                <button className="w-40 py-2 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50">Upload Photo</button>
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Login/Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">User Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter User Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="password" placeholder="Enter Password" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="password" placeholder="Confirm Password" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <EyeOff className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Cancel</button>
              <button onClick={() => setCurrentStep(1)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Qualification Details */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Qualification Details <span className="text-slate-400 lowercase font-medium tracking-normal">(Last Qualification)</span></h2>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-10">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">Qualification</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">College Name</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-center">Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0">
                    <td className="p-4">
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </td>
                    <td className="p-4">
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <input type="text" className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        <Paperclip className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentStep(0)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Cancel</button>
              <button onClick={() => setCurrentStep(2)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Employment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Employment Type <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Select an option</option>
                  <option>Government Job</option>
                  <option>Private Job</option>
                  <option>Business</option>
                  <option>Farmer</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Company/Business Name</label>
                <input type="text" placeholder="Enter Company/Business Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Company Address</label>
                <input type="text" placeholder="Enter Company Address" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Designation</label>
                <input type="text" placeholder="Enter Designation" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Annual Income</label>
                <input type="text" placeholder="Enter Annual Income" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentStep(1)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Cancel</button>
              <button onClick={() => setCurrentStep(3)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Address Details */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Address Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea rows={2} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option>Select State</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">District <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option>Select District</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Pincode</label>
                <input type="text" placeholder="Enter Pincode" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Aadhar & Signature</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Aadhar No. <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Aadhar No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Attach Aadhar</label>
                <div className="relative">
                  <input type="text" placeholder="Upload Aadhar Photo" className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <Paperclip className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setCurrentStep(2)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors">Cancel</button>
              <button onClick={() => setCurrentStep(4)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Save & Next</button>
            </div>
          </div>
        )}

        {/* Final Preview */}
        {currentStep === 4 && (
          <div className="p-6 bg-slate-50/50">
            <div className="flex justify-end mb-4">
              <button className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 shadow-sm"><Printer className="w-4 h-4"/></button>
            </div>

            <div className="space-y-6">
              
              {/* Basic Info & Login Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                    <h3 className="text-sm font-black text-slate-800">Basic Info</h3>
                    <button onClick={() => setCurrentStep(0)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir" className="w-32 h-32 rounded-xl border border-slate-200 object-cover bg-slate-50" />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center border-2 border-white"><Camera className="w-4 h-4"/></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-800 mb-1">Parent Name</h4>
                      <p className="text-xs font-semibold text-slate-500 mb-6">Male</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-800">Mobile No.</span>
                          <span className="text-xs text-slate-600">9999999999</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-800">Email ID</span>
                          <span className="text-xs text-slate-600">abc@gmail.com</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-800">Date of Birth</span>
                          <span className="text-xs text-slate-600">14-01-2018</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                    <h3 className="text-sm font-black text-slate-800">Login & Account Details</h3>
                    <button onClick={() => setCurrentStep(0)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-800">User Name</label>
                      <input type="text" value="aloktiwari2012326" readOnly className="px-4 py-2 rounded border border-slate-200 text-sm bg-slate-50 text-slate-700 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-800">Password</label>
                      <div className="relative">
                        <input type="password" value="2012326AlokTiwari@" readOnly className="w-full px-4 py-2 rounded border border-slate-200 text-sm bg-slate-50 text-slate-700 outline-none" />
                        <EyeOff className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aadhar, Address, Employment Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Aadhar Details</h3>
                    <button onClick={() => setCurrentStep(3)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Aadhar Card No.</span>
                      <span className="text-xs text-slate-600">12345678900</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Aadhar Card</span>
                      <span className="text-xs text-blue-500 font-semibold flex items-center gap-1"><EyeOff className="w-3 h-3"/> Aadhar Card.jpg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Address Details</h3>
                    <button onClick={() => setCurrentStep(3)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Address</span>
                      <span className="text-xs text-slate-600 text-right">123, Location, Street Name</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Pincode</span>
                      <span className="text-xs text-slate-600">221545</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">District</span>
                      <span className="text-xs text-slate-600">Lucknow</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">State</span>
                      <span className="text-xs text-slate-600">Uttar Pradesh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-black text-slate-800">Employment Details</h3>
                    <button onClick={() => setCurrentStep(2)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Company/Business</span>
                      <span className="text-xs text-slate-600 text-right">abcd company</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Address</span>
                      <span className="text-xs text-slate-600 text-right">123, Address, Location</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Designation</span>
                      <span className="text-xs text-slate-600">Manager</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Contact No.</span>
                      <span className="text-xs text-slate-600">9999999999</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Annual Income</span>
                      <span className="text-xs text-slate-600">8,00,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualification Row */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                  <h3 className="text-sm font-black text-slate-800">Qualification Details</h3>
                  <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                    <FileEdit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-center">
                    <thead className="bg-slate-50 text-xs font-black text-slate-600">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Qualification</th>
                        <th className="px-4 py-3 border-b border-slate-200">College Name</th>
                        <th className="px-4 py-3 border-b border-slate-200">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border-r border-slate-200">
                           <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">Graduation</div>
                        </td>
                        <td className="p-4 border-r border-slate-200">
                           <div className="px-4 py-2 rounded border border-slate-300 text-sm text-slate-600 inline-block w-64">abcd college</div>
                        </td>
                        <td className="p-4">
                           <div className="text-blue-500 font-semibold flex items-center justify-center gap-1 text-xs"><EyeOff className="w-3.5 h-3.5"/> Certificate.jpg</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => setCurrentStep(3)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors bg-white">Back</button>
              <button className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50 transition-colors bg-white">Print</button>
              <button className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">Final Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
