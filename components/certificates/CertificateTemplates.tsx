import React from 'react'
import { QrCode } from 'lucide-react'

// Common Gold Seal
const GoldSeal = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-20 h-20 bg-amber-400 rounded-full"></div>
    {/* Sunburst edges */}
    {[0, 30, 60, 90, 120, 150].map((deg) => (
      <div key={deg} className="absolute w-22 h-22 bg-amber-500 rounded-sm" style={{ transform: `rotate(${deg}deg)`, width: '92px', height: '92px', zIndex: -1 }}></div>
    ))}
    <div className="absolute w-16 h-16 bg-amber-300 rounded-full z-10 border border-amber-500/30 shadow-inner"></div>
    <div className="absolute bottom-[-16px] left-[15px] w-6 h-12 bg-[#2a437a] -rotate-[30deg] -z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
    <div className="absolute bottom-[-16px] right-[15px] w-6 h-12 bg-[#2a437a] rotate-[30deg] -z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
  </div>
)

// Design 1: Blue/Gold Corners (Screenshot 1)
export const CertificateDesign1 = () => {
  return (
    <div className="w-[800px] h-[600px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-200">
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-64 h-64 -translate-x-32 -translate-y-32 rotate-45 flex flex-col z-10 shadow-lg">
        <div className="w-full h-8 bg-amber-400"></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-20 bg-[#2a437a]"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-32 translate-y-32 rotate-45 flex flex-col z-10 shadow-lg">
        <div className="w-full h-20 bg-[#2a437a]"></div>
        <div className="w-full h-2 bg-white"></div>
        <div className="w-full h-8 bg-amber-400"></div>
      </div>

      {/* Thin Border */}
      <div className="absolute inset-4 border border-blue-100/50 z-0 rounded"></div>

      {/* QR Code */}
      <div className="absolute top-12 right-12 z-20">
        <QrCode className="w-16 h-16 text-slate-800" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-24 px-20 flex-1 text-center">
        <h1 className="font-serif font-black text-6xl tracking-wider mb-2">CERTIFICATE</h1>
        <h2 className="text-[#3a589b] tracking-[0.3em] font-medium text-xl mb-12 uppercase">Of Achievement</h2>
        
        <p className="text-sm tracking-widest text-slate-700 font-medium uppercase mb-8">Proudly Presented To</p>
        
        <h3 className="text-[#2a437a] font-bold text-5xl mb-12">Student Name</h3>
        
        <div className="w-[70%] h-px bg-[#d1d9e6] mb-8"></div>
        
        <p className="text-slate-800 text-xl font-medium px-12">
          Description, example: for completing course
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end px-24 pb-16 h-48">
        <div className="flex flex-col items-center w-48">
          <p className="font-bold text-lg mb-2">August 26, 2022</p>
          <div className="w-full h-px bg-slate-300 mb-2"></div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Date</p>
        </div>
        
        <div className="absolute left-1/2 bottom-12 -translate-x-1/2">
          <GoldSeal />
        </div>
        
        <div className="flex flex-col items-center w-48">
          <p className="font-bold text-lg mb-2">Awarder</p>
          <div className="w-full h-px bg-slate-300 mb-2"></div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Signature</p>
        </div>
      </div>
    </div>
  )
}

// Design 2: Classic Ornate (Screenshot 2)
export const CertificateDesign2 = () => {
  return (
    <div className="w-[800px] h-[600px] bg-[#faf9f5] relative overflow-hidden flex flex-col font-serif shrink-0 border-[12px] border-white shadow-inner">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 10px)' }}></div>
      
      {/* Ornate Gold Border */}
      <div className="absolute inset-4 border-[3px] border-[#b08d55] flex z-10">
        {/* Corners */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white flex items-center justify-center text-[#b08d55] text-4xl">⚜</div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white flex items-center justify-center text-[#b08d55] text-4xl">⚜</div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white flex items-center justify-center text-[#b08d55] text-4xl">⚜</div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white flex items-center justify-center text-[#b08d55] text-4xl">⚜</div>
      </div>

      <div className="relative z-20 flex flex-col items-center pt-16 px-24 flex-1 text-center">
        <h1 className="font-black text-6xl tracking-wider mb-2">CERTIFICATE</h1>
        <div className="flex items-center gap-4 text-slate-600 mb-6">
          <div className="w-12 h-px bg-[#b08d55]"></div>
          <h2 className="tracking-[0.2em] font-medium text-lg uppercase">Of Achievement</h2>
          <div className="w-12 h-px bg-[#b08d55]"></div>
        </div>
        
        <div className="flex gap-2 text-[#b08d55] mb-12 text-xs">
          <span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        
        <p className="text-xs tracking-widest text-slate-500 font-bold uppercase mb-4">This Is Proudly Presented To</p>
        
        <h3 className="text-[#966b2e] text-6xl mb-4" style={{ fontFamily: 'cursive' }}>Name surname</h3>
        
        <div className="w-full max-w-md mx-auto flex items-center gap-2 mb-8 text-[#b08d55]">
          <span className="text-xl">♦</span>
          <div className="flex-1 h-px bg-[#b08d55]"></div>
          <span className="text-xl">♦</span>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl px-12 text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
        </p>
      </div>

      <div className="relative z-20 flex justify-between items-end px-24 pb-12 h-40">
        <div className="flex flex-col items-center w-40">
          <p className="text-sm text-slate-700 mb-2">10 Oct 2024</p>
          <div className="w-full h-px bg-[#b08d55]"></div>
        </div>
        
        <div className="absolute left-1/2 bottom-12 -translate-x-1/2 w-32 h-32 rounded-full border border-dashed border-[#b08d55] flex items-center justify-center text-[#b08d55] flex-col relative">
           <div className="text-xs mb-1">★★★</div>
           <div className="font-bold text-center leading-tight">BEST<br/>AWARD</div>
           <div className="text-xs mt-1">★★★</div>
           
           {/* Wreath leaves mock */}
           <svg className="absolute inset-0 w-full h-full -rotate-45" viewBox="0 0 100 100">
              <path d="M 20 80 Q 5 50 20 20 Q 50 5 80 20" fill="none" stroke="#b08d55" strokeWidth="1" strokeDasharray="5,5"/>
           </svg>
        </div>
        
        <div className="flex flex-col items-center w-40">
          <p className="text-xl mb-1" style={{ fontFamily: 'cursive' }}>Signature</p>
          <div className="w-full h-px bg-[#b08d55]"></div>
        </div>
      </div>
    </div>
  )
}

// Design 3: Minimal Grey Wavy (Screenshot 3)
export const CertificateDesign3 = () => {
  return (
    <div className="w-[800px] h-[600px] bg-[#f5f6f7] relative overflow-hidden flex flex-col font-sans shrink-0 border-[16px] border-white">
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 opacity-[0.2]" style={{ 
        backgroundImage: 'radial-gradient(circle at 100% 50%, transparent 20%, #fff 21%, #fff 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, #fff 21%, #fff 34%, transparent 35%, transparent)',
        backgroundSize: '40px 40px' 
      }}></div>
      
      {/* Gold Rectangle Border */}
      <div className="absolute inset-4 border-4 border-[#c5a666] z-10 rounded-sm"></div>

      {/* Top White Circle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full z-20 shadow-sm border border-slate-100"></div>

      <div className="relative z-20 flex flex-col items-center pt-32 px-24 flex-1 text-center">
        <h1 className="font-serif font-black text-[#4a4a4a] text-[40px] tracking-widest mb-4">CERTIFICATE OF DESIGN</h1>
        
        <p className="text-sm text-slate-500 mb-6">This certificate is proudly presented to</p>
        
        <h3 className="text-[#c5a666] text-6xl mb-6 font-medium" style={{ fontFamily: 'cursive' }}>Student Name</h3>
        
        <div className="w-3/4 mx-auto h-px bg-[#c5a666] mb-8 relative">
           <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-[#c5a666]"></div>
        </div>
        
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl px-12">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
        </p>
      </div>

      <div className="relative z-20 flex flex-col items-center pb-8 mt-auto h-40 justify-end">
        <div className="flex flex-col items-center w-40 mb-8">
          <div className="w-32 h-px bg-[#c5a666] mb-2"></div>
          <p className="text-xs text-slate-400">Signature</p>
        </div>
        
        <QrCode className="w-12 h-12 text-slate-800" />
      </div>
    </div>
  )
}

// Design 4: Clean Blue/Gold Border (Screenshot 4)
export const CertificateDesign4 = () => {
  return (
    <div className="w-[800px] h-[600px] bg-white relative overflow-hidden flex flex-col font-sans shrink-0 border border-slate-200">
      
      {/* Inner Borders */}
      <div className="absolute inset-6 border border-[#2a437a]/30 z-10"></div>
      <div className="absolute inset-8 border border-[#2a437a]/10 z-10"></div>

      {/* QR Code */}
      <div className="absolute top-12 right-12 z-20">
        <QrCode className="w-14 h-14 text-slate-800" />
      </div>

      <div className="relative z-20 flex flex-col items-center pt-28 px-24 flex-1 text-center">
        <h1 className="font-serif font-black text-6xl tracking-wider mb-2">CERTIFICATE</h1>
        <h2 className="text-[#3a589b] tracking-[0.3em] font-medium text-xl mb-12 uppercase">Of Achievement</h2>
        
        <p className="text-sm tracking-widest text-slate-700 font-bold uppercase mb-8">Proudly Presented To</p>
        
        <h3 className="text-[#2a437a] font-bold text-5xl mb-12">Student Name</h3>
        
        <div className="w-[80%] h-px bg-[#d1d9e6] mb-8"></div>
        
        <p className="text-slate-800 text-lg font-medium px-12">
          Description, example: for completing course
        </p>
      </div>

      <div className="relative z-20 flex justify-between items-end px-32 pb-20 h-48">
        <div className="flex flex-col items-center w-40">
          <p className="font-bold text-sm mb-2">August 26, 2022</p>
          <div className="w-full h-px bg-slate-300 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Date</p>
        </div>
        
        <div className="absolute left-1/2 bottom-12 -translate-x-1/2">
          <GoldSeal />
        </div>
        
        <div className="flex flex-col items-center w-40">
          <p className="font-bold text-sm mb-2">Awarder</p>
          <div className="w-full h-px bg-slate-300 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Signature</p>
        </div>
      </div>
    </div>
  )
}
