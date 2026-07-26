'use client'

import React, { useState } from 'react'
import { ArrowLeft, Camera, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VisitorEntryPage() {
  const router = useRouter()

  const [selectUser, setSelectUser] = useState('')

  // Student fields (when user = Student)
  const [studentName, setStudentName] = useState('')
  const [receiverNameDropdown, setReceiverNameDropdown] = useState('')
  const [relation] = useState('Brother')
  const [receiverMobile] = useState('9999999999')

  // Visitor fields (when user = Visitor)
  const [visitorName, setVisitorName] = useState('')
  const [visitingPurpose, setVisitingPurpose] = useState('')
  const [visitorMobile, setVisitorMobile] = useState('')

  // Common fields
  const [vehicleNo, setVehicleNo] = useState('')
  const [dateField, setDateField] = useState('')
  const [entryTime, setEntryTime] = useState('')
  const [exitTime, setExitTime] = useState('')
  const [entryGate, setEntryGate] = useState('')
  const [exitGate, setExitGate] = useState('')
  const [reason, setReason] = useState('')
  const [remarks, setRemarks] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectUser) { alert('Please select a user type.'); return }
    setToastMsg('Gate pass created successfully!')
    setToastOpen(true)
    setTimeout(() => { setToastOpen(false); router.push('/institute/gate-pass') }, 1500)
  }

  const title = selectUser === 'Student' ? 'Permanent Visitor Entry' : selectUser === 'Visitor' ? 'Create Gate Pass' : 'Create Gate Pass'

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/institute/gate-pass" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">Issue a gate pass for visitor or student pickup</p>
          </div>
        </div>
        <button onClick={() => router.push('/institute/gate-pass')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Create For */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Create For</legend>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-slate-500 font-bold">Select User <span className="text-red-500">*</span></label>
            <select value={selectUser} onChange={e => setSelectUser(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
              <option value="">Select an Option</option>
              <option value="Student">Student</option>
              <option value="Visitor">Visitor</option>
            </select>
          </div>
        </fieldset>

        {/* ===== STUDENT MODE ===== */}
        {selectUser === 'Student' && (
          <>
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Student Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Student Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Search student by name, ID" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class</label>
                  <div className="px-4 py-2.5 bg-slate-100 rounded-lg font-bold text-slate-500">Class VII</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Roll No.</label>
                  <div className="px-4 py-2.5 bg-slate-100 rounded-lg font-bold text-slate-500">045</div>
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Receiver Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Receiver Name <span className="text-red-500">*</span></label>
                  <select value={receiverNameDropdown} onChange={e => setReceiverNameDropdown(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                    <option value="">Select an Option</option>
                    <option value="Kamlesh">Kamlesh</option>
                    <option value="Arun">Arun</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Relation with Receiver</label>
                  <div className="px-4 py-2.5 bg-teal-50 text-teal-700 rounded-lg font-bold">{relation}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Receiver Mobile No.</label>
                  <div className="px-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold">{receiverMobile}</div>
                </div>
              </div>

              {/* Two photo areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-44 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Camera className="w-8 h-8 text-teal-500" />
                  <p className="text-[10px] text-slate-400 font-bold">Uploaded image show from database</p>
                </div>
                <div className="h-44 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Camera className="w-8 h-8 text-teal-500" />
                  <p className="text-[10px] text-slate-400 font-bold">Ensure face is clearly visible for live check (Optional)</p>
                </div>
              </div>

              <p className="text-center text-emerald-600 font-bold text-[10px]">* Verification successful, uploaded and live Person are identical.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Vehicle No. (If any)</label>
                  <input type="text" placeholder="Enter Vehicle No." value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={dateField} onChange={e => setDateField(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Time <span className="text-red-500">*</span></label>
                  <input type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Entry Gate No.</label>
                  <input type="text" placeholder="Enter Gate No." value={entryGate} onChange={e => setEntryGate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Exit Gate No.</label>
                  <input type="text" placeholder="Enter Gate No." value={exitGate} onChange={e => setExitGate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Reason</label>
                  <input type="text" placeholder="Enter Why do you want the Gatepass?" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Remarks</label>
                <textarea placeholder="Enter Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-20 resize-none" />
              </div>
            </fieldset>
          </>
        )}

        {/* ===== VISITOR MODE ===== */}
        {selectUser === 'Visitor' && (
          <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
            <legend className="px-3 text-sm font-black text-[#1b3a60]">Visitor Details</legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Visitor Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter Visitor Name" value={visitorName} onChange={e => setVisitorName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Visiting Purpose <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter Visit Purpose" value={visitingPurpose} onChange={e => setVisitingPurpose(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Visitor Mobile No.</label>
                    <input type="text" placeholder="Enter Mobile No." value={visitorMobile} onChange={e => setVisitorMobile(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Vehicle No. (If any)</label>
                    <input type="text" placeholder="Enter Vehicle No." value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Entry Gate No.</label>
                    <input type="text" placeholder="Enter Gate No." value={entryGate} onChange={e => setEntryGate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Exit Gate No.</label>
                    <input type="text" placeholder="Enter Gate No." value={exitGate} onChange={e => setExitGate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                  </div>
                </div>
              </div>

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-full h-44 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-teal-500" />
                </div>
                <button type="button" className="px-6 py-2 border border-teal-500 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-colors text-xs">Capture Photo</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Date <span className="text-red-500">*</span></label>
                <input type="date" value={dateField} onChange={e => setDateField(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Entry Time <span className="text-red-500">*</span></label>
                <input type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Exit Time</label>
                <input type="time" value={exitTime} onChange={e => setExitTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Remarks</label>
              <textarea placeholder="Enter Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-20 resize-none" />
            </div>
          </fieldset>
        )}

        {/* Footer */}
        {selectUser && (
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/institute/gate-pass" className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center">Cancel</Link>
            <button type="submit" className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">{selectUser === 'Student' ? 'Submit' : 'Save'}</button>
          </div>
        )}

      </form>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}
