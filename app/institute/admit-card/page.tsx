'use client'

import React, { Suspense } from 'react'
import UnifiedExamAdmitHub from '@/components/exam-management/UnifiedExamAdmitHub'
import { RefreshCw } from 'lucide-react'

export default function AdmitCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <span className="text-xs font-semibold">Loading Unified Exam & Admit Card Management Hub...</span>
        </div>
      }
    >
      <UnifiedExamAdmitHub defaultTab="admit-card" />
    </Suspense>
  )
}
