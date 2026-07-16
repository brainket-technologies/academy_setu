'use client'

import React, { useState } from 'react'
import { Check, X, Camera, Paperclip, Plus, FileEdit, Printer, Upload } from 'lucide-react'
import Link from 'next/link'

const STEPS = ['Personal Details', 'Qualification Details', 'Address Details', 'Payroll & Leave', 'Payment Details']

export default function AddEmployeePage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Employee</h1>
        <Link href="/institute/employees" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200">
          <X className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Stepper Header (hidden on final preview) */}
        {currentStep < 5 && (
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
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Joining Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Role <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Select Role</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Staff ID <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Staff ID" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Joining Date <span className="text-red-500">*</span></label>
                <input type="date" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Designation <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Designation" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

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
                  <label className="text-xs font-bold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Father/Husband Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Your Father Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Marital Status <span className="text-red-500">*</span></label>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Select Your Marital Status</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-2xl bg-teal-50/50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center text-teal-600 mb-4 hover:bg-teal-50 cursor-pointer">
                  <Camera className="w-8 h-8 mb-2" />
                </div>
                <button className="w-40 py-2 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50">Upload Photo</button>
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Religion & Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Nationality</label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option>Select Nationality</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Religion <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option>Select Religion</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Category <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option>Select Category</option></select>
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
                <input type="password" placeholder="Enter Password" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" placeholder="Confirm Password" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/institute/employees" className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold hover:bg-teal-50">Cancel</Link>
              <button onClick={() => setCurrentStep(1)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Qualification Details */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Qualification Details</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Qualification</th>
                    <th className="px-4 py-3">Pass. Year</th>
                    <th className="px-4 py-3">Obt. Marks</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">College Name</th>
                    <th className="px-4 py-3">Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input type="text" className="w-full pl-3 pr-8 py-1.5 rounded border border-slate-200 text-sm bg-white" />
                        <Paperclip className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mb-10"><button className="w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center"><Plus className="w-4 h-4"/></button></div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Additional Qualification</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-600">
                  <tr>
                    <th className="px-4 py-3 w-1/3">Course / Certificate</th>
                    <th className="px-4 py-3 w-1/4">Pass. Year</th>
                    <th className="px-4 py-3">Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input type="text" className="w-full pl-3 pr-8 py-1.5 rounded border border-slate-200 text-sm bg-white" />
                        <Paperclip className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mb-10"><button className="w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center"><Plus className="w-4 h-4"/></button></div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Experience</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-600">
                  <tr>
                    <th className="px-4 py-3 w-1/3">School/Organization Name</th>
                    <th className="px-4 py-3 w-1/4">Designation</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="text" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="date" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                    <td className="px-4 py-3"><input type="date" className="w-full px-3 py-1.5 rounded border border-slate-200 text-sm" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mb-10"><button className="w-8 h-8 rounded bg-teal-600 text-white flex items-center justify-center"><Plus className="w-4 h-4"/></button></div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setCurrentStep(0)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold">Back</button>
              <button onClick={() => setCurrentStep(2)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Address Details */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Address Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Address" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"><option>Select State</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">District <span className="text-red-500">*</span></label>
                <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"><option>Select District</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Pincode</label>
                <input type="text" placeholder="Enter Pincode" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Aadhar & Signature</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Aadhar No. <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Aadhar No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Attach Aadhar</label>
                <div className="relative">
                  <input type="text" placeholder="Upload Aadhar Photo" className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
                  <Paperclip className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Attach Signature</label>
                <div className="relative">
                  <input type="text" placeholder="Upload Signature Photo" className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
                  <Paperclip className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setCurrentStep(1)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold">Back</button>
              <button onClick={() => setCurrentStep(3)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Payroll & Leave */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Payroll</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Basic Salary <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Basic Salary" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">HRA</label>
                <input type="text" placeholder="Enter HRA" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Conveyance</label>
                <input type="text" placeholder="Enter Conveyance" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Special Allowance</label>
                <input type="text" placeholder="Enter Special Allowance" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Gross Monthly Salary</label>
                <input type="text" placeholder="Total Amount" readOnly className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 font-semibold" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Paid Leave <span className="text-xs text-slate-400 normal-case">(Optional)</span></h2>
            <div className="flex flex-col gap-1.5 mb-6 max-w-sm">
              <label className="text-xs font-bold text-slate-700">Leave Option</label>
              <select className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"><option>Select an Option</option></select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Casual Leave</label>
                <input type="text" placeholder="Enter No. of Leave" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Apply From</label>
                <input type="date" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Medical Leave</label>
                <input type="text" placeholder="Enter No. of Leave" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Apply From</label>
                <input type="date" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Half Day Leave</label>
                <input type="text" placeholder="Enter No. of Leave" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Apply From</label>
                <input type="date" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setCurrentStep(2)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold">Back</button>
              <button onClick={() => setCurrentStep(4)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold">Save & Next</button>
            </div>
          </div>
        )}

        {/* Step 5: Payment Details */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-10">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Account Holder Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Account Holder Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Bank Account No. <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Bank Account No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">IFSC Code <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter IFSC Code" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Bank Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter Bank Name" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">PAN No. <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter PAN No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Online Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">UPI ID</label>
                <input type="text" placeholder="Enter UPI ID" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">QR Code</label>
                <input type="text" placeholder="Upload QR Code" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
            </div>

            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Other Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Universal Account No.</label>
                <input type="text" placeholder="Enter Universal Account No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">PF Account No.</label>
                <input type="text" placeholder="Enter PF Account No." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setCurrentStep(3)} className="px-8 py-2.5 rounded-lg border border-teal-600 text-teal-600 text-sm font-bold">Back</button>
              <button onClick={() => setCurrentStep(5)} className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold shadow-sm">Final Preview</button>
            </div>
          </div>
        )}

        {/* Step 6: Final Preview */}
        {currentStep === 5 && (
          <div className="p-6 sm:p-10 bg-slate-50">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setCurrentStep(4)} className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-teal-600 hover:bg-white"><ChevronLeft className="w-4 h-4" /></button>
              <h2 className="text-lg font-black text-slate-800">Final Preview</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Basic Info</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-base font-black text-slate-800">Employee Name</h4>
                    <p className="text-xs font-bold text-slate-500">Designation</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">Male</p>
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-bold">
                      <div><span className="text-slate-400">Mobile No.</span><p className="text-slate-700">9999999999</p></div>
                      <div><span className="text-slate-400">Email ID</span><p className="text-slate-700">abc@gmail.com</p></div>
                      <div><span className="text-slate-400">Date of Birth</span><p className="text-slate-700">14-01-2018</p></div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-right">
                    <p className="text-slate-400">Employee ID <span className="text-slate-700">42</span></p>
                    <p className="text-slate-400">Joining Date <span className="text-slate-700">01/01/2026</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Login & Account Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">User Name</span>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">aloktiwari2012328</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Password</span>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 flex justify-between">
                      2012328AlokTiwari@ 
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Aadhar Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Aadhar Card No.</span><span className="text-xs font-semibold text-slate-800">12345678900</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Aadhar Card</span><span className="text-xs font-bold text-teal-600">Aadhar Card.jpg</span></div>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Address Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Address</span><span className="text-xs font-semibold text-slate-800">123, Location, Street Name, Locality</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Pincode</span><span className="text-xs font-semibold text-slate-800">221545</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">District</span><span className="text-xs font-semibold text-slate-800">Lucknow</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">State</span><span className="text-xs font-semibold text-slate-800">Uttar Pradesh</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Leave Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Casual Leave</span><span className="text-xs font-semibold text-slate-800">12</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Medical Leave</span><span className="text-xs font-semibold text-slate-800">12</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Half Day Leave</span><span className="text-xs font-semibold text-slate-800">6</span></div>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Religion & Category</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Nationality</span><span className="text-xs font-semibold text-slate-800">Indian</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Religion</span><span className="text-xs font-semibold text-slate-800">Hindu</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Category</span><span className="text-xs font-semibold text-slate-800">General</span></div>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Marital Status</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Status</span><span className="text-xs font-semibold text-slate-800">Married</span></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800">Qualification Details</h3>
                <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-600 uppercase">
                    <tr><th className="px-4 py-2">Qualification</th><th className="px-4 py-2">Pass. Year</th><th className="px-4 py-2">Obt. Marks</th><th className="px-4 py-2">Percentage</th><th className="px-4 py-2">College Name</th><th className="px-4 py-2">Document</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="px-4 py-2">Graduation</td><td className="px-4 py-2">2002</td><td className="px-4 py-2">273</td><td className="px-4 py-2">52%</td><td className="px-4 py-2">abcd College</td><td className="px-4 py-2 text-teal-600">Certificate.jpg</td></tr>
                    <tr><td className="px-4 py-2">Intermediate</td><td className="px-4 py-2">2000</td><td className="px-4 py-2">273</td><td className="px-4 py-2">52%</td><td className="px-4 py-2">abcd College</td><td className="px-4 py-2 text-teal-600">Certificate.jpg</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Payroll Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Basic Salary</span><span className="text-xs font-semibold text-slate-800">12,500</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">HRA</span><span className="text-xs font-semibold text-slate-800">2,000</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Conveyance</span><span className="text-xs font-semibold text-slate-800">1,500</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Special Allowance</span><span className="text-xs font-semibold text-slate-800">4,000</span></div>
                  <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-xs font-bold text-slate-800">Gross Monthly Salary</span><span className="text-xs font-black text-slate-800">20,000</span></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-800">Bank Details</h3>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Account Holder Name</span><span className="text-xs font-semibold text-slate-800">Alok Tiwari</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Account No.</span><span className="text-xs font-semibold text-slate-800">1203214568</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">IFSC Code</span><span className="text-xs font-semibold text-slate-800">BANK123456</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Bank Name</span><span className="text-xs font-semibold text-slate-800">abcd Bank</span></div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">PAN No.</span><span className="text-xs font-semibold text-slate-800">PAN12345678</span></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-800">Online Payment Details</h3>
                    <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                  </div>
                  <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">UPI ID</span><span className="text-xs font-semibold text-slate-800">abcd@okindian</span></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-800">Other Details</h3>
                    <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50"><FileEdit className="w-3 h-3"/> Edit</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Universal Account No.</span><span className="text-xs font-semibold text-slate-800">123456789</span></div>
                    <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">PF Account No.</span><span className="text-xs font-semibold text-slate-800">123456789</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 border-t border-slate-200 pt-6">
              <button onClick={() => setCurrentStep(4)} className="w-32 py-2.5 rounded-lg border border-teal-600 text-teal-600 font-bold text-sm bg-white">Back</button>
              <button className="w-32 py-2.5 rounded-lg border border-teal-600 text-teal-600 font-bold text-sm bg-white">Print</button>
              <Link href="/institute/employees" className="w-32 py-2.5 rounded-lg bg-teal-600 text-white font-bold text-sm flex items-center justify-center">Final Submit</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}
