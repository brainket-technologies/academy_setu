'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'

export interface DropdownOption {
  label: string
  value: string
}

interface SearchableDropdownProps {
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  options: (string | DropdownOption)[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  allowClear?: boolean
  className?: string
}

export function SearchableDropdown({
  label,
  placeholder = 'Select an Option',
  searchPlaceholder = 'Search...',
  options = [],
  value,
  onChange,
  disabled = false,
  allowClear = true,
  className = ''
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Normalize options to { label, value } and strip out duplicate empty placeholder items
  const normalizedOptions: DropdownOption[] = React.useMemo(() => {
    return options
      .map(opt => {
        if (typeof opt === 'string') {
          return { label: opt, value: opt }
        }
        return opt
      })
      .filter(opt => opt && opt.value !== '' && opt.label?.toLowerCase() !== placeholder.toLowerCase())
  }, [options, placeholder])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const showPlaceholderOption = !searchTerm || placeholder.toLowerCase().includes(searchTerm.toLowerCase().trim())

  const selectedOption = normalizedOptions.find(o => o.value === value || o.label === value)
  const displayLabel = selectedOption ? selectedOption.label : (value || '')

  const handleSelect = (optionVal: string) => {
    onChange(optionVal)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2 bg-white dark:bg-slate-700 border rounded-xl text-sm font-semibold flex items-center justify-between transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
        } ${value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
      >
        <span className="truncate pr-2">{displayLabel || placeholder}</span>
        <div className="flex items-center gap-1 shrink-0">
          {allowClear && value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-72">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 flex-1 divide-y divide-slate-50 dark:divide-slate-700/50">
            {/* Clear/All Option */}
            {showPlaceholderOption && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-3 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  !value
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span>{placeholder}</span>
                {!value && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            )}

            {filteredOptions.length === 0 && !showPlaceholderOption ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching results
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = value === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
