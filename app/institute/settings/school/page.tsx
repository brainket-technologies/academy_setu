'use client'

import React, { useState } from 'react'
import { CheckCircle2, Upload } from 'lucide-react'

export default function SchoolSettingsPage() {
  // Basic Details
  const [fullName, setFullName] = useState('Academy Setu School')
  const [tagline, setTagline] = useState('Connecting Minds')
  const [headerTagline, setHeaderTagline] = useState('Connecting Minds')
  const [smsName, setSmsName] = useState('ACDSETU')
  const [instCode, setInstCode] = useState('SCH-1023')
  const [session, setSession] = useState('2025-26')
  const [affiliatedTo, setAffiliatedTo] = useState('CBSE Board')
  const [affiliatedText, setAffiliatedText] = useState('Affiliated to CBSE, New Delhi')
  const [affiliationCode, setAffiliationCode] = useState('CBSE-998877')
  const [udiseCode, setUdiseCode] = useState('UD-11223344')

  // Contact Details
  const [contactName, setContactName] = useState('Shubham Singh')
  const [mobile, setMobile] = useState('9876543210')
  const [whatsapp, setWhatsapp] = useState('9876543210')
  const [phone, setPhone] = useState('011-22334455')
  const [email, setEmail] = useState('contact@academysetu.com')
  const [website, setWebsite] = useState('https://academysetu.com')
  const [pincode, setPincode] = useState('110001')
  const [city, setCity] = useState('New Delhi')
  const [state, setState] = useState('Delhi')
  const [address, setAddress] = useState('12, Institutional Area, Phase II, Vasant Kunj')

  // Logo & Sig Files
  const [schoolLogo, setSchoolLogo] = useState('logo.png')
  const [watermark, setWatermark] = useState('watermark.png')
  const [signature, setSignature] = useState('principal_signature.png')

  // Language & Currency
  const [country, setCountry] = useState('India')
  const [currency, setCurrency] = useState('INR')
  const [language, setLanguage] = useState('English')

  // Others
  const [regCert, setRegCert] = useState('registration_cert.pdf')
  const [affCert, setAffCert] = useState('affiliation_cert.pdf')
  const [panCard, setPanCard] = useState('pan_card.jpg')
  const [aboutSchool, setAboutSchool] = useState('A premier educational institution fostering excellence.')
  const [admissionNote, setAdmissionNote] = useState('Please ensure all details entered are matching your birth certificate records.')

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const triggerSave = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const Toolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg text-[10px] font-bold text-slate-500">
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none cursor-pointer">
        <option>Paragraph</option>
      </select>
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none ml-1 cursor-pointer">
        <option>12 px</option>
      </select>
      {['B', 'I', 'U', '≡', '⊟', '🔗', '■'].map((btn, i) => (
        <button key={i} type="button" className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">School</h1>
      </div>

      {/* Card 1: Basic Details */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700 space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Tagline (Below name)</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Header Tagline (Top) <span className="text-slate-400 font-normal">(Last updated for header tagline)</span></label>
            <input type="text" value={headerTagline} onChange={e => setHeaderTagline(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Short Name for SMS <span className="text-slate-400 font-normal">(Max 6 chars)</span></label>
            <input type="text" value={smsName} onChange={e => setSmsName(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">School/Institute Code</label>
            <input type="text" value={instCode} onChange={e => setInstCode(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Current Session <span className="text-red-500">*</span></label>
            <select value={session} onChange={e => setSession(e.target.value)} className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Affiliated To</label>
            <input type="text" value={affiliatedTo} onChange={e => setAffiliatedTo(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Affiliated to text for Display</label>
            <input type="text" value={affiliatedText} onChange={e => setAffiliatedText(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Affiliation Code</label>
            <input type="text" value={affiliationCode} onChange={e => setAffiliationCode(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">UDISE Code</label>
            <input type="text" value={udiseCode} onChange={e => setUdiseCode(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => triggerSave('Basic Details saved successfully!')} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
            Save
          </button>
        </div>
      </div>

      {/* Card 2: Contact Details */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700 space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Contact person name (School)</label>
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Mobile Number (School) <span className="text-red-500">*</span></label>
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Whatsapp number (school)</label>
            <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Phone Number (School)</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Email ID (school) <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Website (if any)</label>
            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Pincode <span className="text-red-500">*</span></label>
            <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">City <span className="text-red-500">*</span></label>
            <select value={city} onChange={e => setCity(e.target.value)} className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">State <span className="text-red-500">*</span></label>
            <select value={state} onChange={e => setState(e.target.value)} className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold">Address <span className="text-red-500">*</span></label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none h-20 font-bold resize-none" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => triggerSave('Contact Details saved successfully!')} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
            Save
          </button>
        </div>
      </div>

      {/* Card 3: Logo, signature & more images */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700 space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Logo, signature & more images</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">School Logo</label>
            <div className="border border-dashed p-4 rounded-xl text-center bg-slate-50 flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-6 h-6 text-slate-400" />
              <span>Click to Upload or Drag & Drop</span>
              <span className="text-[9px] text-slate-400 font-normal">Max: 180 x 180 px</span>
              {schoolLogo && <span className="text-[10px] text-teal-600 font-bold">{schoolLogo}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Watermark Logo</label>
            <div className="border border-dashed p-4 rounded-xl text-center bg-slate-50 flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-6 h-6 text-slate-400" />
              <span>Click to Upload or Drag & Drop</span>
              <span className="text-[9px] text-slate-400 font-normal">Max: 250 x 250 px</span>
              {watermark && <span className="text-[10px] text-teal-600 font-bold">{watermark}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Authority (Principal) Signature <span className="text-red-500">*</span></label>
            <div className="border border-dashed p-4 rounded-xl text-center bg-slate-50 flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-6 h-6 text-slate-400" />
              <span>Click to Upload or Drag & Drop</span>
              <span className="text-[9px] text-slate-400 font-normal">Max: 150 x 50 px</span>
              {signature && <span className="text-[10px] text-teal-600 font-bold">{signature}</span>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => triggerSave('Images & Logos saved successfully!')} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
            Save
          </button>
        </div>
      </div>

      {/* Card 4: Language & Currency */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700 space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Language & Currency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Country</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="px-3 py-2.5 border rounded-lg outline-none font-bold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => triggerSave('Language and Currency saved successfully!')} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
            Save
          </button>
        </div>
      </div>

      {/* Card 5: Others */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm text-xs font-semibold text-slate-700 space-y-4">
        <h2 className="text-xs font-black text-[#1b3a60] border-b pb-2">Others</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Institute Registration Certificate</label>
            <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
              <input type="text" readOnly value={regCert} className="flex-1 px-3 py-2 bg-transparent text-slate-500 font-bold" />
              <button type="button" className="p-2.5 bg-slate-100 border-l"><Upload className="w-4 h-4 text-slate-500" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Institute Affiliation Certificate</label>
            <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
              <input type="text" readOnly value={affCert} className="flex-1 px-3 py-2 bg-transparent text-slate-500 font-bold" />
              <button type="button" className="p-2.5 bg-slate-100 border-l"><Upload className="w-4 h-4 text-slate-500" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">School PAN Card</label>
            <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
              <input type="text" readOnly value={panCard} className="flex-1 px-3 py-2 bg-transparent text-slate-500 font-bold" />
              <button type="button" className="p-2.5 bg-slate-100 border-l"><Upload className="w-4 h-4 text-slate-500" /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold">About School/Institute</label>
          <input type="text" value={aboutSchool} onChange={e => setAboutSchool(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg outline-none font-bold" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold">Write a note or instruction to show below the student admission form.</label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <Toolbar />
            <textarea value={admissionNote} onChange={e => setAdmissionNote(e.target.value)} className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none leading-relaxed text-slate-600" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={() => triggerSave('Other settings saved successfully!')} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md">
            Save
          </button>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
