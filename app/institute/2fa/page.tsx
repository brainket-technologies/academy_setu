'use client'

import React, { useState } from 'react'
import { CheckCircle2, ShieldAlert, KeyRound, Copy, Printer, Check } from 'lucide-react'

export default function TwoFactorAuthPage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const secretKey = 'JBSWY3DPEHPK3PXP'

  const backupCodes = [
    '4819-2094', '9982-1205', '5561-8930', '1092-4820',
    '3391-7782', '2093-1185', '7741-2905', '8810-3948'
  ]

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) {
      alert('Please enter verification code.')
      return
    }

    setIsEnabled(true)
    setToastMsg('Two-Factor Authentication enabled successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
    setVerificationCode('')
  }

  const handleDisable = () => {
    setIsEnabled(false)
    setToastMsg('Two-Factor Authentication disabled successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Two-Factor Authentication</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold text-slate-700">
        
        {/* Left/Middle: Setup steps */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-55 bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 flex-shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Secure Your Account with 2FA</h2>
                <p className="text-[11px] text-slate-400 font-medium">Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-bold text-slate-700 text-xs">Two-Factor Authentication Status</span>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase ${isEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {isEnabled ? (
                  <button
                    type="button"
                    onClick={handleDisable}
                    className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 font-black"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">Follow setup below to enable</span>
                )}
              </div>
            </div>
          </div>

          {!isEnabled && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-[#1b3a60] border-b pb-2">Setup Steps</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Step 1: Scan QR */}
                <div className="space-y-3">
                  <div className="text-[10px] text-teal-600 uppercase font-black tracking-wider">Step 1: Scan QR Code</div>
                  <div className="w-36 h-36 border bg-slate-50 rounded-xl flex items-center justify-center p-2 mx-auto relative group">
                    {/* Mock QR Code Pattern */}
                    <div className="w-full h-full bg-slate-200 border rounded flex flex-col items-center justify-center text-[10px] text-slate-400">
                      QR Code
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed text-center">Scan using Google Authenticator or Microsoft Authenticator app.</p>
                </div>

                {/* Step 2: Secret Key */}
                <div className="space-y-3 md:col-span-2">
                  <div className="text-[10px] text-teal-600 uppercase font-black tracking-wider">Step 2: Enter Secret Key manually (Optional)</div>
                  <div className="border rounded-xl p-4 bg-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Secret Key</div>
                      <div className="text-sm font-black text-slate-800 tracking-widest mt-1">{secretKey}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-2 border bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-slate-600 flex items-center justify-center"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Step 3: Verify Code Form */}
                  <form onSubmit={handleVerify} className="space-y-3 pt-2">
                    <div className="text-[10px] text-teal-600 uppercase font-black tracking-wider">Step 3: Verify Code</div>
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <input
                          type="text"
                          placeholder="Enter 6-digit Verification Code"
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value)}
                          maxLength={6}
                          className="w-full px-4 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-colors"
                      >
                        Verify & Enable
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Right side: Backup codes */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-rose-600 border-b pb-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <h2 className="text-xs font-black">Backup Recovery Codes</h2>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400 font-medium">Save these emergency recovery codes in a secure location. They can be used to log in if you lose access to your authenticator device.</p>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="border bg-slate-50 text-slate-700 font-black text-center py-2 rounded-lg text-[10px] tracking-wide select-all">
                {code}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => triggerAction('Recovery codes copied to clipboard!')}
              className="w-full py-2 bg-white border border-slate-200 text-slate-655 font-bold hover:bg-slate-50 text-center rounded-xl text-[10px] transition-colors"
            >
              Copy Codes
            </button>
            <button
              type="button"
              onClick={() => triggerAction('Opening print dialog for recovery codes...')}
              className="w-full py-2 bg-teal-605 bg-teal-600 hover:bg-teal-700 text-white font-bold text-center rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Codes</span>
            </button>
          </div>
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

function triggerAction(msg: string) {
  alert(msg)
}
