'use client'

import React, { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'

export default function DataSettingsPage() {
  // Education Medium State
  const [mediums, setMediums] = useState<string[]>(['English', 'Hindi'])
  const [newMedium, setNewMedium] = useState('')
  const [selectedMediums, setSelectedMediums] = useState<string[]>(['English'])

  // Reservation Category State
  const [categories, setCategories] = useState<string[]>(['General', 'OBC', 'SC', 'ST'])
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['General', 'OBC', 'SC'])

  // Religion State
  const [religions, setReligions] = useState<string[]>(['Hindu', 'Muslim', 'Sikh', 'Christian'])
  const [newReligion, setNewReligion] = useState('')
  const [selectedReligions, setSelectedReligions] = useState<string[]>(['Hindu', 'Muslim', 'Sikh'])

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Add handlers
  const handleAddMedium = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMedium.trim()) return
    if (mediums.includes(newMedium.trim())) {
      alert('Medium already exists.')
      return
    }
    setMediums([...mediums, newMedium.trim()])
    setNewMedium('')
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    if (categories.includes(newCategory.trim())) {
      alert('Category already exists.')
      return
    }
    setCategories([...categories, newCategory.trim()])
    setNewCategory('')
  }

  const handleAddReligion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReligion.trim()) return
    if (religions.includes(newReligion.trim())) {
      alert('Religion already exists.')
      return
    }
    setReligions([...religions, newReligion.trim()])
    setNewReligion('')
  }

  // Toggle checks
  const toggleSelection = (item: string, selectedList: string[], setSelectedList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item))
    } else {
      setSelectedList([...selectedList, item])
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Data Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-slate-700">
        
        {/* Section 1: Education Medium */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-800 border-b pb-2">Education Medium</h2>
          <form onSubmit={handleAddMedium} className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Medium</label>
              <input
                type="text"
                placeholder="Enter Education Medium"
                value={newMedium}
                onChange={e => setNewMedium(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center self-end shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List of checkboxes */}
          <div className="space-y-2.5 pt-2 flex-1">
            {mediums.map(med => (
              <label key={med} className="flex items-center gap-2 cursor-pointer text-slate-655 font-bold">
                <input
                  type="checkbox"
                  checked={selectedMediums.includes(med)}
                  onChange={() => toggleSelection(med, selectedMediums, setSelectedMediums)}
                  className="accent-teal-600 w-3.5 h-3.5"
                />
                <span>{med}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showToast('Education Mediums saved successfully!')}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-center shadow transition-colors text-[10px]"
          >
            Save
          </button>
        </div>

        {/* Section 2: Reservation Category */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-800 border-b pb-2">Reservation Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Reservation Category</label>
              <input
                type="text"
                placeholder="Enter Category"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center self-end shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List of checkboxes */}
          <div className="space-y-2.5 pt-2 flex-1">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer text-slate-655 font-bold">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                  className="accent-teal-600 w-3.5 h-3.5"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showToast('Reservation Categories saved successfully!')}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-center shadow transition-colors text-[10px]"
          >
            Save
          </button>
        </div>

        {/* Section 3: Religions */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-800 border-b pb-2">Religions</h2>
          <form onSubmit={handleAddReligion} className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Religion</label>
              <input
                type="text"
                placeholder="Enter Religion"
                value={newReligion}
                onChange={e => setNewReligion(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center self-end shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List of checkboxes */}
          <div className="space-y-2.5 pt-2 flex-1">
            {religions.map(rel => (
              <label key={rel} className="flex items-center gap-2 cursor-pointer text-slate-655 font-bold">
                <input
                  type="checkbox"
                  checked={selectedReligions.includes(rel)}
                  onChange={() => toggleSelection(rel, selectedReligions, setSelectedReligions)}
                  className="accent-teal-600 w-3.5 h-3.5"
                />
                <span>{rel}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showToast('Religions saved successfully!')}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-center shadow transition-colors text-[10px]"
          >
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
