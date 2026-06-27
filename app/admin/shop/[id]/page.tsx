'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Edit3, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  mrp_price: string | number
  sell_price: string | number
  colors: string[]
  sizes: string[]
  features: string[]
}

const colorMap: Record<string, string> = {
  'Royal Brown': '#594933',
  'Light Grey': '#E5E7EB',
  'Blue': '#3B82F6',
  'Dark Blue': '#1E293B',
  'Black': '#000000',
  'White': '#FFFFFF',
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Interactive UI states
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return
      try {
        const res = await fetch(`/api/admin/shop/products/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
          // Pre-select first color/size
          if (data.data.colors?.length) setSelectedColor(data.data.colors[0])
          if (data.data.sizes?.length) setSelectedSize(data.data.sizes[0])
        } else {
          toast.error(data.error || 'Failed to load product details')
          router.push('/admin/shop')
        }
      } catch (err) {
        console.error(err)
        toast.error('Error loading product details')
        router.push('/admin/shop')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.id, router])

  const handlePrevImage = () => {
    if (!product?.images?.length) return
    setActiveImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!product?.images?.length) return
    setActiveImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </AdminLayout>
    )
  }

  if (!product) return null

  const mrp = Number(product.mrp_price)
  const sell = Number(product.sell_price)
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600']

  return (
    <AdminLayout>
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/shop')}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Details</h1>
        </div>
        <Link
          href={`/admin/shop/edit-product/${product.id}`}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 dark:border-slate-750 flex items-center justify-center group shadow-inner">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover select-none"
            />
            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'border-teal-500 scale-95 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product details info */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 leading-snug">
              Product Name : {product.name.replace(/^Product Name \d+\s*(:\s*)?/, '')}
            </h2>
            
            {/* Prices */}
            <div className="flex items-baseline gap-4 py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-base text-slate-400 dark:text-slate-500 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                ₹{sell.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-655 dark:text-slate-400 text-sm leading-relaxed text-justify">
              {product.description}
            </p>
          </div>

          {/* Key Features */}
          {product.features?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider mb-3">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-655 dark:text-slate-400 font-semibold">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color circular selections */}
          {product.colors?.length > 0 && (
            <div className="py-2">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-350 tracking-wide mb-3">
                Color : <span className="font-extrabold text-slate-900 dark:text-white">{selectedColor}</span>
              </h3>
              <div className="flex gap-3">
                {product.colors.map(color => {
                  const hex = colorMap[color] || '#cbd5e1'
                  const isWhite = hex === '#FFFFFF'
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 border relative ${
                        isWhite ? 'border-slate-350' : 'border-transparent'
                      } ${selectedColor === color ? 'ring-2 ring-teal-500 ring-offset-2 scale-105' : 'hover:scale-105'}`}
                      style={{ backgroundColor: hex }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check className={`w-4 h-4 ${isWhite ? 'text-slate-900' : 'text-white'}`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size selections */}
          {product.sizes?.length > 0 && (
            <div className="py-2">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-350 tracking-wide mb-3">
                Size : <span className="font-extrabold text-slate-900 dark:text-white">{selectedSize}</span>
              </h3>
              <div className="flex gap-2.5 flex-wrap">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-10 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
