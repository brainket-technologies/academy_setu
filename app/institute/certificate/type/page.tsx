'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, Eye, X, Award, Printer, CheckCircle2, Sparkles, Filter } from 'lucide-react'
import Link from 'next/link'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4 
} from '@/components/certificates/CertificateTemplates'
import { fetchCertificateTypes, deleteCertificateType } from '../actions'

interface CertificateTypeItem {
  id: number
  title: string
  subtitle?: string
  prefix: string
  startNo: string
  classes: string[]
  designId: 1 | 2 | 3 | 4
  designName: string
  themeColor?: string
  schoolName?: string
  principalName?: string
  date: string
  time: string
}

export default function CertificateTypePage() {
  const [types, setTypes] = useState<CertificateTypeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewItem, setPreviewItem] = useState<CertificateTypeItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load from PostgreSQL
  useEffect(() => {
    loadTypes()
  }, [])

  const loadTypes = async () => {
    setLoading(true)
    try {
      const res = await fetchCertificateTypes()
      if (res.success && Array.isArray(res.data)) {
        const formatted: CertificateTypeItem[] = res.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || 'Official Institutional Recognition',
          prefix: item.prefix || 'CER/',
          startNo: item.startNo || '101',
          classes: Array.isArray(item.classes) && item.classes.length > 0 ? item.classes : ['All Classes'],
          designId: (Number(item.designId) || 1) as 1 | 2 | 3 | 4,
          designName: `Design ${item.designId || 1}`,
          themeColor: item.themeColor || item.titleBgColor || '#1E3A8A',
          schoolName: item.schoolName,
          principalName: item.principalName,
          date: item.date || new Date().toLocaleDateString('en-GB'),
          time: item.time || '11:00 AM'
        }))
        setTypes(formatted)
      } else {
        setTypes([])
      }
    } catch (e) {
      console.error(e)
      setTypes([])
    } finally {
      setLoading(false)
    }
  }

  // Delete a certificate type
  const handleDelete = async (id: any) => {
    setTypes(prev => prev.filter(item => item.id !== id))
    try {
      await deleteCertificateType(String(id))
    } catch (e) {}
    setToastMessage('Certificate Type removed from PostgreSQL database.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter types by search
  const filteredTypes = types.filter(item => {
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.prefix.toLowerCase().includes(query) ||
      item.classes.some(c => c.toLowerCase().includes(query))
    )
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Setup Certificate</span>
            <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-600 px-2.5 py-0.5 rounded-full font-bold">
              {types.length} Templates
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure certificate categories, serial numbering, and multiple applicable classes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, Prefix, Class..." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
            />
          </div>
          <Link 
            href="/institute/certificate" 
            className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs text-xs font-bold"
          >
            <Award className="w-4 h-4 text-slate-500" />
            <span>Generate Certificate</span>
          </Link>
          <Link 
            href="/institute/certificate/type/create" 
            className="px-3.5 h-9 flex items-center gap-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Certificate Type</span>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 text-left">S. No.</th>
                <th className="px-4 py-4 text-left">Certificate Title & Subtitle</th>
                <th className="px-4 py-4">Prefix / Serial</th>
                <th className="px-4 py-4 text-left">Applicable Classes</th>
                <th className="px-4 py-4">Certificate Design</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                    No certificate types found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTypes.map((item, i) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 text-left text-slate-500 font-medium">{i + 1}.</td>
                    
                    {/* Title */}
                    <td className="px-4 py-4 text-left">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.subtitle}</div>
                    </td>

                    {/* Prefix & Start No */}
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {item.prefix}{item.startNo}
                      </span>
                    </td>

                    {/* Multiple Applicable Classes */}
                    <td className="px-4 py-4 text-left">
                      <div className="flex flex-wrap items-center gap-1 max-w-xs">
                        {item.classes.slice(0, 3).map((cls, idx) => (
                          <span key={idx} className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {cls}
                          </span>
                        ))}
                        {item.classes.length > 3 && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            +{item.classes.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Certificate Design & Theme Palette Swatch */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-teal-500 hover:bg-teal-50/50 transition-all shadow-xs"
                          title="Click to view full certificate design preview"
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                            style={{ backgroundColor: item.themeColor || '#1E3A8A' }}
                          />

                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 flex items-center gap-1">
                            <span>Design {item.designId}</span>
                            <Eye className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">🗓 {item.date}</span>
                        <span>🕒 {item.time}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setPreviewItem(item)}
                          title="Preview Certificate Design"
                          className="w-7 h-7 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link 
                          href={`/institute/certificate/type/create?id=${item.id}`}
                          title="Edit Certificate Type"
                          className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          title="Delete Certificate Type"
                          className="w-7 h-7 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filteredTypes.length} of {types.length} Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* ─── FULL HIGH-RESOLUTION CERTIFICATE PREVIEW MODAL ─── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                  <span>{previewItem.title}</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    {previewItem.designName}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Prefix: <strong className="font-mono text-slate-700 dark:text-slate-300">{previewItem.prefix}{previewItem.startNo}</strong> • Applicable to: {previewItem.classes.join(', ')}
                </p>
              </div>

              <button 
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Certificate Viewport */}
            <div className="p-8 flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 min-h-[460px] overflow-hidden">
              <div 
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ transform: 'scale(0.72)', transformOrigin: 'center' }}
              >
                {previewItem.designId === 1 && (
                  <CertificateDesign1 
                    title={previewItem.title} 
                    subtitle={previewItem.subtitle} 
                    themeColor={previewItem.themeColor}
                    schoolName={previewItem.schoolName}
                    principalName={previewItem.principalName}
                  />
                )}
                {previewItem.designId === 2 && (
                  <CertificateDesign2 
                    title={previewItem.title} 
                    subtitle={previewItem.subtitle} 
                    themeColor={previewItem.themeColor}
                    schoolName={previewItem.schoolName}
                    principalName={previewItem.principalName}
                  />
                )}
                {previewItem.designId === 3 && (
                  <CertificateDesign3 
                    title={previewItem.title} 
                    subtitle={previewItem.subtitle} 
                    themeColor={previewItem.themeColor}
                    schoolName={previewItem.schoolName}
                    principalName={previewItem.principalName}
                  />
                )}
                {previewItem.designId === 4 && (
                  <CertificateDesign4 
                    title={previewItem.title} 
                    subtitle={previewItem.subtitle} 
                    themeColor={previewItem.themeColor}
                    schoolName={previewItem.schoolName}
                    principalName={previewItem.principalName}
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Standard Printable Format • 300 DPI Landscape High-Definition
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/institute/certificate/type/create"
                  className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5 text-teal-600" />
                  Customize Setup
                </Link>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Sample
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-5 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
    </div>
  )
}
