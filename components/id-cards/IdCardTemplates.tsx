import React from 'react'
import { QrCode } from 'lucide-react'

// Pink/Red Portrait Design (Design 2 from screenshots)
export const IdCardDesignPink = () => {
  return (
    <div className="w-[280px] h-[450px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0">
      {/* Top Shape */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#d82b6c] to-[#911f50] rounded-bl-full opacity-100 z-0" style={{ transform: 'translate(20%, -30%)' }}></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#d82b6c] to-[#911f50] rounded-br-full opacity-100 z-0" style={{ transform: 'translate(-40%, -40%)' }}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-8 px-6 flex-1">
        <h2 className="text-[#911f50] font-black text-2xl tracking-wide mb-1">School Name</h2>
        <p className="text-[#911f50] text-sm font-medium mb-6">School Address</p>
        
        {/* Photo Placeholder */}
        <div className="w-32 h-32 rounded-full border-[3px] border-[#911f50] bg-white mb-6 flex items-center justify-center overflow-hidden shadow-sm">
          {/* Empty photo */}
        </div>
        
        <h3 className="text-[#d82b6c] font-black text-2xl tracking-wide mb-1">Name</h3>
        <p className="text-slate-800 text-sm font-medium mb-6">Designation</p>
        
        <div className="w-full text-sm text-slate-800 space-y-2 px-2 font-bold">
          <div className="flex"><span className="w-24">ID No.</span><span>: 123</span></div>
          <div className="flex"><span className="w-24">Department</span><span>: 30-07-1990</span></div>
          <div className="flex"><span className="w-24">Mobile No.</span><span>: 1201248510</span></div>
        </div>
      </div>
      
      {/* Bottom Shape */}
      <div className="relative h-28 w-full z-10 mt-auto">
        {/* Wavy background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d82b6c] to-[#911f50]" style={{ clipPath: 'polygon(0 40%, 30% 20%, 70% 50%, 100% 0, 100% 100%, 0% 100%)' }}></div>
        
        <div className="absolute bottom-4 left-4 p-1 bg-white rounded-sm">
          <QrCode className="w-12 h-12 text-slate-800" />
        </div>
        
        <div className="absolute bottom-4 right-4 text-white text-xs font-bold">
          Principal Signature
        </div>
      </div>
    </div>
  )
}

// Blue Portrait Design (Design 1 from screenshots)
export const IdCardDesignBlue = () => {
  return (
    <div className="w-[280px] h-[450px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0">
      
      {/* Top Section */}
      <div className="relative h-48 w-full z-0 overflow-hidden">
        {/* White background on top */}
        <div className="absolute inset-0 bg-white"></div>
        {/* Blue curves */}
        <div className="absolute bottom-0 w-full h-32 bg-[#1b80c4]" style={{ clipPath: 'ellipse(120% 100% at 50% 100%)' }}></div>
        <div className="absolute bottom-4 w-full h-32 bg-[#2d557f]" style={{ clipPath: 'ellipse(110% 100% at 50% 100%)' }}></div>
        <div className="absolute bottom-10 w-full h-32 bg-white" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
        <div className="absolute bottom-12 w-full h-32 bg-[#1b80c4]" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
        <div className="absolute bottom-16 w-full h-32 bg-[#6791b1]" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
        <div className="absolute bottom-20 w-full h-40 bg-white" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
        
        {/* Photo Placeholder */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[3px] border-[#2d557f] bg-white flex items-center justify-center z-10 shadow-sm">
          {/* Empty photo */}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-[#2d557f] flex flex-col items-center pt-2 px-6 z-10 relative text-white">
        
        <h3 className="font-black text-2xl tracking-wide mb-1">Name</h3>
        <p className="text-blue-100 text-sm font-medium mb-6">Designation</p>
        
        <div className="w-full text-sm text-white space-y-2 px-2 font-bold">
          <div className="flex"><span className="w-24 text-blue-100">ID No.</span><span>: 123</span></div>
          <div className="flex"><span className="w-24 text-blue-100">Department</span><span>: 30-07-1990</span></div>
          <div className="flex"><span className="w-24 text-blue-100">Mobile No.</span><span>: 1201248510</span></div>
        </div>
        
        <div className="mt-auto w-full pb-6 flex justify-between items-end">
          <div className="p-1 bg-white rounded-sm">
            <QrCode className="w-10 h-10 text-slate-800" />
          </div>
          
          <div className="text-white text-xs font-bold">
            Principal Signature
          </div>
        </div>
      </div>
    </div>
  )
}

// Purple Horizontal Design (Design 4 from screenshots)
export const IdCardDesignPurple = () => {
  return (
    <div className="w-[450px] h-[280px] bg-[#6c34c4] rounded-xl shadow-lg relative overflow-hidden flex flex-col font-sans border border-slate-200 shrink-0">
      
      {/* Header Lines */}
      <div className="absolute top-12 w-full h-1 bg-white z-0"></div>
      <div className="absolute top-[88px] w-full h-1 bg-white z-0"></div>
      
      {/* Circle Placeholder Top Left */}
      <div className="absolute top-6 left-6 w-20 h-20 bg-white rounded-full z-10"></div>
      
      {/* Header Text */}
      <div className="relative z-10 pl-32 pt-5 h-[88px]">
        <h2 className="text-white font-black text-2xl tracking-wide">School Name</h2>
        <p className="text-white/90 text-sm mt-2">School Address</p>
      </div>
      
      {/* Card Title */}
      <div className="text-center text-white font-bold text-sm my-2">
        Student ID Card
      </div>
      
      {/* Body */}
      <div className="flex px-6 pb-6 gap-6 h-full">
        {/* Photo Placeholder */}
        <div className="w-32 h-[140px] bg-white rounded-lg p-1 shrink-0 shadow-sm mt-1">
          <div className="w-full h-full bg-slate-200 rounded object-cover flex items-center justify-center text-slate-400 text-xs">
            Photo
          </div>
        </div>
        
        {/* Details */}
        <div className="flex-1 flex flex-col justify-center text-white text-sm font-bold space-y-1.5 mt-1">
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Roll. No</span><span>:</span><span>123456</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Name</span><span>:</span><span>Vaibhav Tomar</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Father's Name</span><span>:</span><span>Sukhveer Tomar</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Class</span><span>:</span><span>Class VIII</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Section</span><span>:</span><span>Section A</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Session</span><span>:</span><span>2025-2026</span></div>
          <div className="grid grid-cols-[110px_10px_1fr]"><span>Mobile No.</span><span>:</span><span>9999999999</span></div>
        </div>
        
        {/* QR Code */}
        <div className="flex items-end shrink-0">
          <div className="p-1 bg-white rounded-md shadow-sm">
            <QrCode className="w-20 h-20 text-slate-800" />
          </div>
        </div>
      </div>
      
    </div>
  )
}
