'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, MoreVertical, X, CheckCircle2, UserCheck, ShieldAlert, Award, FileText, Settings, Users, Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface HouseRecord {
  id: number
  name: 'Red' | 'Green' | 'Yellow' | 'Blue'
  members: number
  captain: string
  vCaptain: string
  teacher: string
  tagline?: string
  objective?: string
  colorCode?: string
}

const INITIAL_HOUSES: HouseRecord[] = [
]

export default function HouseBlocksPage() {
  const [houses, setHouses] = useState<HouseRecord[]>(INITIAL_HOUSES)
  const [activeTab, setActiveTab] = useState<'All' | 'Red' | 'Green' | 'Yellow' | 'Blue'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<HouseRecord | null>(null)

  // Create Form State
  const [houseName, setHouseName] = useState<'Red' | 'Green' | 'Yellow' | 'Blue'>('Red')
  const [customColor, setCustomColor] = useState('')
  const [tagline, setTagline] = useState('')
  const [teacher, setTeacher] = useState('')
  const [captain, setCaptain] = useState('')
  const [vCaptain, setVCaptain] = useState('')
  const [objective, setObjective] = useState('')

  // Assign members state
  const [assignMemberCount, setAssignMemberCount] = useState(5)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_houses')
    if (saved) {
      try {
        setHouses(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_houses', JSON.stringify(INITIAL_HOUSES))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this house record?')) {
      const updated = houses.filter(h => h.id !== id)
      setHouses(updated)
      localStorage.setItem('school_houses', JSON.stringify(updated))
      setActiveMenuId(null)
      showToast('House record deleted successfully!')
    }
  }

  const handleCreateHouse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacher || !captain) {
      alert('Please enter Teacher and Captain names.')
      return
    }

    const newHouse: HouseRecord = {
      id: Date.now(),
      name: houseName,
      members: 0,
      captain,
      vCaptain: vCaptain || captain,
      teacher,
      tagline,
      objective,
      colorCode: customColor
    }

    const updated = [newHouse, ...houses]
    setHouses(updated)
    localStorage.setItem('school_houses', JSON.stringify(updated))

    // Reset Form
    setHouseName('Red')
    setCustomColor('')
    setTagline('')
    setTeacher('')
    setCaptain('')
    setVCaptain('')
    setObjective('')
    setCreateModalOpen(false)
    showToast('House/Block created successfully!')
  }

  const handleAssignMembers = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHouse) return

    const updated = houses.map(h => {
      if (h.id === selectedHouse.id) {
        return { ...h, members: h.members + assignMemberCount }
      }
      return h
    })
    setHouses(updated)
    localStorage.setItem('school_houses', JSON.stringify(updated))
    setAssignModalOpen(false)
    showToast(`Assigned ${assignMemberCount} members to ${selectedHouse.name} House!`)
  }

  const handleOpenAssign = (house: HouseRecord) => {
    setSelectedHouse(house)
    setActiveMenuId(null)
    setAssignModalOpen(true)
  }

  const handleOpenViewDetails = (house: HouseRecord) => {
    setSelectedHouse(house)
    setActiveMenuId(null)
    setDetailsModalOpen(true)
  }

  // Counts
  const totalHousesCount = new Set(houses.map(h => h.name)).size
  const redCount = houses.filter(h => h.name === 'Red').length
  const greenCount = houses.filter(h => h.name === 'Green').length
  const yellowCount = houses.filter(h => h.name === 'Yellow').length
  const blueCount = houses.filter(h => h.name === 'Blue').length

  const filtered = houses.filter(h => {
    if (activeTab !== 'All' && h.name !== activeTab) return false
    if (searchQuery && !h.captain.toLowerCase().includes(searchQuery.toLowerCase()) && !h.teacher.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-slate-800">House/Block</h1>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black">
            Total House/Block <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">{totalHousesCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 border rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* House Selector Tabs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { key: 'All', label: 'All', count: houses.length },
          { key: 'Red', label: 'Red', count: redCount, color: 'bg-red-600 text-white hover:bg-red-700 border-red-200' },
          { key: 'Green', label: 'Green', count: greenCount, color: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-250' },
          { key: 'Yellow', label: 'Yellow', count: yellowCount, color: 'bg-amber-500 text-white hover:bg-amber-600 border-amber-200' },
          { key: 'Blue', label: 'Blue', count: blueCount, color: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-200' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm border text-center ${activeTab === tab.key ? (tab.key === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : `${tab.color} font-black`) : 'bg-white text-slate-650 hover:bg-slate-50'}`}
          >
            {tab.label} - {tab.count}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4">House Name</th>
                <th className="px-3 py-4">Member</th>
                <th className="px-3 py-4">House Captain</th>
                <th className="px-3 py-4">House V. Captain</th>
                <th className="px-3 py-4">House Teacher</th>
                <th className="px-3 py-4 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold relative">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${item.name === 'Red' ? 'bg-red-650' : item.name === 'Green' ? 'bg-emerald-650' : item.name === 'Yellow' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                      {item.name}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-bold text-slate-800">{item.members}</td>
                  <td className="px-3 py-3.5 text-slate-650">{item.captain}</td>
                  <td className="px-3 py-3.5 text-slate-650">{item.vCaptain}</td>
                  <td className="px-3 py-3.5 text-slate-650">{item.teacher}</td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-slate-550" />
                    </button>
                    {activeMenuId === item.id && (
                      <div className="absolute right-4 top-10 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-32 animate-in fade-in zoom-in-95 duration-150 text-left">
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(item)}
                          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                        >
                          <Users className="w-3.5 h-3.5 text-teal-600" /> Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenViewDetails(item)}
                          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" /> View
                        </button>
                        <button
                          onClick={() => alert(`Edit house ${item.name}`)}
                          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                        >
                          <Pencil className="w-3.5 h-3.5 text-emerald-500" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 text-xs font-bold text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                    No houses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CREATE HOUSE/BLOCK POPUP MODAL ===== */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Create House/Block</h3>
              <button onClick={() => setCreateModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateHouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">House/Block Name</label>
                  <select
                    value={houseName}
                    onChange={e => setHouseName(e.target.value as any)}
                    className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold"
                  >
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Blue">Blue</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">House/Block Color</label>
                  <input
                    type="text"
                    placeholder="Enter House/Block Color"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Tagline</label>
                  <input
                    type="text"
                    placeholder="Enter Tagline"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">House Teacher</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">House Captain</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={captain}
                    onChange={e => setCaptain(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">House V. Captain</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={vCaptain}
                    onChange={e => setVCaptain(e.target.value)}
                    className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Objective</label>
                <input
                  type="text"
                  placeholder="Enter Objective"
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md text-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ASSIGN MEMBERS POPUP MODAL ===== */}
      {assignModalOpen && selectedHouse && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setAssignModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">Assign House/Block</h3>
              <button onClick={() => setAssignModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAssignMembers} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold font-bold">House/Block Name</label>
                  <input
                    type="text"
                    value={selectedHouse.name}
                    readOnly
                    className="px-3 py-2.5 border rounded-lg bg-slate-100 text-slate-500 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold font-bold">Members</label>
                  <input
                    type="text"
                    value={selectedHouse.members}
                    readOnly
                    className="px-3 py-2.5 border rounded-lg bg-slate-100 text-slate-500 font-bold outline-none"
                  />
                </div>
              </div>

              {/* Fetch toggle */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Fetch only unassigned/unallocated students?</span>
                <button
                  type="button"
                  onClick={() => setAssignMemberCount(assignMemberCount === 5 ? 10 : 5)} // toggle dummy trigger
                  className="relative w-10 h-5 rounded-full transition-colors duration-200 bg-teal-500"
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 left-[22px]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold font-bold">Class</label>
                  <select className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
                    <option value="">Select Class</option>
                    <option value="Class V">Class V</option>
                    <option value="Class VI">Class VI</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold font-bold">Section</label>
                  <select className="px-3 py-2.5 border rounded-lg bg-white outline-none font-bold">
                    <option value="">Select Section</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-500 font-bold font-bold">Student</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                    <input type="checkbox" className="accent-teal-600" />
                    <span>Select All</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter Student Name, Roll No."
                  className="px-3 py-2.5 border rounded-lg outline-none font-bold"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md text-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAILS PREVIEW MODAL ===== */}
      {detailsModalOpen && selectedHouse && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setDetailsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-800">{selectedHouse.name} House Info</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>House Captain: <span className="font-bold text-slate-800">{selectedHouse.captain}</span></p>
              <p>V. Captain: <span className="font-bold text-slate-800">{selectedHouse.vCaptain}</span></p>
              <p>House Teacher: <span className="font-bold text-slate-800">{selectedHouse.teacher}</span></p>
              <p>Members Count: <span className="font-bold text-slate-800">{selectedHouse.members}</span></p>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p>Tagline: <span className="italic text-slate-500">{selectedHouse.tagline || 'None'}</span></p>
              <p>Objective: <span className="text-slate-600">{selectedHouse.objective || 'None'}</span></p>
            </div>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
