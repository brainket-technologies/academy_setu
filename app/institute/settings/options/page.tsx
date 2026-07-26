'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, CheckSquare, Square } from 'lucide-react'

interface OptionGroup {
  key: string
  label: string
  items: { label: string; checked: boolean }[]
}

export default function OptionsSettingsPage() {
  const [activeHeaders, setActiveHeaders] = useState<string[]>([
    'Logo', 'Organisation Address', 'Organisation Code', 'UDISE Code', 'Affiliated To', 'Affiliation Code'
  ])

  const [expandedSection, setExpandedSection] = useState<string | null>('Logo')

  const [options, setOptions] = useState<OptionGroup[]>([
    {
      key: 'Logo',
      label: 'Logo',
      items: [
        { label: 'Logo on Receipt', checked: true },
        { label: 'Logo on Admit Card', checked: true },
        { label: 'Logo on Marksheet', checked: true },
        { label: 'Logo on Certificate', checked: true },
        { label: 'Logo on TC', checked: true },
        { label: 'Logo on ID Card', checked: true },
      ]
    },
    {
      key: 'Organisation Address',
      label: 'Organisation Address',
      items: [
        { label: 'Address on Receipt', checked: true },
        { label: 'Address on Admit Card', checked: true },
        { label: 'Address on Marksheet', checked: true },
        { label: 'Address on Certificate', checked: true },
        { label: 'Address on TC', checked: true },
        { label: 'Address on ID Card', checked: true },
      ]
    },
    {
      key: 'Organisation Code',
      label: 'Organisation Code (Like School/Institute code)',
      items: [
        { label: 'Org Code on Receipt', checked: true },
        { label: 'Org Code on Admit Card', checked: true },
        { label: 'Org Code on Marksheet', checked: true },
        { label: 'Org Code on Certificate', checked: true },
        { label: 'Org Code on TC', checked: true },
        { label: 'Org Code on ID Card', checked: true },
      ]
    },
    {
      key: 'UDISE Code',
      label: 'UDISE Code',
      items: [
        { label: 'UDISE Code on Receipt', checked: true },
        { label: 'UDISE Code on Admit Card', checked: true },
        { label: 'UDISE Code on Marksheet', checked: true },
        { label: 'UDISE Code on Certificate', checked: true },
        { label: 'UDISE Code on TC', checked: true },
        { label: 'UDISE Code on ID Card', checked: true },
      ]
    },
    {
      key: 'Affiliated To',
      label: 'Affiliated To',
      items: [
        { label: 'Affil To on Receipt', checked: true },
        { label: 'Affil To on Admit Card', checked: true },
        { label: 'Affil To on Marksheet', checked: true },
        { label: 'Affil To on Certificate', checked: true },
        { label: 'Affil To on TC', checked: true },
        { label: 'Affil To on ID Card', checked: true },
      ]
    },
    {
      key: 'Affiliation Code',
      label: 'Affiliation Code',
      items: [
        { label: 'Affil Code on Receipt', checked: true },
        { label: 'Affil Code on Admit Card', checked: true },
        { label: 'Affil Code on Marksheet', checked: true },
        { label: 'Affil Code on Certificate', checked: true },
        { label: 'Affil Code on TC', checked: true },
        { label: 'Affil Code on ID Card', checked: true },
      ]
    },
    {
      key: 'Watermark',
      label: 'Watermark',
      items: [
        { label: 'Watermark on Receipt', checked: false },
        { label: 'Watermark on Admit Card', checked: false },
        { label: 'Watermark on Marksheet', checked: true },
        { label: 'Watermark on Certificate', checked: true },
        { label: 'Watermark on TC', checked: false },
        { label: 'Watermark on ID Card', checked: false },
      ]
    },
    {
      key: 'Phone No.',
      label: 'Phone No.',
      items: [
        { label: 'Phone on Receipt', checked: true },
        { label: 'Phone on Admit Card', checked: false },
        { label: 'Phone on Marksheet', checked: false },
        { label: 'Phone on Certificate', checked: false },
        { label: 'Phone on TC', checked: false },
        { label: 'Phone on ID Card', checked: true },
      ]
    },
    {
      key: 'Email',
      label: 'Email',
      items: [
        { label: 'Email on Receipt', checked: true },
        { label: 'Email on Admit Card', checked: false },
        { label: 'Email on Marksheet', checked: false },
        { label: 'Email on Certificate', checked: false },
        { label: 'Email on TC', checked: false },
        { label: 'Email on ID Card', checked: true },
      ]
    },
    {
      key: 'Principal/HOD/Authority Signature',
      label: 'Principal/HOD/Authority Signature',
      items: [
        { label: 'Principal Sig on Receipt', checked: true },
        { label: 'Principal Sig on Admit Card', checked: true },
        { label: 'Principal Sig on Marksheet', checked: true },
        { label: 'Principal Sig on Certificate', checked: true },
        { label: 'Principal Sig on TC', checked: true },
        { label: 'Principal Sig on ID Card', checked: false },
      ]
    },
    {
      key: 'Class Teacher Signature',
      label: 'Class Teacher Signature',
      items: [
        { label: 'Class Teacher Sig on Marksheet', checked: true },
        { label: 'Class Teacher Sig on Admit Card', checked: false },
        { label: 'Class Teacher Sig on TC', checked: true },
        { label: 'Class Teacher Sig on Certificate', checked: false },
      ]
    },
    {
      key: 'Fees Receipt',
      label: 'Fees Receipt',
      items: [
        { label: 'Fee Receipt on Print', checked: true },
        { label: 'Fee Receipt on Demand', checked: true },
      ]
    },
    {
      key: 'Fees Receipt Print',
      label: 'Fees Receipt Print',
      items: [
        { label: 'Fees Receipt Print on Single Page', checked: true },
        { label: 'Fees Receipt Print on Double Page', checked: false },
        { label: 'Fees Receipt Print on Thermal Paper', checked: false },
        { label: 'Fees Receipt Print on Dot Matrix Printer', checked: false },
      ]
    },
    {
      key: 'Tagline',
      label: 'Tagline',
      items: [
        { label: 'Tagline on Receipt', checked: true },
        { label: 'Tagline on Admit Card', checked: false },
        { label: 'Tagline on Marksheet', checked: false },
        { label: 'Tagline on Certificate', checked: false },
        { label: 'Tagline on TC', checked: false },
        { label: 'Tagline on ID Card', checked: false },
      ]
    },
    {
      key: 'GST No.',
      label: 'GST No.',
      items: [
        { label: 'GST No. on Receipt', checked: false },
      ]
    },
    {
      key: 'Accountant Signature',
      label: 'Accountant Signature',
      items: [
        { label: 'Accountant Sig on Receipt', checked: true },
      ]
    }
  ])

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (key: string) => {
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const toggleHeaderFilter = (key: string) => {
    if (activeHeaders.includes(key)) {
      setActiveHeaders(activeHeaders.filter(k => k !== key))
    } else {
      setActiveHeaders([...activeHeaders, key])
    }
  }

  const toggleCheckbox = (groupKey: string, itemLabel: string) => {
    setOptions(options.map(group => {
      if (group.key === groupKey) {
        return {
          ...group,
          items: group.items.map(item => {
            if (item.label === itemLabel) {
              return { ...item, checked: !item.checked }
            }
            return item
          })
        }
      }
      return group
    }))
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Options</h1>
      </div>

      {/* Categories Horizontal Selector */}
      <div className="bg-teal-600 text-white rounded-xl p-3 flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm text-xs font-bold">
        {options.map(opt => {
          const isActive = activeHeaders.includes(opt.key)
          return (
            <label key={opt.key} className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleHeaderFilter(opt.key)}
                className="accent-white w-3.5 h-3.5"
              />
              <span>{opt.key}</span>
            </label>
          )
        })}
      </div>

      {/* Accordion Panels List */}
      <div className="space-y-4">
        {options.map(group => {
          // If filtered/checked in activeHeaders list, we display it
          if (!activeHeaders.includes(group.key)) return null

          const isExpanded = expandedSection === group.key

          return (
            <div key={group.key} className="bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedSection(isExpanded ? null : group.key)}
                className="w-full px-6 py-4 flex items-center justify-between font-black text-slate-800 hover:bg-slate-50 text-left text-xs"
              >
                <span>{group.label}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Expanded Checkboxes list */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-655">
                    {group.items.map(item => (
                      <label key={item.label} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheckbox(group.key, item.label)}
                          className="accent-teal-600 w-3.5 h-3.5"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleSave(group.key)}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-center shadow text-[10px]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Options updated successfully!</span>
        </div>
      )}
    </div>
  )
}
