'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
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

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: Product | null
}

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [mrpPrice, setMrpPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([''])

  // Tag inputs
  const [colorInput, setColorInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')

  // Sync data when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || '')
        setDescription(product.description || '')
        setImages(product.images || [])
        setMrpPrice(String(product.mrp_price || ''))
        setSellPrice(String(product.sell_price || ''))
        setColors(product.colors || [])
        setSizes(product.sizes || [])
        setFeatures(product.features?.length ? product.features : [''])
      } else {
        // Reset form for adding product
        setName('')
        setDescription('')
        setImages([])
        setMrpPrice('')
        setSellPrice('')
        setColors([])
        setSizes([])
        setFeatures([''])
      }
    }
  }, [isOpen, product])

  // Computed savings
  const savingAmount = React.useMemo(() => {
    const mrp = parseFloat(mrpPrice)
    const sell = parseFloat(sellPrice)
    if (!isNaN(mrp) && !isNaN(sell) && mrp > sell) {
      return mrp - sell
    }
    return 0
  }, [mrpPrice, sellPrice])

  if (!isOpen) return null

  // Feature actions
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features]
    updated[index] = val
    setFeatures(updated)
  }

  const addFeatureLine = () => {
    setFeatures(prev => [...prev, ''])
  }

  const removeFeatureLine = (index: number) => {
    if (features.length === 1) {
      setFeatures([''])
      return
    }
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  // Tags actions
  const addColor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!colorInput.trim()) return
    if (colors.includes(colorInput.trim())) {
      toast.error('Color already added')
      return
    }
    setColors(prev => [...prev, colorInput.trim()])
    setColorInput('')
  }

  const removeColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color))
  }

  const addSize = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sizeInput.trim()) return
    if (sizes.includes(sizeInput.trim())) {
      toast.error('Size already added')
      return
    }
    setSizes(prev => [...prev, sizeInput.trim()])
    setSizeInput('')
  }

  const removeSize = (size: string) => {
    setSizes(prev => prev.filter(s => s !== size))
  }

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error('Product Name is required')
    if (!description) return toast.error('Product Description is required')
    if (!mrpPrice || isNaN(parseFloat(mrpPrice))) return toast.error('Valid MRP Price is required')
    if (!sellPrice || isNaN(parseFloat(sellPrice))) return toast.error('Valid Sell Price is required')

    const cleanFeatures = features.filter(f => f.trim() !== '')
    if (cleanFeatures.length === 0) return toast.error('At least one Key Feature is required')

    setSubmitting(true)
    try {
      const url = product ? `/api/admin/shop/products/${product.id}` : '/api/admin/shop/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          images,
          mrp_price: parseFloat(mrpPrice),
          sell_price: parseFloat(sellPrice),
          colors,
          sizes,
          features: cleanFeatures
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while saving product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable Form) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-6">
            
            {/* Product Details Card */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Product Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Product Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter Product Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Product Images Card */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Product Images
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Upload box */}
                <label className="w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-white dark:bg-slate-900 hover:bg-slate-50">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 text-center px-1">Browser or Desktop</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Previews */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-705 group shadow-sm bg-white"
                  >
                    <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-655 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors & Sizes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color list card */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-750">Color</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Color Name"
                      value={colorInput}
                      onChange={e => setColorInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map(color => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-bold"
                      >
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes list card */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3 pb-2 border-b border-slate-100 dark:border-slate-750">Size</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Size"
                      value={sizeInput}
                      onChange={e => setSizeInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Size
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map(size => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-bold"
                      >
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Key Features */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Product Key Features
              </h3>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">
                        Feature Line {idx + 1}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Features"
                        value={feature}
                        onChange={e => handleFeatureChange(idx, e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex gap-1 self-end pb-0.5">
                      <button
                        type="button"
                        onClick={addFeatureLine}
                        className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeatureLine(idx)}
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Price */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-750 pb-2">
                Product Price
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product MRP Price *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={mrpPrice}
                    onChange={e => setMrpPrice(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Product Sell Price *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={sellPrice}
                    onChange={e => setSellPrice(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                    Saving Amount
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Autofill"
                    value={savingAmount > 0 ? `₹${savingAmount.toLocaleString('en-IN')}` : ''}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-750 flex gap-3 justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
