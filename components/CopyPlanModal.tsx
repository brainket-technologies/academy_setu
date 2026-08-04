'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Loader2, X } from 'lucide-react'

interface CopyPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
  originalPlanName: string
  loading?: boolean
}

export function CopyPlanModal({
  isOpen,
  onClose,
  onConfirm,
  originalPlanName,
  loading = false
}: CopyPlanModalProps) {
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNewName(`Copy of ${originalPlanName}`)
    }
  }, [isOpen, originalPlanName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onConfirm(newName.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop Close */}
      <div className="absolute inset-0 cursor-default" onClick={loading ? undefined : onClose} />

      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-md relative flex flex-col animate-in zoom-in-95 duration-200 z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Banner */}
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center mb-4 shrink-0 mx-auto">
          <Copy className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2 text-center">
          Copy Plan
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed px-1 text-center">
          Make a duplicate of <strong className="text-slate-700 dark:text-slate-300">{originalPlanName}</strong> with a new name.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              New Plan Name
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new plan name"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Copy Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
