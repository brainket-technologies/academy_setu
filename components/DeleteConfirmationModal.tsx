'use client'

import React from 'react'
import { Trash2, Loader2, X } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  loading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop Close */}
      <div className="absolute inset-0 cursor-default" onClick={loading ? undefined : onClose} />

      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-sm relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200 z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Banner */}
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-4 shrink-0">
          <Trash2 className="w-6 h-6 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed px-1">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-600/10"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
