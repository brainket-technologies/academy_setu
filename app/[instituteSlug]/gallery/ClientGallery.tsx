'use client'

import React, { useState } from 'react'
import { Eye, X } from 'lucide-react'

interface GalleryItem {
  id: number
  image_url: string
  caption?: string
  category?: string
}

export default function ClientGallery({ items }: { items: GalleryItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null)

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean) as string[]))]

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(i => i.category === selectedCategory)

  return (
    <div>
      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0d6efd] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group">
            <div
              onClick={() => setActiveLightboxImg(item.image_url)}
              className="relative h-60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-slate-100 transition-all"
            >
              <img
                src={item.image_url}
                alt={item.caption || 'Campus photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Eye hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white text-[#0d6efd] flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>
            {item.caption && (
              <p className="text-center text-slate-600 text-xs font-semibold mt-2.5 line-clamp-1">
                {item.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveLightboxImg(null)}
        >
          <button
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-5 right-5 text-white hover:text-slate-300 p-2 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={activeLightboxImg}
            alt="Expanded view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
